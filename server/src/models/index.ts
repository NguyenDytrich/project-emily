import { Sequelize } from 'sequelize';

import initCalendar from './CalendarEvent';
import initUser from './User';
import { associate, synchronize } from './Associate';

export interface InitArgs {
  logging?: boolean | (() => void);
  force?: boolean;
}

export async function initialize(
  url: string,
  args?: InitArgs,
): Promise<Sequelize> {
  const sequelize = new Sequelize(url, { logging: args?.logging });

  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error(err);
    throw err;
  }

  initUser(sequelize);
  initCalendar(sequelize);
  await synchronize(args);

  await associate();

  // Sync new associations
  await synchronize(args);
  return sequelize;
}

export { User } from './User';
export {
  AttendeeStatus,
  CalendarEvent,
  CalendarEventAttendees,
  CalendarEventParticipants,
} from './CalendarEvent';
