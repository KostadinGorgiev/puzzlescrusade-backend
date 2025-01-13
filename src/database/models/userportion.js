'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserPortion extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserPortion.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  UserPortion.init({
    user_id: DataTypes.INTEGER,
    recipe_key: DataTypes.STRING,
    count: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserPortion',
  });
  return UserPortion;
};