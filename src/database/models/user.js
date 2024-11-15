"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.Referral, {
        sourceKey: "id",
        foreignKey: "user_id",
      });
      User.hasMany(models.TaskStatus, {
        sourceKey: "id",
        foreignKey: "user_id",
      });
      User.hasMany(models.UserTaskStatus, {
        sourceKey: "id",
        foreignKey: "user_id",
      });
      User.belongsTo(models.Referral, {
        targetKey: "reffered_user_id",
        foreignKey: "id",
      });
      User.hasOne(models.DailyCheckIn, {
        sourceKey: "id",
        foreignKey: "user_id",
      });
      User.hasOne(models.CardClaim, {
        sourceKey: "id",
        foreignKey: "user_id",
      });
      User.hasMany(models.Cards, {
        sourceKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  User.init(
    {
      t_user_id: { type: DataTypes.STRING, allowNull: true },
      first_name: { type: DataTypes.STRING, allowNull: true },
      last_name: { type: DataTypes.STRING, allowNull: true },
      username: { type: DataTypes.STRING, allowNull: true },
      coin_balance: { type: DataTypes.FLOAT, allowNull: true },
      level_point: { type: DataTypes.FLOAT, allowNull: true },
      energy_point: { type: DataTypes.INTEGER, allowNull: true },
      energy_size_level: { type: DataTypes.INTEGER, allowNull: true },
      energy_recovery_level: { type: DataTypes.INTEGER, allowNull: true },
      tap_multipler_level: { type: DataTypes.INTEGER, allowNull: true },
      last_tap_time: { type: DataTypes.DATE, allowNull: true },
      last_notified: { type: DataTypes.DATE, allowNull: true },
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
