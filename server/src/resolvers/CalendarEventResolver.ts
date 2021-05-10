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
  /**
   * @returns a list of all calendar events.
   */
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

  /**
   * Creates a new event owned by the context's user
   * @param {string} Title the event's title
   * @param {string} description The event's description
   * @param {Date} date The date of the event
   */
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

  /**
   * Adds the current user to a list of attendees for an event. They will be marked as 'confirmed'.
   * @param {number} eventId the id of the event
   */
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

  /**
   * Adds a user to a list of participants for an event. Only the event owner can change participants.
   * @param {number} userId The ID of the user to add as a participant
   * @param {number} eventId The ID of the event to add a participant to
   * @throws {Error} When no user can be found by the passed userId
   * @throws {Error} When no calendar event ca nbe found by passed eventId
   * @throws {Error} If the event is not owned by the current user
   */
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
