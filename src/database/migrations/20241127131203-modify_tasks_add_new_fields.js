"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("Tasks", "password", Sequelize.STRING);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("Tasks", "password");
  },
};
