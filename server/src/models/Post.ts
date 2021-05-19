import { Sequelize, DataTypes, Model } from 'sequelize';
import { ObjectType, Field } from 'type-graphql';

import Delta from 'quill-delta';

import { User } from './User';

@ObjectType()
export class Post extends Model {
  @Field()
  public id!: number;

  @Field((type) => User)
  public author!: User;

  @Field()
  public delta!: Delta;
}

export default function initialize(sequelize: Sequelize): void {
  Post.init(
    {
      delta: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        allowNull: false,
      },
    },
    {
      sequelize,
      underscored: true,
    },
  );
}
