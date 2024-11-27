const moment = require("moment");
const userController = require("../controllers/userController");
const db = require("../database/models");
const levelConfig = require("../config/config.json");
const { Op } = require("sequelize");

module.exports = {
  complete: async function (req, res) {
    const { user_id, task_id } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: user_id },
    });
    if (user) {
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
        let task = await db.Task.findOne({
          where: {
            id: task_id,
          },
        });
        let createParam = {
          user_id: user.id,
          task_id: task_id,
          status: "claim",
        };
        if (task.password && task.password != "") {
          createParam.status = "verify";
        }
        await db.UserTaskStatus.create(createParam);
      }
      res.send({ success: true, message: "Task completed" });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  verifyPassword: async function (req, res) {
    const { user_id, task_id, password } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: user_id },
    });
    const task = await db.Task.findOne({
      where: { id: task_id },
    });

    if (!user) {
      res.send({ success: false, message: "User not found" });
      return;
    }
    if (!task) {
      res.send({ success: false, message: "Task not found" });
      return;
    }
    if (task.password !== password) {
      res.send({ success: false, message: "Password incorrect" });
      return;
    }

    let userTask = await db.UserTaskStatus.findOne({
      where: {
        user_id: user.id,
        task_id: task_id,
      },
    });
    if (userTask) {
      await db.UserTaskStatus.update(
        {
          status: "claim",
        },
        {
          where: {
            user_id: user.id,
            task_id: task_id,
          },
        }
      );
      res.send({ success: true, message: "Successfully verified" });
      return;
    } else {
      res.send({ success: false, message: "User didn't start task" });
      return;
    }
  },
  claim: async function (req, res) {
    const { user_id, task_id } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: user_id },
    });
    if (user) {
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
    const { title, link, type, bonus_amount, password } = req.body;
    await db.Task.create({
      title,
      link,
      type,
      bonus_amount,
      password,
    });

    return res.send({ success: true });
  },
  update: async function (req, res) {
    const { id, title, link, type, bonus_amount, password } = req.body;
    await db.Task.update(
      {
        title,
        link,
        type,
        bonus_amount,
        password,
      },
      {
        where: {
          id: id,
        },
      }
    );

    return res.send({ success: true });
  },
  delete: async function (req, res) {
    const { ids } = req.body;
    await db.Task.destroy({
      where: {
        id: {
          [Op.in]: ids,
        },
      },
    });

    return res.send({ success: true });
  },
  get: async function (req, res) {
    let response = await db.Task.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.send({ success: true, tasks: response });
  },
  getUsersTask: async function (req, res) {
    let response = await db.UserTaskStatus.findAll({
      order: [["createdAt", "DESC"]],
    });

    return res.send({ success: true, userTasks: response });
  },
};
