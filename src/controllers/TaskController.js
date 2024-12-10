const moment = require("moment");
const userController = require("../controllers/userController");
const db = require("../database/models");
const TelegramBot = require("node-telegram-bot-api");
const levelConfig = require("../config/config.json");
const { Op } = require("sequelize");
const { getTelegramGroupId, checkTelegramUser } = require("../utils/func");

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
    if (task.password.toLowerCase() !== password.toLowerCase()) {
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
            if (dTask.type == "telegram") {
              let chatId = dTask.link.split("https://t.me/")[1];
              // console.log(process.env.BOT_TOKEN, user.t_user_id, chatId);

              const isMemeber = await checkTelegramUser(
                process.env.BOT_TOKEN,
                user.t_user_id,
                chatId
              );
              if (!isMemeber) {
                res.send({
                  success: false,
                  tgMember: false,
                  message: "Didn't join telegram group",
                });
                return;
              }
            }
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
    const { title, link, type, bonus_amount, password, question } = req.body;
    await db.Task.create({
      title,
      link,
      type,
      bonus_amount,
      password,
      question,
    });

    return res.send({ success: true });
  },
  update: async function (req, res) {
    const { id, title, link, type, bonus_amount, password, question } =
      req.body;
    await db.Task.update(
      {
        title,
        link,
        type,
        bonus_amount,
        password,
        question,
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
  testFunction: async function (req, res) {
    let group = await getTelegramGroupId(
      process.env.BOT_TOKEN,
      "puzzlescrusade"
    );

    const bot = new TelegramBot(process.env.BOT_TOKEN);

    // Replace with your group chat ID and user ID
    const chatId = group.id; // e.g., -123456789
    const userId = "6469354442"; // e.g., 123456789

    try {
      const chatMember = await bot.getChatMember(chatId, userId);
      console.log("group = ", chatMember);
      if (
        chatMember.status === "member" ||
        chatMember.status === "administrator" ||
        chatMember.status === "creator"
      ) {
        console.log(`${userId} is a member of the group.`);
      } else {
        console.log(`${userId} is not a member of the group.`);
      }
    } catch (error) {
      if (error.response && error.response.error_code === 400) {
        console.log(
          "The user is not in the group or the bot doesn't have permission to see this information."
        );
      } else {
        console.error("An error occurred:", error);
      }
    }
    res.send({ success: true });
  },
};
