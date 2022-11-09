const { pickKeysFromObject } = require("./utils");

const getOperations = async (context) => {
  const { locoAction, resourceModels, locoConfig } = context;

  const resourceSpec = resourceModels[locoAction.resource];
  const attributes = resourceSpec.attributes;

  const operations = [];
  let payload = locoAction.payload;
  let hasManyPayload = locoAction.hasManyPayload;
  let action = locoAction.action;

  if (action === "create") {
    // console.log("payload", payload);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "insert",
      payload: payload,
    });

    let getWhere = pickKeysFromObject(payload, locoAction.primaryColumns);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select_first",
      where: getWhere,
    });
  }

  if (action === "delete") {
    let deleteWhere = pickKeysFromObject(payload, locoAction.primaryColumns);

    let filterBy = locoAction.payload.filterBy || [];

    let filters = filterBy
      .filter((f) => {
        return f.op;
      })
      .map((f) => {
        return {
          column: f.attribute.toLowerCase(),
          op: f.op,
          value: f.value,
        };
      });

    if (resourceSpec.softDelete === false) {
      operations.push({
        resourceSpec: resourceSpec,
        operation: "delete",
        where: deleteWhere,
      });
    } else {
      console.log("filters", filters);
      let localPayload = { ...payload };
      delete localPayload.filterBy;
      operations.push({
        resourceSpec: resourceSpec,
        operation: "soft_delete",
        payload: localPayload,
        filters: filters,
      });
    }
  }

  if (action === "update" || action === "patch") {
    let updateWhere = pickKeysFromObject(payload, locoAction.primaryColumns);

    operations.push({
      resourceSpec: resourceSpec,
      operation: "update",
      payload: payload,
      where: updateWhere,
    });

    // We have to run an insert query insert for has many via pivot relationships

    // console.log(
    //   "locoAction.hasManyViaPivotColumns",
    //   locoAction.hasManyViaPivotColumns
    // );

    const hasManyViaPivotColumns = locoAction.hasManyViaPivotColumns;

    for (let index = 0; index < hasManyViaPivotColumns.length; index++) {
      const hasManyViaPivotColumn = hasManyViaPivotColumns[index];
      if (hasManyPayload[hasManyViaPivotColumn] !== undefined) {
        const attributeSpec = attributes.find((element) => {
          return element.identifier === hasManyViaPivotColumn;
        });

        if (
          attributeSpec.relation.sync !== undefined &&
          attributeSpec.relation.sync === false
        ) {
          continue;
        }

        const resourcePayload = hasManyPayload[hasManyViaPivotColumn];
        let deleteWhere = { ...attributeSpec.relation.filter } || {};
        deleteWhere[attributeSpec.relation.foreignKey] =
          payload[attributeSpec.relation.localKey];

        const insertObjects = resourcePayload.map((value) => {
          const insertObject = { ...deleteWhere };
          insertObject[attributeSpec.relation.resourceForeignKey] = value;
          return insertObject;
        });

        operations.push({
          resourceSpec: {
            meta: {
              table: attributeSpec.relation.pivotTable,
            },
          },
          operation: "delete",
          where: deleteWhere,
        });

        if (insertObjects.length > 0) {
          operations.push({
            resourceSpec: {
              meta: {
                table: attributeSpec.relation.pivotTable,
              },
            },
            operation: "insert",
            payload: insertObjects,
          });
        }
      }
    }

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select_first",
      where: updateWhere,
    });
  }

  if (action === "read") {
    // console.log("resourceSpec", resourceSpec.sortBy);

    let limitBy = locoAction.payload.limitBy ||
      resourceSpec.limitBy || { page: 1, per_page: 10 };
    let filterBy = locoAction.payload.filterBy || [];
    let sortBy = locoAction.payload.sortBy || resourceSpec.sortBy || [];
    const table = resourceSpec.meta.table;

    const selectColumns = [
      ...locoAction.directColumns,
      ...locoAction.belongsToOneColumns,
    ].map((m) => `${table}.${m}`);

    // console.log("selectColumns", selectColumns);

    filters = filterBy
      .filter((f) => {
        return f.op;
      })
      .map((f) => {
        return {
          column: f.attribute.toLowerCase(),
          op: f.op,
          value: f.value,
          comparator: f.comparator,
        };
      });

    filters = [...filters, ...locoAction.filters];

    sortBy = sortBy.map((s) => {
      return { column: s.attribute, order: s.order, nulls: "last" };
    });

    operations.push({
      resourceSpec: resourceSpec,
      operation: "select",
      filters: filters,
      selectColumns: selectColumns,
      limit: limitBy.per_page,
      offset: (limitBy.page - 1) * limitBy.per_page,
      sortBy,
      includeFacets: locoAction.apiConfig.includeFacets || false,
    });
  }

  locoAction["operations"] = operations;

  context.locoAction = locoAction;

  return context;
};

module.exports = getOperations;
