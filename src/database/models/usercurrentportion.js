"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserCurrentPortion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserCurrentPortion.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  UserCurrentPortion.init(
    {
      user_id: DataTypes.INTEGER,
      current_recipe: DataTypes.STRING,
      current_ingredient_index: DataTypes.INTEGER,
      wrong_attempt_count: DataTypes.INTEGER,
      wrong_attempt_time: DataTypes.DATE,
      is_crafted: DataTypes.BOOLEAN,
      craft_time: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "UserCurrentPortion",
    }
  );
  return UserCurrentPortion;
};
