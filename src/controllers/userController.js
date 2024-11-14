const moment = require("moment");
const { Op } = require("sequelize");
const db = require("../database/models");
const levelConfig = require("../config/config.json");
const { fetchUserProfilePhotoUrl } = require("../utils/func");

module.exports = {
  initialize: async function (req, res) {
    const { id, first_name, last_name, username, startParam, isPremium } =
      req.body;
    let isNew = false;
    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });

      if (user) {
        await db.User.update(
          {
            first_name: first_name,
            last_name: last_name,
            username: username,
          },
          {
            where: {
              t_user_id: id,
            },
          }
        );
        let cardClaim = await db.CardClaim.findOne({
          where: {
            user_id: user.id,
          },
        });
        if (!cardClaim) {
          await db.CardClaim.create({
            user_id: user.id,
            last_claim: moment(),
          });
        }
      } else {
        isNew = true;
        let result = await db.User.create({
          t_user_id: id,
          first_name: first_name,
          last_name: last_name,
          username: username,
          coin_balance: 0,
          level_point: 0,
          energy_point: 1500,
          energy_size_level: 0,
          energy_recovery_level: 0,
          tap_multipler_level: 0,
          last_tap_time: moment(),
        });

        await db.DailyCheckIn.create({
          user_id: result.dataValues.id,
          checkedin_count: 0,
          last_check_in: moment().subtract(1, "days"),
        });

        await db.CardClaim.create({
          user_id: result.dataValues.id,
          last_claim: moment(),
        });

        if (startParam) {
          let fromUser = await db.User.findOne({
            where: { t_user_id: startParam.split("ref")[1] },
          });
          if (fromUser) {
            await db.Referral.create({
              user_id: fromUser.dataValues.id,
              reffered_user_id: result.dataValues.id,
            });
            if (isPremium) {
              await db.User.update(
                {
                  coin_balance: fromUser.dataValues.coin_balance + 5000,
                  level_point: fromUser.dataValues.level_point + 5000,
                },
                {
                  where: {
                    id: fromUser.dataValues.id,
                  },
                }
              );
            } else {
              await db.User.update(
                {
                  coin_balance: fromUser.dataValues.coin_balance + 1000,
                  level_point: fromUser.dataValues.level_point + 1000,
                },
                {
                  where: {
                    id: fromUser.dataValues.id,
                  },
                }
              );
            }
          }
        }
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }

    let result = await module.exports.getUserData(id, isNew);
    res.send({ ...result, success: true });
  },
  tap: async function (req, res) {
    const { id, coin_balance, level_point, energy_point } = req.body;

    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });

      if (user) {
        await db.User.update(
          {
            coin_balance: coin_balance,
            level_point: level_point,
            energy_point: energy_point,
            last_tap_time: moment(),
          },
          {
            where: {
              t_user_id: id,
            },
          }
        );
        res.send({ success: true, message: "Updated" });
      } else {
        res.send({ success: false, error: "Not found" });
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
  boost: async function (req, res) {
    const { id, boost_type, energy_point } = req.body;
    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });
      if (user) {
        let updateParam = {
          last_tap_time: moment(),
          energy_point: energy_point,
        };
        let coinsNeed = 0;
        if (boost_type === "energy_size_level") {
          updateParam.energy_size_level = user.energy_size_level + 1;
          coinsNeed = levelConfig.energySize[user.energy_size_level + 1].cost;
        } else if (boost_type === "energy_recovery_level") {
          updateParam.energy_recovery_level = user.energy_recovery_level + 1;
          coinsNeed = levelConfig.recovery[user.energy_recovery_level + 1].cost;
        } else if (boost_type === "tap_multipler_level") {
          updateParam.tap_multipler_level = user.tap_multipler_level + 1;
          coinsNeed =
            levelConfig.tapMultipler[user.tap_multipler_level + 1].cost;
        }

        if (user.coin_balance < coinsNeed) {
          res.send({
            success: false,
            error: `Not enough coins for purchase. current balance: ${user.coin_balance} coins need: (${coinsNeed})`,
          });
          return;
        } else {
          updateParam.coin_balance = user.coin_balance - coinsNeed;
        }

        if (user) {
          await db.User.update(updateParam, {
            where: {
              t_user_id: id,
            },
          });
          res.send({ success: true, message: "Purchase success" });
        } else {
          res.send({ success: false, error: "Not found" });
        }
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
  getReferral: async function (req, res) {
    const { id, page } = req.body;
    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });
      if (user) {
        const results = await db.Referral.findAll({
          where: {
            user_id: user.id,
          },
          include: [
            {
              model: db.User,
              required: false,
              attributes: [
                "id",
                "t_user_id",
                "first_name",
                "last_name",
                "username",
                "coin_balance",
                "level_point",
              ],
            },
          ],
          order: [[{ model: db.User }, "level_point", "DESC"]],
          limit: 5,
          offset: (page - 1) * 5,
        });

        if (process.env.IS_LOCAL !== "true") {
          for (let index = 0; index < results.length; index++) {
            results[index].User.photo_url = await fetchUserProfilePhotoUrl(
              process.env.BOT_TOKEN,
              results[index].User.t_user_id
            );
          }
        }
        res.send({ success: true, results });
      } else {
        res.send({ success: false, error: "Not found" });
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
  getUserData: async function (id, isNew = false) {
    // only for existing
    const user = await db.User.findOne({
      where: {
        t_user_id: id,
      },
      include: [
        {
          model: db.Referral,
          required: false,
          include: [
            {
              model: db.User,
              required: false,
              attributes: [
                "id",
                "t_user_id",
                "first_name",
                "last_name",
                "username",
                "coin_balance",
                "level_point",
              ],
            },
          ],
          order: [[{ model: db.User }, "level_point", "DESC"]],
          limit: 5,
        },
        {
          model: db.TaskStatus,
          required: false,
        },
        {
          model: db.UserTaskStatus,
          required: false,
        },
        {
          model: db.DailyCheckIn,
          required: true,
        },
        {
          model: db.CardClaim,
          required: true,
        },
        {
          model: db.Cards,
          required: false,
        },
      ],
    });

    let result = user.get({ plain: true });

    let userEnergySize = levelConfig.energySize[result.energy_size_level];
    let userRecoveryLevel = levelConfig.recovery[result.energy_recovery_level];
    let passedTime = moment().diff(moment(result.last_tap_time), "second");

    let energyRecovered =
      (userEnergySize.to * passedTime) / (userRecoveryLevel.to * 60);

    result.energy_point = parseInt(
      userEnergySize.to > result.energy_point + energyRecovered
        ? result.energy_point + energyRecovered
        : userEnergySize.to
    );
    if (process.env.IS_LOCAL !== "true") {
      result.photo_url = await fetchUserProfilePhotoUrl(
        process.env.BOT_TOKEN,
        result.t_user_id
      );
    }

    if (process.env.IS_LOCAL !== "true") {
      for (let index = 0; index < result.Referrals.length; index++) {
        result.Referrals[index].User.photo_url = await fetchUserProfilePhotoUrl(
          process.env.BOT_TOKEN,
          result.Referrals[index].User.t_user_id
        );
      }
    }

    result.total_referral_count = await db.Referral.count({
      where: {
        user_id: result.id,
      },
    });

    return { ...result, serverTime: moment(), isNew };
  },
  getActiveUsers: async function (usersMap) {
    const ids = Object.keys(usersMap);
    const users = await db.User.findAll({
      where: {
        t_user_id: {
          [Op.in]: ids,
        },
      },
    });
    return users;
  },
};
