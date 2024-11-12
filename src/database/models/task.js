"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Task.belongsTo(models.UserTaskStatus, {
        targetKey: "task_id",
        foreignKey: "id",
      });
    }
  }
  Task.init(
    {
      title: DataTypes.STRING,
      link: DataTypes.STRING,
      type: DataTypes.STRING,
      bonus_amount: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Task",
    }
  );
  return Task;
};
