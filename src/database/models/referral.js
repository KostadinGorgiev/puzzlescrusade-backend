'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Referral extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Referral.belongsTo(models.User, {
        targetKey: 'id',
        foreignKey: 'user_id',
      })

      Referral.hasOne(models.User, {
        sourceKey: 'reffered_user_id',
        foreignKey: 'id',
      })
    }
  }
  Referral.init({
    user_id: { type: DataTypes.INTEGER, allowNull: true },
    reffered_user_id: { type: DataTypes.INTEGER, allowNull: true }
  }, {
    sequelize,
    modelName: 'Referral',
  });
  return Referral;
};