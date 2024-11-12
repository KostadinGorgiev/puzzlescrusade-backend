const moment = require("moment");
const userController = require("../controllers/userController");
const db = require("../database/models");
const levelConfig = require("../config/config.json");

module.exports = {
  complete: async function (req, res) {
    const { user_id, task_type, dynamic, task_id } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: user_id },
    });
    if (user) {
      if (dynamic) {
        let userTask = await db.UserTaskStatus.findOne({
          where: {
            user_id: user.id,
            task_id: task_id,
          },
        });
        if (userTask) {
          if (userTask.status === "done") {
            res.send({ success: false, message: "Task already done" });
          } else if (userTask.status === "claim") {
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
          await db.UserTaskStatus.create({
            user_id: user.id,
            task_id: task_id,
            status: "claim",
          });
        }
      } else {
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
      }
      res.send({ success: true, message: "Task completed" });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  claim: async function (req, res) {
    const { user_id, task_type, dynamic, task_id } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: user_id },
    });
    if (user) {
      if (dynamic) {
        let userTask = await db.UserTaskStatus.findOne({
          where: {
            user_id: user.id,
            task_id: task_id,
          },
        });
        if (userTask) {
          if (userTask.status === "done") {
            res.send({ success: false, message: "Task already done" });
          } else if (userTask.status === "claim") {
            let dTask = await db.Task.findOne({
              where: {
                id: task_id,
              },
            });
            if (dTask) {
              await db.UserTaskStatus.update(
                {
                  status: "done",
                },
                {
                  where: {
                    user_id: user.id,
                    task_id: task_id,
                  },
                }
              );
              await db.User.update(
                {
                  coin_balance: user.coin_balance + dTask.bonus_amount,
                  level_point: user.level_point + dTask.bonus_amount,
                },
                {
                  where: { t_user_id: user_id },
                }
              );

              res.send({
                success: true,
                message: "Task claimed",
              });
            } else {
              res.send({
                success: false,
                message: "Task not exist",
              });
            }
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
      } else {
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
                level_point:
                  user.level_point + levelConfig.taskBonus[task_type],
              },
              {
                where: { t_user_id: user_id },
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
  add: async function (req, res) {
    const { title, link, type, bonus_amount } = req.body;
    await db.Task.create({
      title,
      link,
      type,
      bonus_amount,
    });

    return res.send({ success: true });
  },
  get: async function (req, res) {
    let response = await db.Task.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.send({ success: true, tasks: response });
  },
};
