import { Sequelize } from 'sequelize';

import initCalendar from './CalendarEvent';
import initUser from './User';
import { User } from './User';
import {
  AttendeeStatus,
  CalendarEvent,
  CalendarEventAttendees,
  CalendarEventParticipants,
} from './CalendarEvent';

interface InitArgs {
  logging?: boolean | (() => void);
  force?: boolean;
}

async function initialize(url: string, args?: InitArgs): Promise<Sequelize> {
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

  // Associations
  CalendarEvent.belongsToMany(User, {
    as: 'participants',
    through: CalendarEventParticipants,
    foreignKey: 'event_id',
  });
  User.belongsToMany(CalendarEvent, { through: CalendarEventParticipants });

  CalendarEvent.belongsToMany(User, {
    as: 'attendees',
    through: CalendarEventAttendees,
    foreignKey: 'event_id',
  });
  User.belongsToMany(CalendarEvent, { through: CalendarEventAttendees });

  CalendarEvent.belongsTo(User, {
    as: 'organizer',
    foreignKey: 'organizer_id',
    targetKey: 'id',
  });
  User.hasMany(CalendarEvent, {
    as: 'organized_events',
    sourceKey: 'id',
    foreignKey: 'organizer_id',
  });

  // Sync new associations
  await synchronize(args);
  return sequelize;
}

async function synchronize(args?: InitArgs) {
  // Development
  const opts = { force: args?.force ?? false };
  await User.sync(opts);
  await CalendarEvent.sync(opts);
  await CalendarEventAttendees.sync(opts);
  await CalendarEventParticipants.sync(opts);
}

export {
  initialize,
  User,
  AttendeeStatus,
  CalendarEvent,
  CalendarEventParticipants,
  CalendarEventAttendees,
};
