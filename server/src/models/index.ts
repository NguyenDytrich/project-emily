import {
  Sequelize,
  DataTypes,
  Model,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
} from 'sequelize';
import { ObjectType, Field } from 'type-graphql';

interface CreateEventArgs {
  participants?: User[];
  attendees?: User[];
  title: string;
  description: string;
  date: Date;
}

@ObjectType()
class User extends Model {
  @Field()
  public id!: number;

  @Field()
  public fname!: string;

  @Field()
  public lname!: string;

  @Field()
  public email!: string;
  public password!: string;
  public lastLogin!: string;

  @Field()
  public readonly createdAt!: Date;

  @Field()
  public readonly updatedAt!: Date;

  public sid!: string | null;

  public async createCalendarEvent(
    args: CreateEventArgs,
  ): Promise<CalendarEvent> {
    const { title, description, date, participants, attendees } = args;

    // TODO wrap in a transaction
    const event = await CalendarEvent.create({
      organizerId: this.id,
      title,
      description,
      date,
    });

    if (participants && participants.length > 0) {
      for (const p of participants) {
        await event.addParticipant(p);
      }
    }

    if (attendees && attendees.length > 0) {
      for (const a of attendees) {
        await event.addAttendee(a);
      }
    }

    await event.save();
    return event;
  }
}

@ObjectType()
class CalendarEvent extends Model {
  @Field()
  public id!: number;

  // TODO can be an organizer or an organization?
  @Field()
  public organizer!: User;

  @Field((type) => [User])
  public participants!: User[];

  @Field((type) => [User])
  public attendees!: User[];

  @Field()
  public description!: string;

  @Field()
  public date!: number;

  @Field()
  public title!: string;

  public organizerId!: number;

  public getParticipants!: HasManyGetAssociationsMixin<User>;
  public addParticipant!: HasManyAddAssociationMixin<User, number>;

  public getAttendees!: HasManyGetAssociationsMixin<User>;
  public addAttendee!: HasManyAddAssociationMixin<User, number>;
}

export enum AttendeeStatus {
  Interested = 'interested',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
  InterestCancelled = 'interest_cancelled',
}

export class CalendarEventAttendees extends Model {
  public userId!: number;
  public eventId!: number;
  public status!: AttendeeStatus;
}

export class CalendarEventParticipants extends Model {
  public userId!: number;
  public eventId!: number;
  public confirmed!: boolean;
}

async function initialize(
  url: string,
  logging?: boolean | (() => void),
): Promise<Sequelize> {
  const sequelize = new Sequelize(url, { logging });

  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error(err);
    throw err;
  }

  User.init(
    {
      fname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lname: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      // TODO I think Sequelize has an email field?
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      // TODO change to date
      lastLogin: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sid: {
        type: DataTypes.UUID,
        allowNull: true,
        unique: true,
      },
    },
    {
      // No password on retrieval by default
      defaultScope: {
        attributes: {
          exclude: ['password', 'sid'],
        },
      },
      scopes: {
        auth: {
          attributes: {
            include: ['password', 'sid'],
          },
        },
      },
      sequelize,
      modelName: 'User',
      underscored: true,
    },
  );

  CalendarEvent.init(
    {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      organizerId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'id',
        },
      },
    },
    {
      sequelize,
      underscored: true,
    },
  );

  CalendarEventAttendees.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'id',
        },
      },
      eventId: {
        type: DataTypes.INTEGER,
        references: {
          model: CalendarEvent,
          key: 'id',
        },
      },
      status: {
        type: DataTypes.ENUM(
          'interested',
          'confirmed',
          'cancelled',
          'interest_cancelled',
        ),
        defaultValue: 'interested',
      },
    },
    {
      sequelize,
      underscored: true,
    },
  );

  CalendarEventParticipants.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        references: {
          model: User,
          key: 'id',
        },
      },
      eventId: {
        type: DataTypes.INTEGER,
        references: {
          model: CalendarEvent,
          key: 'id',
        },
      },
      confirmed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      underscored: true,
    },
  );

  // Development
  await User.sync({ force: true });
  await CalendarEvent.sync({ force: true });
  await CalendarEventAttendees.sync({ force: true });
  await CalendarEventParticipants.sync({ force: true });

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
  await User.sync({ force: true });
  await CalendarEvent.sync({ force: true });
  await CalendarEventAttendees.sync({ force: true });

  return sequelize;
}

export { initialize, User, CalendarEvent };
