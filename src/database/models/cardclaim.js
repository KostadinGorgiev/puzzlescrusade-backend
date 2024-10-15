'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CardClaim extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      CardClaim.belongsTo(models.User, {
        targetKey: "id",
        foreignKey: "user_id",
      });
    }
  }
  CardClaim.init({
    user_id: DataTypes.INTEGER,
    last_claim: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'CardClaim',
  });
  return CardClaim;
};