'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('UserCurrentPortions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER
      },
      current_recipe: {
        type: Sequelize.STRING
      },
      current_ingredient_index: {
        type: Sequelize.INTEGER
      },
      wrong_attempt_count: {
        type: Sequelize.INTEGER
      },
      wrong_attempt_time: {
        type: Sequelize.DATE
      },
      is_crafted: {
        type: Sequelize.BOOLEAN
      },
      craft_time: {
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('UserCurrentPortions');
  }
};