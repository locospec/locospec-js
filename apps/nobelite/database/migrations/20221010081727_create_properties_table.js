exports.up = async function (knex) {
  await knex.raw(`create extension if not exists "uuid-ossp"`);
  return knex.schema.createTable("properties", function (table) {
    table.uuid("uuid").notNullable().primary();
    table.string("listing_id", 255);
    table.string("owner_type", 255);
    table.uuid("city_uuid");

    table.text("location_coordinates");

    table.datetime("emd_last_date");
    table.text("description");

    table.specificType("tsv", "tsvector");
    table.jsonb("tags");

    table.datetime("created_at");
    table.datetime("updated_at");
    table.datetime("deleted_at");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTable("properties");
};
