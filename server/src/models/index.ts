import { Sequelize, DataTypes, Model } from 'sequelize';
import { ObjectType, Field } from 'type-graphql';

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
}

enum EventStatus {
  Interested = 'interested',
  Confirmed = 'confirmed',
  Cancelled = 'cancelled',
}

class CalendarEventAttendees extends Model {
  @Field()
  public userId!: number;

  @Field()
  public eventId!: number;

  @Field()
  public status!: EventStatus;
}

async function initialize(url: string): Promise<void> {
  const sequelize = new Sequelize(url);

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
        type: DataTypes.ENUM('interested', 'confirmed', 'cancelled'),
        defaultValue: 'interested',
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

  CalendarEvent.belongsToMany(User, { through: 'CalendarEventParticipants' });
  User.belongsToMany(CalendarEvent, { through: 'CalendarEventParticipants' });

  CalendarEvent.belongsToMany(User, { through: CalendarEventAttendees });
  User.belongsToMany(CalendarEvent, { through: CalendarEventAttendees });

  CalendarEvent.belongsTo(User, {
    foreignKey: 'organizerId',
  });
}

export { initialize, User };
