"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Users", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      t_user_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      first_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      last_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      username: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      coin_balance: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      level_point: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      energy_point: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      energy_size_level: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      energy_recovery_level: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      tap_multipler_level: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      last_tap_time: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      last_notified: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Users");
  },
};
