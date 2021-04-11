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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      lastLogin: {
        type: DataTypes.STRING,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      // No password on retrieval by default
      defaultScope: {
        attributes: {
          exclude: ['password'],
        },
      },
      scopes: {
        auth: {
          attributes: {
            include: ['password'],
          },
        },
      },
      sequelize,
      modelName: 'User',
    },
  );
  await User.sync();
}

export { initialize, User };
