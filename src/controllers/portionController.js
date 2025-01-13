const moment = require("moment");
const db = require("../database/models");
const levelConfig = require("../config/config.json");
const { Op } = require("sequelize");

module.exports = {
  clickIngredient: async (req, res) => {
    const { id, ingredient } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      let userCurrentPortion = await db.UserCurrentPortion.findOne({
        where: {
          user_id: user.id,
        },
      });

      let currentIngredients =
        levelConfig.recipes.find(
          (e) => e.key === userCurrentPortion.current_recipe
        )?.ingredients || [];

      let rightIngredient = levelConfig.ingredients.find(
        (ingredient) =>
          ingredient.name ===
          currentIngredients[userCurrentPortion.current_ingredient_index]
      );

      if (rightIngredient.name === ingredient) {
        await db.UserCurrentPortion.update(
          {
            current_ingredient_index:
              userCurrentPortion.current_ingredient_index + 1,
            wrong_attempt_count: 0,
          },
          {
            where: {
              user_id: user.id,
            },
          }
        );
      } else {
        await db.UserCurrentPortion.update(
          {
            wrong_attempt_count:
              userCurrentPortion.wrong_attempt_count >= 3
                ? 1
                : userCurrentPortion.wrong_attempt_count + 1,
            wrong_attempt_time: moment(),
          },
          {
            where: {
              user_id: user.id,
            },
          }
        );
      }
      let result = await db.UserCurrentPortion.findOne({
        where: {
          user_id: user.id,
        },
      });

      res.send({ success: true, result: result });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  skipWrongAttemptTime: async (req, res) => {
    const { id, type } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      if (type === "coin") {
        if (user.coin_balance < 10000) {
          res.send({ success: false, message: "Need 10000 dragons to skip" });
          return;
        } else {
          await db.User.update(
            {
              coin_balance: user.coin_balance - 10000,
            },
            {
              where: { t_user_id: id },
            }
          );
        }
      }
      await db.UserCurrentPortion.update(
        {
          wrong_attempt_count: 0,
        },
        {
          where: {
            user_id: user.id,
          },
        }
      );
      let result = await db.UserCurrentPortion.findOne({
        where: {
          user_id: user.id,
        },
      });

      if (type === "coin") {
        res.send({
          success: true,
          result: result,
          balance: user.coin_balance - 10000,
        });
      } else {
        res.send({
          success: true,
          result: result,
        });
      }
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  craft: async (req, res) => {
    const { id } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      await db.UserCurrentPortion.update(
        {
          is_crafted: true,
          craft_time: moment(),
        },
        {
          where: {
            user_id: user.id,
          },
        }
      );
      let result = await db.UserCurrentPortion.findOne({
        where: {
          user_id: user.id,
        },
      });

      res.send({
        success: true,
        result: result,
      });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
  collect: async (req, res) => {
    const { id } = req.body;
    const user = await db.User.findOne({
      where: { t_user_id: id },
    });
    if (user) {
      let userCurrentPortion = await db.UserCurrentPortion.findOne({
        where: {
          user_id: user.id,
        },
      });
      const portion = await db.UserPortion.findOne({
        where: {
          user_id: user.id,
          recipe_key: userCurrentPortion.current_recipe,
        },
      });
      if (portion) {
        await db.UserPortion.update(
          {
            count: portion.count + 1,
          },
          {
            where: {
              user_id: user.id,
              recipe_key: userCurrentPortion.current_recipe,
            },
          }
        );
      } else {
        await db.UserPortion.create({
          count: 1,
          user_id: user.id,
          recipe_key: userCurrentPortion.current_recipe,
        });
      }
      await db.UserCurrentPortion.update(
        {
          current_recipe:
            levelConfig.recipes[
              Math.floor(Math.random() * levelConfig.recipes.length)
            ].key,
          current_ingredient_index: 0,
          wrong_attempt_count: 0,
          wrong_attempt_time: moment(),
          is_crafted: false,
          craft_time: moment(),
        },
        {
          where: {
            user_id: user.id,
          },
        }
      );
      let result = await db.UserCurrentPortion.findOne({
        where: {
          user_id: user.id,
        },
      });

      res.send({
        success: true,
        result: result,
      });
    } else {
      res.send({ success: false, message: "User not found" });
    }
    return;
  },
};
