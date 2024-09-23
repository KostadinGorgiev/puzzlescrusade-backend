"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DailyCheckIn extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      DailyCheckIn.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  DailyCheckIn.init(
    {
      user_id: DataTypes.INTEGER,
      checkedin_count: DataTypes.INTEGER,
      last_check_in: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "DailyCheckIn",
    }
  );
  return DailyCheckIn;
};
