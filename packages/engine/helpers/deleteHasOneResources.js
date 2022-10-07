const executeActionInternally = require("../executeActionInternally");

const deleteHasOneResources = async (context) => {
  const { locoAction, resourceModels, mentalConfig } = context;
  const { hasOneColumns, hasOneMappings } = locoAction;

  // Get the current data

  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  for (let index = 0; index < hasOneColumns.length; index++) {
    const column = hasOneColumns[index];
    const columnSpec = hasOneMappings[column];

    let localKey = columnSpec.relation.localKey;
    let filters = columnSpec.relation.filter;

    let allColumnValues = currentData.map((d) => {
      return d[localKey];
    });

    allColumnValues = [...new Set(allColumnValues)];

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    let whereClause = {};
    whereClause["op"] = "in";
    whereClause["attribute"] = columnSpec.relation.foreignKey;
    whereClause["value"] = allColumnValues;

    let filterWhereClauses = [];

    for (const key in filters) {
      if (Object.hasOwnProperty.call(filters, key)) {
        const value = filters[key];

        filterWhereClauses.push({
          attribute: key,
          op: "eq",
          value: value,
        });
      }
    }

    filterWhereClauses.push(whereClause);

    const internalPayload = {
      filterBy: filterWhereClauses,
    };

    const internalRelationData = await executeActionInternally(
      {
        resource: resourceSpec.name,
        action: "delete",
      },
      internalPayload
    );
  }

  return context;
};

module.exports = deleteHasOneResources;
