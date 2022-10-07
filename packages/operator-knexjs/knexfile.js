module.exports = {
  client: process.env.DB_DIALECT || "pg",
  debug: process.env.DEBUG || false,
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    application_name: process.env.APP_NAME || "loco-knexjs-operator",
  },
};
