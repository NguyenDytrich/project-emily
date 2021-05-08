import { Resolver, Query } from 'type-graphql';
import { User, CalendarEvent } from '../models';

@Resolver()
export default class CalendarEventResolver {
  @Query((returns) => [CalendarEvent])
  async events(): Promise<CalendarEvent[]> {
    const events = await CalendarEvent.findAll({
      include: [
        { model: User, as: 'participants' },
        { model: User, as: 'attendees' },
      ],
    });
    return events;
  }
}
