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

      case "json_path_like":
        let json_path_like_columnArray = filter.column.split(".");
        let json_path_like_json_col = json_path_like_columnArray[0];
        json_path_like_columnArray[0] = "$";
        let json_path_like_json_path = json_path_like_columnArray.join(".");
        dataBuilder = dataBuilder.where(
          knex.raw(
            `lower(jsonb_path_query_first("${json_path_like_json_col}", '${json_path_like_json_path}') #>> '{}')`
          ),
          "LIKE",
          `%${filter.value.toLowerCase()}%`
        );
        break;

      case "json_path_comp":
        let json_path_comp_columnArray = filter.column.split(".");
        let json_path_comp_json_col = json_path_comp_columnArray[0];
        json_path_comp_columnArray[0] = "$";
        let json_path_comp_json_path = json_path_comp_columnArray.join(".");

        dataBuilder = dataBuilder.where(
          knex.raw(
            `lower(jsonb_path_query_first("${json_path_comp_json_col}", '${json_path_comp_json_path}') #>> '{}')`
          ),
          filter.comparator,
          filter.value
        );

        break;

      case "json_path_not_contains":
        let json_path_not_contains_columnArray = filter.column.split(".");
        let json_path_not_contains_json_col =
          json_path_not_contains_columnArray[0];
        json_path_not_contains_columnArray.shift();
        let json_path_not_contains_json_path =
          json_path_not_contains_columnArray.join(".");

        var json_path_not_contains_tempObject = {};
        var json_path_not_contains_container =
          json_path_not_contains_tempObject;
        json_path_not_contains_json_path.split(".").map((k, i, values) => {
          json_path_not_contains_container = json_path_not_contains_container[
            k
          ] = i == values.length - 1 ? filter.value : {};
        });

        dataBuilder = dataBuilder.whereNot(
          json_path_not_contains_json_col,
          "@>",
          JSON.stringify(json_path_not_contains_tempObject)
        );

        break;

      case "json_path_contains":
        let json_path_contains_columnArray = filter.column.split(".");
        let json_path_contains_json_col = json_path_contains_columnArray[0];
        json_path_contains_columnArray.shift();
        let json_path_contains_json_path =
          json_path_contains_columnArray.join(".");

        var json_path_contains_tempObject = {};
        var json_path_contains_container = json_path_contains_tempObject;
        json_path_contains_json_path.split(".").map((k, i, values) => {
          json_path_contains_container = json_path_contains_container[k] =
            i == values.length - 1 ? filter.value : {};
        });
        dataBuilder = dataBuilder.where(
          json_path_contains_json_col,
          "@>",
          JSON.stringify(json_path_contains_tempObject)
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
            // console.log(
            //   "soft_delete ---",
            //   dbOp.table,
            //   dbOp.filters,
            //   dbOp.payload
            // );

            let softDeleteDataBuilder = trx(dbOp.table);

            softDeleteDataBuilder = addFilters(
              knex,
              softDeleteDataBuilder,
              dbOp.filters
            );

            softDeleteDataBuilder = softDeleteDataBuilder
              .where(dbOp.where)
              .update(dbOp.payload)
              .returning("*");

            let queryPrinterSoftDelete = softDeleteDataBuilder.clone();

            // console.log(
            //   "queryPrinterSoftDelete",
            //   queryPrinterSoftDelete.toString()
            // );

            opResult = await softDeleteDataBuilder;

            return {
              data: opResult,
              debug: {
                queryPrinter: queryPrinterSoftDelete.toString(),
              },
            };

            break;

          case "delete":
            let deleteDataBuilder = trx(dbOp.table);

            deleteDataBuilder = addFilters(
              knex,
              deleteDataBuilder,
              dbOp.filters
            );

            deleteDataBuilder = deleteDataBuilder.where(dbOp.where).delete();

            let queryPrinterDelete = deleteDataBuilder.clone();

            opResult = await deleteDataBuilder;

            return {
              data: opResult,
              debug: {
                queryPrinter: queryPrinterDelete.toString(),
              },
            };

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

            let queryPrinter = dataBuilder.clone();

            let builtResult = {};
            let dataResult = await dataBuilder;
            let totalResult = await totalBuilder.count({ count: "*" }).first();
            let total = parseInt(totalResult.count);

            if (process.env.PRINT_QUERY === "true") {
              console.log("queryPrinter", queryPrinter.toString());
            }

            builtResult = {
              data: dataResult,
              meta: {
                total: total,
                offset: dbOp.offset,
                page: dbOp.page,
                per_page: dbOp.limit,
                total_page: Math.ceil(total / dbOp.limit),
              },
              debug: {
                queryPrinter: queryPrinter.toString(),
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
