import { DataTypes, Model } from "sequelize";
import sequelize from './index';

interface CommentAttributes {
  id: number;
  userId: number;
  partyId: number;
  content: string;
};

export default class Comment extends Model<CommentAttributes> {
  public readonly id!: number;
  public userId!: number;
  public partyId!: number;
  public content!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {

  };
};

Comment.init(
{
  id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    references: {
      model: {
        tableName: "users"
      },
      key: "id",
    },
    allowNull: false
  },
  partyId: {
    type: DataTypes.INTEGER,
    references: {
      model: {
        tableName: "parties"
      },
      key: "id",
    },
    allowNull: false
  },
  content: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
},
{
  modelName : 'Comment',
  tableName : 'comment',
  sequelize,
  freezeTableName : true,
  timestamps : true,
});