import {
  Resolver,
  Query,
  Arg,
  UseMiddleware,
  Mutation,
  Ctx,
  Field,
  InputType,
} from 'type-graphql';
import AppContext from '../AppContext';
import AuthChecker from '../AuthChecker';
import {
  User,
  CalendarEvent,
  CalendarEventAttendees,
  AttendeeStatus,
} from '../models';

@InputType()
class EventDetailsInput {
  @Field()
  public title!: string;

  @Field()
  public description!: string;

  @Field()
  public date!: Date;
}

@Resolver()
export default class CalendarEventResolver {
  @Query((returns) => [CalendarEvent])
  async events(): Promise<CalendarEvent[]> {
    const events = await CalendarEvent.findAll({
      include: [
        { model: User, as: 'participants' },
        { model: User, as: 'attendees' },
        { model: User, as: 'organizer' },
      ],
    });
    return events;
  }

  @Mutation(() => CalendarEvent)
  @UseMiddleware(AuthChecker)
  async createEvent(
    @Arg('details') details: EventDetailsInput,
    @Ctx() ctx: AppContext,
  ): Promise<CalendarEvent> {
    const user = await User.findByPk(ctx.payload?.userId);
    if (!user) {
      // TODO throw a descriptive error
      throw new Error();
    }
    const event = await user.createCalendarEvent(details);
    return event;
  }

  @Mutation(() => String)
  @UseMiddleware(AuthChecker)
  async attendCalendarEvent(
    @Arg('eventId') eventId: number,
    @Ctx() ctx: AppContext,
  ): Promise<string> {
    // TODO repeteating code. Replace.
    const user = await User.findByPk(ctx.payload?.userId);
    if (!user) {
      // TODO throw descriptive error
      throw new Error();
    }
    const event = await CalendarEvent.findByPk(eventId);
    if (!event) throw new Error();
    await event.addAttendee(user);
    const record = await CalendarEventAttendees.findOne({
      where: { userId: user.id, eventId: event.id },
    });
    if (!record) throw new Error(); // TODO
    record.status = AttendeeStatus.Confirmed;
    await record.save();
    return 'OK';
  }

  @Mutation(() => String)
  @UseMiddleware(AuthChecker)
  async addCalendarEventParticipant(
    @Arg('userId') addUserId: number,
    @Arg('eventId') eventId: number,
    @Ctx() ctx: AppContext,
  ): Promise<string> {
    const addUser = await User.findByPk(addUserId);
    if (!addUser) throw new Error();
    const event = await CalendarEvent.findByPk(eventId);
    if (!event) throw new Error();

    if (event.organizerId !== ctx.payload?.userId) {
      throw new Error('Unauthorized');
    }

    await event.addParticipant(addUser);
    await event.save();
    return 'OK';
  }
}
