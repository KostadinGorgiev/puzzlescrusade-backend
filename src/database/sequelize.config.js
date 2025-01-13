module.exports = {
  development: {
    username: "root",
    password: "",
    database: "puzzlescrusade",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
  },
  test: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "puzzlescrusade",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: "puzzlescrusade",
    host: "127.0.0.1",
    dialect: "mysql",
    logging: false,
  },
};
