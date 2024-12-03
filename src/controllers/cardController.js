const moment = require("moment");
const db = require("../database/models");
const levelConfig = require("../config/config.json");

module.exports = {
  unlock: async function (req, res) {
    const { id, card_slug } = req.body;
    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
        include: [
          {
            model: db.Cards,
            required: false,
          },
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
          },
        ],
      });
      if (user) {
        const hero = levelConfig.heros.find((hero) => hero.slug === card_slug);
        if (!hero) {
          res.send({
            success: false,
            error: `Hero not found for provided slug`,
          });
          return;
        }

        let card = await db.Cards.findOne({
          where: {
            user_id: user.id,
            card_slug: card_slug,
          },
        });

        if (card) {
          res.send({
            success: false,
            error: `Hero already unlocked`,
          });
          return;
        }

        let coinsNeed = hero.level[0].cost;

        if (user.coin_balance < coinsNeed) {
          res.send({
            success: false,
            error: `Not enough coins for unlock card. current balance: ${user.coin_balance} coins need: (${coinsNeed})`,
          });
          return;
        }

        if (hero.condition) {
          switch (hero.condition.type) {
            case "card": {
              const card = levelConfig.heros.find(
                (e) => e.slug === hero.condition.targetCard
              );
              console.log('here', user);
              
              const userCard = user.Cards.find((e) => e.card_slug === "fennel");
              console.log('here');
              if (!card) {
                res.send({
                  success: false,
                  error: `Condition card not defined in config`,
                });
                return;
              }
              if (!userCard) {
                res.send({
                  success: false,
                  error: `Need ${card.name} card at level ${hero.condition.cardLevel}`,
                });
                return;
              } else {
                if (userCard.card_level < hero.condition.cardLevel - 1) {
                  res.send({
                    success: false,
                    error: `Need ${card.name} card at level ${hero.condition.cardLevel}`,
                  });
                  return;
                }
              }
              break;
            }
            case "referral": {
              let count = 0;
              user.Referrals.forEach((referral) => {
                if (
                  moment(referral.createdAt).isAfter(
                    moment(hero.condition.launchTime),
                    "seconds"
                  )
                ) {
                  count++;
                }
              });
              if (count < hero.condition.count) {
                res.send({
                  success: false,
                  error: `Invite ${hero.condition.count} more friend`,
                });
                return;
              }
            }
          }
        }

        await db.Cards.create({
          user_id: user.id,
          card_slug: card_slug,
          card_level: 0,
        });

        await db.User.update(
          {
            coin_balance: user.coin_balance - coinsNeed,
          },
          {
            where: {
              t_user_id: id,
            },
          }
        );
        let cards = await db.Cards.findAll({
          where: {
            user_id: user.id,
          },
        });
        res.send({
          success: true,
          message: "Card unlock success",
          cards,
          balance: user.coin_balance - coinsNeed,
        });
        return;
      } else {
        res.send({ success: false, error: "User Not found" });
        return;
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
  upgrade: async function (req, res) {
    const { id, card_slug } = req.body;
    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });
      if (user) {
        const hero = levelConfig.heros.find((hero) => hero.slug === card_slug);
        if (!hero) {
          res.send({
            success: false,
            error: `Hero not found for provided slug`,
          });
          return;
        }

        const card = await db.Cards.findOne({
          where: {
            user_id: user.id,
            card_slug: card_slug,
          },
        });

        if (!card) {
          res.send({
            success: false,
            error: `Hero need to unlock first`,
          });
          return;
        }

        let nextCardLevel = card.card_level + 1;
        if (hero.level.length - 1 < nextCardLevel) {
          res.send({
            success: false,
            error: `Card already reached max level`,
          });
          return;
        }

        let coinsNeed = hero.level[nextCardLevel].cost;

        if (user.coin_balance < coinsNeed) {
          res.send({
            success: false,
            error: `Not enough coins for upgrade card. current balance: ${user.coin_balance} coins need: (${coinsNeed})`,
          });
          return;
        }

        await db.Cards.update(
          {
            card_level: nextCardLevel,
          },
          {
            where: {
              user_id: user.id,
              card_slug: card_slug,
            },
          }
        );

        await db.User.update(
          {
            coin_balance: user.coin_balance - coinsNeed,
          },
          {
            where: {
              t_user_id: id,
            },
          }
        );
        let cards = await db.Cards.findAll({
          where: {
            user_id: user.id,
          },
        });
        res.send({
          success: true,
          message: "Card upgrade success",
          cards,
          balance: user.coin_balance - coinsNeed,
        });
        return;
      } else {
        res.send({ success: false, error: "User Not found" });
        return;
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
  claimProfit: async function (req, res) {
    const { id, time, last_claim, doubleCliam } = req.body;

    try {
      const user = await db.User.findOne({
        where: { t_user_id: id },
      });
      let diffHrs = moment(time).diff(moment(last_claim), "seconds") / 3600;
      diffHrs = diffHrs > 3 ? 3 : diffHrs;
      const cards = await db.Cards.findAll({
        where: {
          user_id: user.id,
        },
      });
      if (user) {
        if (cards.length === 0) {
          res.send({
            success: false,
            error: `User doesn't have any hero, unlock card first`,
          });
          return;
        }
        let profitPerHour = 0;
        for (let index = 0; index < cards.length; index++) {
          const card = cards[index];
          const hero = levelConfig.heros.find(
            (hero) => hero.slug === card.card_slug
          );
          if (hero) {
            profitPerHour += hero.level[card.card_level].profit;
          }
        }

        if (doubleCliam) {
          profitPerHour = profitPerHour * 2;
        }

        await db.User.update(
          {
            coin_balance: user.coin_balance + parseInt(profitPerHour * diffHrs),
            level_point: user.level_point + parseInt(profitPerHour * diffHrs),
          },
          {
            where: {
              t_user_id: id,
            },
          }
        );

        await db.CardClaim.update(
          {
            last_claim: moment(),
          },
          {
            where: {
              user_id: user.id,
            },
          }
        );
        res.send({
          success: true,
          message: "Profit claimed successfully",
          coin_balance: user.coin_balance + parseInt(profitPerHour * diffHrs),
          level_point: user.level_point + parseInt(profitPerHour * diffHrs),
        });
        return;
      } else {
        res.send({ success: false, error: "User Not found" });
        return;
      }
    } catch (error) {
      res.send({ success: false, error: error.message });
    }
  },
  socketHandler: async function (io, socketUser) {
    // console.log("here handler for ", userId);

    const user = await db.User.findOne({
      where: { t_user_id: socketUser.userId },
    });
    if (user) {
      const cards = await db.Cards.findAll({
        where: {
          user_id: user.id,
        },
      });
      let profitPerHour = 0;
      for (let index = 0; index < cards.length; index++) {
        const card = cards[index];
        const hero = levelConfig.heros.find(
          (hero) => hero.slug === card.card_slug
        );
        if (hero) {
          profitPerHour += hero.level[card.card_level].profit;
        }
      }

      if (profitPerHour > 0) {
        let coin = (profitPerHour * 5) / 3600;

        await db.User.update(
          {
            coin_balance: user.coin_balance + coin,
            level_point: user.level_point + coin,
          },
          {
            where: {
              t_user_id: socketUser.userId,
            },
          }
        );
        io.to(socketUser.socketId).emit("card_profit", {
          user: socketUser.userId,
          coin: coin,
        });
      } else {
        io.to(socketUser.socketId).emit("card_profit", {
          user: socketUser.userId,
          coin: 0,
        });
      }

      await db.CardClaim.update(
        {
          last_claim: moment(),
        },
        {
          where: {
            user_id: user.id,
          },
        }
      );
    }
  },
};
