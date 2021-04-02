import { Sequelize, DataTypes, Model } from 'sequelize';

class User extends Model {}

async function initialize(url: string): void {
  sequelize = new Sequelize(url);

  try {
    await sequelize.authenticate();
  } catch (err) {
    console.error(err);
    return;
  }

  User.init(
    {
      field: {
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: 'User',
    },
  );
}

export { initialize, User };
