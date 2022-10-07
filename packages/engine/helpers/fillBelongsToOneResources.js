const executeActionInternally = require("../executeActionInternally");
const prepareRelationIncludes = require("./prepareRelationIncludes");

const fillBelongsToOneResources = async (context) => {
  const { locoAction, resourceModels, mentalConfig } = context;
  const { belongsToOneColumns, belongsToOneMappings } = locoAction;
  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  let includeRelations = prepareRelationIncludes(
    locoAction,
    belongsToOneColumns,
    belongsToOneMappings
  );

  for (let index = 0; index < belongsToOneColumns.length; index++) {
    const column = belongsToOneColumns[index];
    const columnSpec = belongsToOneMappings[column];

    if (!includeRelations.includes(columnSpec.identifier)) {
      continue;
    }

    // console.log("columnSpec", columnSpec.identifier);

    let allColumnValues = currentData.map((d) => {
      return d[column];
    });

    allColumnValues = [...new Set(allColumnValues)];

    const resourceSpec = resourceModels[columnSpec.relation.resource];

    const internalPayload = {
      limitBy: {
        per_page: undefined,
        page: 1,
      },
      filterBy: [
        {
          attribute: columnSpec.relation.foreignKey,
          op: "in",
          value: allColumnValues,
        },
      ],
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

      const hasOneData = relationData.filter((relationDataElement) => {
        return (
          currentDataElement[column] ===
          relationDataElement[columnSpec.relation.foreignKey]
        );
      });

      if (hasOneData.length > 0) {
        currentDataElement[columnSpec.identifier] = hasOneData[0];
        currentData[indexCurrent] = currentDataElement;
      }
    }
  }

  return context;
};

module.exports = fillBelongsToOneResources;
