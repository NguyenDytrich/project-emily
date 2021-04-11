import { Sequelize, DataTypes, Model } from 'sequelize';

class User extends Model {
  public id!: number;
  public fname!: string;
  public lname!: string;
  public email!: string;
  public password!: string;
  public lastLogin!: string;

  public readonly createdAt!: Date;
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
