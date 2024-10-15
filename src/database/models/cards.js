"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Cards extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Cards.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  Cards.init(
    {
      user_id: DataTypes.INTEGER,
      card_slug: DataTypes.STRING,
      card_level: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Cards",
    }
  );
  return Cards;
};
