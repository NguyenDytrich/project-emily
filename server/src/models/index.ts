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

  public sid!: string;
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

  await User.sync({ force: true });
}

export { initialize, User };
