import { Sequelize, DataTypes, Model } from 'sequelize';
import { ObjectType, Field } from 'type-graphql';
import { CalendarEvent } from './CalendarEvent';

interface CreateEventArgs {
  participants?: User[];
  attendees?: User[];
  title: string;
  description: string;
  date: Date;
}

@ObjectType()
export class User extends Model {
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

  @Field()
  get fullName(): string {
    return `${this.fname} ${this.lname}`;
  }

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

export default function initialize(sequelize: Sequelize): void {
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
}
