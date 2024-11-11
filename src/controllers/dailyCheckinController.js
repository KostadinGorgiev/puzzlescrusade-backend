const moment = require("moment");
const db = require("../database/models");
const levelConfig = require("../config/config.json");

module.exports = {
  claimBonus: async function (req, res) {
    const { id } = req.body;

    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });

      if (user) {
        let dailyCheckIn = await db.DailyCheckIn.findOne({
          where: { user_id: user.id },
        });
        const currentDate = moment().date();
        const lastCheckinDate = moment(
          dailyCheckIn.dataValues.last_check_in,
          "YYYY-MM-DD"
        ).date();
        const currentMonth = moment().month();
        const lastCheckinMonth = moment(
          dailyCheckIn.dataValues.last_check_in,
          "YYYY-MM-DD"
        ).month();
        const currentYear = moment().year();
        const lastCheckinYear = moment(
          dailyCheckIn.dataValues.last_check_in,
          "YYYY-MM-DD"
        ).year();

        if (
          moment([currentYear, currentMonth, currentDate]).isSame(
            moment([lastCheckinYear, lastCheckinMonth, lastCheckinDate]),
            "day"
          )
        ) {
          res.send({ success: false, error: "Already cliamed" });
          return;
        } else if (
          moment([currentYear, currentMonth, currentDate]).diff(
            moment([lastCheckinYear, lastCheckinMonth, lastCheckinDate]),
            "day"
          ) === 1
        ) {
          await db.User.update(
            {
              coin_balance:
                user.coin_balance +
                levelConfig.dailyCheckInAmount[
                  dailyCheckIn.dataValues.checkedin_count
                ],
              level_point:
                user.level_point +
                levelConfig.dailyCheckInAmount[
                  dailyCheckIn.dataValues.checkedin_count
                ],
            },
            {
              where: { id: user.id },
            }
          );
          // reset or update daily check in count
          let updateDaliyCheckInCount =
            dailyCheckIn.dataValues.checkedin_count + 1;
          await db.DailyCheckIn.update(
            {
              checkedin_count:
                updateDaliyCheckInCount > 15 ? 0 : updateDaliyCheckInCount,
              last_check_in: moment(),
            },
            {
              where: { user_id: user.id },
            }
          );
        } else if (
          moment([currentYear, currentMonth, currentDate]).diff(
            moment([lastCheckinYear, lastCheckinMonth, lastCheckinDate]),
            "day"
          ) > 1
        ) {
          await db.DailyCheckIn.update(
            {
              checkedin_count: 1,
              last_check_in: moment(),
            },
            {
              where: { user_id: user.id },
            }
          );
          await db.User.update(
            {
              coin_balance:
                user.coin_balance + levelConfig.dailyCheckInAmount[0],
              level_point: user.level_point + levelConfig.dailyCheckInAmount[0],
            },
            {
              where: { id: user.id },
            }
          );
        }
        dailyCheckIn = await db.DailyCheckIn.findOne({
          where: { user_id: user.id },
        });

        res.send({
          success: true,
          message: "Daily bonus claimed",
          dailyCheckIn,
        });
      } else {
        res.send({ success: false, error: "Not found" });
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
};
