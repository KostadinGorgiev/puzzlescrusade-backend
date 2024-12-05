const moment = require("moment");
const userController = require("./userController");
const db = require("../database/models");
const levelConfig = require("../config/config.json");
const { Op } = require("sequelize");
const { userLevel } = require("../utils/func");

module.exports = {
  getUserReports: async function (req, res) {
    const page = req.query.page || 1;
    const levelPoint = req.query.level_point;

    let where = {};
    if (levelPoint) {
      let level = userLevel(levelPoint);
      where = {
        level_point: {
          [Op.gte]: level.from,
          [Op.lt]: level.to,
        },
      };
    }

    let result = {};
    result.users = await db.User.findAll({
      order: [["level_point", "DESC"]],
      limit: 10,
      offset: (page - 1) * 10,
      where: where,
    });
    result.total_count = await db.User.count({
      where: where,
    });
    result.counts = [];
    for (let index = 0; index < levelConfig.level.length; index++) {
      const level = levelConfig.level[index];
      let count = await db.User.count({
        where: {
          level_point: {
            [Op.gte]: level.from,
            [Op.lt]: level.to,
          },
        },
      });
      result.counts.push({
        level: index,
        count,
      });
    }
    res.send(result);
  },
};
