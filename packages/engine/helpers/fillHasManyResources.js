const prepareRelationIncludes = require("./prepareRelationIncludes");
const executeActionInternally = require("../executeActionInternally");

const fillHasManyResources = async (context) => {
  const { locoAction, resourceModels, locoConfig } = context;
  const { hasManyColumns, hasManyMappings } = locoAction;
  let includeRelations = prepareRelationIncludes(
    locoAction,
    hasManyColumns,
    hasManyMappings
  );

  // Get the current data

  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  for (let index = 0; index < hasManyColumns.length; index++) {
    const column = hasManyColumns[index];

    const columnSpec = hasManyMappings[column];

    if (!includeRelations.includes(columnSpec.identifier)) {
      continue;
    }

    let localKey = columnSpec.relation.localKey;
    let filters = columnSpec.relation.filter;

    let allColumnValues = currentData.map((d) => {
      return d[localKey];
    });

    allColumnValues = [...new Set(allColumnValues)];

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    if (resourceSpec === undefined) {
      return context;
    }

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

    let sortBy = resourceSpec.sortBy || [
      { attribute: "created_at", order: "desc" },
    ];

    const internalPayload = {
      limitBy: {
        per_page: undefined,
        page: 1,
      },
      sortBy: sortBy,
      filterBy: filterWhereClauses,
    };

    const internalRelationData = await executeActionInternally(
      {
        resource: resourceSpec.name,
        action: "read",
      },
      internalPayload
    );

    relationData = internalRelationData["respondResult"]["data"];

    for (
      let indexCurrent = 0;
      indexCurrent < currentData.length;
      indexCurrent++
    ) {
      const currentDataElement = currentData[indexCurrent];

      const hasManyData = relationData.filter((relationDataElement) => {
        return (
          currentDataElement[localKey] ===
          relationDataElement[columnSpec.relation.foreignKey]
        );
      });

      currentDataElement[columnSpec.identifier] = hasManyData;
      currentData[indexCurrent] = currentDataElement;
    }
  }

  return context;
};

module.exports = fillHasManyResources;
