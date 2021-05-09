import 'reflect-metadata';

import { Sequelize } from 'sequelize';
import {
  initialize,
  User,
  CalendarEvent,
  CalendarEventAttendees,
} from '../src/models';
import CalendarEventResolver from '../src/resolvers/CalendarEventResolver';

import { createMockResolverData } from './utils';

import bcrypt from 'bcrypt';

const users = [] as User[];
let sequelize: Sequelize;
beforeAll(async () => {
  // TODO pull from event variables...
  // TODO this will break when force option is removed from the sync() methods
  try {
    sequelize = await initialize(
      'postgres://testsuper@localhost:5432/test',
      false,
    );
  } catch (err) {
    throw err;
  }

  const password = await bcrypt.hash('password', 10);

  let user;
  // TODO use faker to create this fake data
  // TODO then move this logic into a TestUserFactory or something
  // Create some new users
  user = await User.create({
    fname: 'Test',
    lname: 'User',
    email: 'testuser@test.com',
    password: password,
  });
  users.push(user);

  user = await User.create({
    fname: 'Tester',
    lname: 'Userer',
    email: 'testuser2@test.com',
    password: password,
  });
  users.push(user);
});

afterAll(async () => {
  sequelize.close();
});

describe('Create association', () => {
  it('should be created correctly with User.createCalendarEvent', async () => {
    const eventDate = new Date();
    await users[0].createCalendarEvent({
      title: 'Test event',
      description: 'A test event',
      date: eventDate,
    });
    const event = await CalendarEvent.findOne();
    expect(event).not.toBe(null);
    if (event !== null) {
      expect(event.organizerId).toEqual(users[0].id);
      expect(event.date).toEqual(eventDate);
    }
  });
});

describe('Calendar Resolver', () => {
  const resolver = new CalendarEventResolver();

  it('should return associated User models', async () => {
    const event = await CalendarEvent.create({
      organizerId: users[0].id,
      title: 'My test event',
      description: 'A test event',
      date: new Date(),
    });

    await event.addParticipant(users[0]);
    await event.addAttendee(users[1]);

    await event.save();

    const events = await resolver.events();

    expect(events[0].participants.length).toBe(1);
    expect(events[0].participants[0].id).toBe(users[0].id);

    expect(events[0].attendees.length).toBe(1);
    expect(events[0].attendees[0].id).toBe(users[1].id);

    expect(events[0].organizer.id).toBe(users[0].id);
  });

  it('should create a CalendarEvent with correct relationship', async () => {
    const resolverData = createMockResolverData({
      payload: { userId: users[0].id },
    });
    const event = await resolver.createEvent(
      {
        title: 'Hello world',
        description: 'a test event',
        date: new Date(),
      },
      resolverData.context,
    );
    expect(event.organizerId).toEqual(users[0].id);
  });

  it.todo('returns meaningful error when no user is found');
  it('should create an confirmed attendance record', async () => {
    const resolverData = createMockResolverData({
      payload: { userId: users[1].id },
    });
    const event = await CalendarEvent.findOne();

    if (!event) throw new Error('no events found');

    const res = await resolver.attendCalendarEvent(
      event.id,
      resolverData.context,
    );
    const record = await CalendarEventAttendees.findOne({
      where: {
        userId: users[1].id,
        eventId: event.id,
      },
    });

    if (!record) throw new Error('no attendance record found');

    expect(res).toBe('OK');
    expect(record).not.toBe(null);
    expect(record.status).toBe('confirmed');
  });
});
