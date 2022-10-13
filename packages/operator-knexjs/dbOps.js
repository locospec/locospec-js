const knex = require("./knex.js");

const addFilters = (knex, dataBuilder, filters) => {
  for (let index = 0; index < filters.length; index++) {
    const filter = filters[index];
    switch (filter.op.toLowerCase()) {
      case "like":
        dataBuilder = dataBuilder.where(
          knex.raw(`LOWER(${filter.column})`),
          "LIKE",
          `%${filter.value.toLowerCase()}%`
        );
        break;

      case "gte":
        dataBuilder = dataBuilder.where(filter.column, ">=", `${filter.value}`);
        break;

      case "in":
        // console.log("in col", filter.value);
        dataBuilder = dataBuilder.whereIn(filter.column, filter.value);
        break;

      case "eq":
        dataBuilder = dataBuilder.where(filter.column, "=", `${filter.value}`);
        break;

      case "json_path_eq":
        let json_path_eq_columnArray = filter.column.split(".");
        let json_path_eq_json_col = json_path_eq_columnArray[0];
        json_path_eq_columnArray[0] = "$";
        let json_path_eq_json_path = json_path_eq_columnArray.join(".");
        dataBuilder = dataBuilder.whereJsonPath(
          json_path_eq_json_col,
          json_path_eq_json_path,
          "=",
          `${filter.value}`
        );
        break;

      case "json_path_like":
        let json_path_like_columnArray = filter.column.split(".");
        let json_path_like_json_col = json_path_like_columnArray[0];
        json_path_like_columnArray[0] = "$";
        let json_path_like_json_path = json_path_like_columnArray.join(".");
        dataBuilder = dataBuilder
          .whereJsonPath(
            json_path_like_json_col,
            json_path_like_json_path,
            "LIKE",
            `%${filter.value}%`
          )
          .orWhereJsonPath(
            json_path_like_json_col,
            json_path_like_json_path,
            "LIKE",
            `%${filter.value.toLowerCase()}%`
          );
        break;

      default:
        break;
    }
  }

  return dataBuilder;
};

const dbOps = async (dbOps) => {
  // console.log("server - run - dbops", dbOps);

  try {
    return await knex.transaction(async (trx) => {
      let opResult = {};

      for (let dbOpsCounter = 0; dbOpsCounter < dbOps.length; dbOpsCounter++) {
        const dbOp = dbOps[dbOpsCounter];
        dbOp["table"] = dbOp.resourceSpec.meta.table;
        const deleted_at_column =
          dbOp.resourceSpec.meta.deleted_at_column || "deleted_at";
        const resourceSpec = dbOp.resourceSpec;

        switch (dbOp.operation) {
          case "insert":
            opResult = await trx(dbOp.table)
              .insert(dbOp.payload)
              .returning("*");
            break;

          case "update":
            opResult = await trx(dbOp.table)
              .where(dbOp.where)
              .update(dbOp.payload)
              .returning("*");
            break;

          case "soft_delete":
            console.log(
              "soft_delete ---",
              dbOp.table,
              dbOp.filters,
              dbOp.payload
            );

            let softDeleteDataBuilder = trx(dbOp.table);

            softDeleteDataBuilder = addFilters(
              knex,
              softDeleteDataBuilder,
              dbOp.filters
            );

            opResult = await softDeleteDataBuilder
              .update(dbOp.payload)
              .returning("*");

            return {
              data: opResult,
            };

            break;

          case "delete":
            opResult = await trx(dbOp.table).where(dbOp.where).delete();

            break;

          case "select_first":
            opResult = await trx(dbOp.table)
              .where(dbOp.where)
              .select("*")
              .first();
            break;

          case "count":
            opResult = await trx(dbOp.table)
              .where(dbOp.where)
              .whereNot(dbOp.whereNot)
              .whereNull(deleted_at_column)
              .count({ count: "*" })
              .first();
            opResult = parseInt(opResult.count);
            break;

          case "select":
            // console.log("dbOp", dbOp);

            const filters = dbOp.filters;
            let dataBuilder = trx(dbOp.table).whereNull(deleted_at_column);
            // let totalBuilder = trx(dbOp.table).whereNull(deleted_at_column);
            dataBuilder = addFilters(knex, dataBuilder, filters);

            const totalBuilder = dataBuilder.clone();
            const facetBuilder = dataBuilder.clone();

            if (dbOp.sortBy) {
              dataBuilder = dataBuilder.orderBy(dbOp.sortBy);
            }

            if (dbOp.selectColumns) {
              dataBuilder = dataBuilder.select(dbOp.selectColumns);
            }

            // console.log("dbOp.limit", dbOp.limit);

            if (dbOp.limit !== undefined && dbOp.limit !== 999) {
              dataBuilder = dataBuilder.limit(dbOp.limit);
            }

            if (dbOp.offset && dbOp.limit !== undefined && dbOp.limit !== 999) {
              dataBuilder = dataBuilder.offset(dbOp.offset);
            }

            let builtResult = {};
            let dataResult = await dataBuilder;
            let totalResult = await totalBuilder.count({ count: "*" }).first();
            let total = parseInt(totalResult.count);

            builtResult = {
              data: dataResult,
              meta: {
                total: total,
                offset: dbOp.offset,
                page: dbOp.page,
                per_page: dbOp.limit,
                total_page: Math.ceil(total / dbOp.limit),
              },
            };

            if (
              dbOp.includeFacets === true &&
              resourceSpec["facet"] !== undefined &&
              resourceSpec["facet"]["tagsColumns"] !== undefined &&
              resourceSpec["facet"]["tsvColumn"] !== undefined
            ) {
              let facetResult = await facetBuilder
                .select(resourceSpec["facet"]["tsvColumn"])
                .toString();
              let tsStatString = `ts_stat($$ ${facetResult} $$)`;
              builtResult["generated_facets"] = await knex
                .select(
                  knex.raw(
                    "split_part(word, ':', 1) AS attr, split_part(word, ':', 2) AS value, ndoc AS count"
                  )
                )
                .fromRaw(tsStatString);
            }

            return builtResult;

            break;
        }
      }

      return opResult;
    });
  } catch (error) {
    console.log("error", error);
    throw error;
  }
};

module.exports = dbOps;
