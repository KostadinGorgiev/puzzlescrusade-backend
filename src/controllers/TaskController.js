const moment = require("moment");
const userController = require("../controllers/userController");
const db = require("../database/models");
const levelConfig = require("../config/config.json");

module.exports = {
  complete: async function (req, res) {
    const { id, task_type } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      let task = await db.TaskStatus.findOne({
        where: {
          user_id: user.id,
          task: task_type,
        },
      });
      if (task) {
        if (task.status === "done") {
          res.send({ success: false, message: "Task already done" });
        } else if (task.status === "claim") {
          res.send({
            success: false,
            message: "Task already completed, need to claim",
          });
        } else {
          res.send({
            success: false,
            message: "Task already exist",
          });
        }
        return;
      } else {
        await db.TaskStatus.create({
          user_id: user.id,
          task: task_type,
          status: "claim",
        });
      }
      res.send({ success: true, message: "Task completed" });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  claim: async function (req, res) {
    const { id, task_type } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      let task = await db.TaskStatus.findOne({
        where: {
          user_id: user.id,
          task: task_type,
        },
      });
      if (task) {
        if (task.status === "done") {
          res.send({ success: false, message: "Task already done" });
        } else if (task.status === "claim") {
          await db.TaskStatus.update(
            {
              status: "done",
            },
            {
              where: {
                user_id: user.id,
                task: task_type,
              },
            }
          );
          await db.User.update(
            {
              coin_balance:
                user.coin_balance + levelConfig.taskBonus[task_type],
              level_point: user.level_point + levelConfig.taskBonus[task_type],
            },
            {
              where: { t_user_id: id },
            }
          );

          res.send({
            success: true,
            message: "Task claimed",
          });
        } else {
          res.send({
            success: false,
            message: "Task need to be completed",
          });
        }
        return;
      } else {
        res.send({ success: false, message: "Task not found" });
      }
      res.send({ success: true, message: "Task claimed" });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  list: async function (req, res) {
    const id = req.query.id;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      let taskLists = await db.TaskStatus.findAll({
        where: {
          user_id: user.id,
        },
      });
      let userData = await userController.getUserData(id);
      res.send({ success: true, list: taskLists, user: userData });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
};
