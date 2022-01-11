import { DataTypes, Model } from "sequelize";
import sequelize from './index';

interface FavoriteAttributes {
  id: number;
  userId: number;
  partyId: number;
};

export default class Favorite extends Model<FavoriteAttributes> {
  public readonly id!: number;
  public userId!: number;
  public partyId!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static associations: {

  };
};

Favorite.init(
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
        tableName: "users",
        schema: "",
      },
      key: "id",
    },
    allowNull: false
  },
  partyId: {
    type: DataTypes.INTEGER,
    references: {
      model: {
        tableName: "parties",
        schema: "",
      },
      key: "id",
    },
    allowNull: false
  }
},
{
  modelName : 'Favorite',
  tableName : 'favorite',
  sequelize,
  freezeTableName : true,
  timestamps : true,
});