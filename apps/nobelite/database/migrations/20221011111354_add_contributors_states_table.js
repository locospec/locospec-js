exports.up = function (knex) {
  return knex.schema.alterTable("states", function (table) {
    table.jsonb("contributors");
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("states", function (table) {
    table.dropColumn("contributors");
  });
};
