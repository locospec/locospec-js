const { resolveByDot } = require("./utils");
const { pickKeysFromObject } = require("./utils");
const knex = requireKnex();

const saveFacet = async (context) => {
  const { locoAction, resourceModels, mentalConfig } = context;
  const resourceSpec = resourceModels[locoAction.resource];

  const { belongsToOneColumns, belongsToOneMappings } = locoAction;
  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];

  if (
    resourceSpec["facet"] !== undefined &&
    resourceSpec["facet"]["tagsColumns"] !== undefined &&
    resourceSpec["facet"]["tsvColumn"] !== undefined
  ) {
    let facetAttributes = resourceSpec.attributes.filter((c) => {
      return c.facet;
    });

    // console.log("saveFacet", resourceSpec["facet"]);
    // console.log("facetAttributes", facetAttributes);

    for (let cIndex = 0; cIndex < currentData.length; cIndex++) {
      const currentDataItem = currentData[cIndex];
      let tagsArray = [];

      for (let tIndex = 0; tIndex < facetAttributes.length; tIndex++) {
        const facetAttribute = facetAttributes[tIndex];

        // console.log(
        //   "facetAttribute",
        //   facetAttribute.facet,
        //   currentDataItem[facetAttribute.identifier]
        // );

        tagsArray.push(
          `${facetAttribute.facet.tag}:${
            currentDataItem[facetAttribute.identifier][
              facetAttribute.facet.value
            ]
          }`
        );
      }

      let tagsString = tagsArray.map((t) => {
        return `"${t}"`;
      });

      let updateWhere = pickKeysFromObject(
        currentDataItem,
        locoAction.primaryColumns
      );

      let tsvPayload = {};
      tsvPayload[resourceSpec["facet"]["tagsColumns"]] =
        JSON.stringify(tagsArray);
      tsvPayload[resourceSpec["facet"]["tsvColumn"]] = knex.raw(
        `array_to_tsvector(\'{${tagsString.join(",")}}\')`
      );

      const operations = [];

      operations.push({
        resourceSpec: resourceSpec,
        operation: "update",
        payload: tsvPayload,
        where: updateWhere,
      });

      await mentalConfig.operator(operations);

      // console.log("tagsString", updateWhere, tsvPayload);
    }
  }

  return context;
};

module.exports = saveFacet;
