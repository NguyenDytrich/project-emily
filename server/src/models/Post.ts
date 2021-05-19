import { Sequelize, DataTypes, Model } from Sequelize;

import { Delta } from 'quill-delta';

import { User } from './User';

@ObjectType()
export class Post extends Model {
  @Field()
  public id!: number;

  @Field((type) => User)
  public author: User;

  @Field()
  public delta: Delta;
}

export default function initialize(sequelize: Sequelize): void {
  Posts.init(
    {
      delta: {
        type: DataTypes.ARRAY(DataTypes.JSON),
        nullable: false,
      },
    },
    {
      sequelize,
      underscored: true,
    },
  );
}
