import {
  Sequelize,
  DataTypes,
  Model,
  HasManyGetAssociationsMixin,
  HasManyAddAssociationMixin,
} from 'sequelize';
import { ObjectType, Field } from 'type-graphql';
import { User } from './User';

@ObjectType()
export class CalendarEvent extends Model {
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

  @Field((type) => Date)
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

export default function initialize(sequelize: Sequelize): void {
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
}
