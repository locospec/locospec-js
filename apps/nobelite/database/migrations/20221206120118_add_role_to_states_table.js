exports.up = function (knex) {
  return knex.schema.alterTable("states", function (table) {
    table.string("role");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("states", function (table) {
    table.dropColumn("role");
  });
};
