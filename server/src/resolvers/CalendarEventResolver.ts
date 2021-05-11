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
   * Deletes an event owned by the current user
   * @param {number} eventId The event's ID
   */
  @Mutation(() => String)
  @UseMiddleware(AuthChecker)
  async deleteEvent(
    @Arg('eventId') eventId: number,
    @Ctx() ctx: AppContext,
  ): Promise<string> {
    const event = await CalendarEvent.findByPk(eventId);
    if (!event) throw new Error('No event found');
    if (ctx.payload?.userId != event.organizerId) {
      // TODO Log attempt?
      throw new Error('Unauthorized');
    } else {
      await event.destroy();
      return 'OK';
    }
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

  @Mutation(() => String)
  @UseMiddleware(AuthChecker)
  async unattendCalendarEvent(
    @Arg('eventId') eventId: number,
    @Ctx() ctx: AppContext,
  ): Promise<string> {
    const attendance = await CalendarEventAttendees.findOne({
      where: {
        eventId,
        userId: ctx.payload?.userId,
      },
    });
    if (!attendance) throw new Error('Not found');
    attendance.status = AttendeeStatus.Cancelled;
    await attendance.save();
    return 'OK';
  }

  /**
   * Marks a user as interested in an event.
   * @param {number} eventId The ID of the event to show interest in
   * @returns {string} 'OK' on successfull operation
   */
  @Mutation(() => String)
  @UseMiddleware(AuthChecker)
  async interestCalendarEvent(
    @Arg('eventId') eventId: number,
    @Ctx() ctx: AppContext,
  ): Promise<string> {
    const event = await CalendarEvent.findByPk(eventId);
    if (!event) throw new Error('No event found');

    await event.addAttendee(ctx.payload?.userId as number);
    const attendance = await CalendarEventAttendees.findOne({
      where: {
        eventId,
        userId: ctx.payload?.userId,
      },
    });
    // TODO better errors
    if (!attendance) throw new Error('Not found');
    attendance.status = AttendeeStatus.Interested;
    await attendance.save();

    return 'OK';
  }

  /**
   * Marks a user as no longer interested in a nevent
   * @param {number} eventId The ID of the event to remove interest from
   */
  @Mutation(() => String)
  @UseMiddleware(AuthChecker)
  async uninterestCalendarEvent(
    @Arg('eventId') eventId: number,
    @Ctx() ctx: AppContext,
  ): Promise<string> {
    const attendance = await CalendarEventAttendees.findOne({
      where: {
        eventId,
        userId: ctx.payload?.userId,
      },
    });
    if (!attendance) throw new Error('No record found');
    attendance.status = AttendeeStatus.InterestCancelled;
    await attendance.save();
    return 'OK';
  }
}
