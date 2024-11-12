"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserTaskStatus extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      UserTaskStatus.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "user_id",
      });
      UserTaskStatus.hasOne(models.Task, {
        sourceKey: "task_id",
        foreignKey: "id",
      });
    }
  }
  UserTaskStatus.init(
    {
      user_id: DataTypes.INTEGER,
      task_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "UserTaskStatus",
    }
  );
  return UserTaskStatus;
};
