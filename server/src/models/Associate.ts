import {
  User,
  CalendarEvent,
  CalendarEventAttendees,
  CalendarEventParticipants,
  Post,
  InitArgs,
} from './index';

export async function associate(): Promise<void> {
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

  User.hasMany(Post, {
    sourceKey: 'id',
    foreignKey: 'author_id',
  });
  Post.belongsTo(User, {
    as: 'author',
  });
}

export async function synchronize(args?: InitArgs): Promise<void> {
  // Development
  const opts = { force: args?.force ?? false };
  await User.sync(opts);
  await CalendarEvent.sync(opts);
  await CalendarEventAttendees.sync(opts);
  await CalendarEventParticipants.sync(opts);
}
