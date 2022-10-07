const knex = require("./knex.js");

const dbOps = require("./dbOps");
const rawQuery = (query) => {
  return knex.raw(query);
};

module.exports = {
  dbOps,
  rawQuery,
};
