const runTransformation = require("../helpers/runTransformation");

const generateFacets = async (context) => {
  const { locoAction, resourceModels, locoConfig } = context;

  if (context.locoAction["opResult"]["generated_facets"] !== undefined) {
    const facets = {};

    const resourceSpec = resourceModels[locoAction.resource];
    const attributes = resourceSpec.attributes;
    let generatedFacets = context.locoAction["opResult"]["generated_facets"];

    let facetAttributes = resourceSpec.attributes.filter((c) => {
      return c.facet;
    });

    for (let tIndex = 0; tIndex < facetAttributes.length; tIndex++) {
      const facetAttribute = facetAttributes[tIndex];
      const tag = facetAttribute["facet"]["tag"];
      const valueKey = facetAttribute["facet"]["value"];
      const resource = facetAttribute["facet"]["resource"];

      const valueAndCountMap = {};

      const filteredByTag = generatedFacets
        .filter((g) => {
          return g.attr === tag;
        })
        .map((g) => {
          valueAndCountMap[g.value] = g.count;
          return g.value;
        });

      //   console.log(
      //     "facetAttribute",
      //     facetAttribute.identifier,
      //     filteredByTag,
      //   );

      if (resource !== undefined) {
        const resourceSpec = resourceModels[resource];

        let sortBy = resourceSpec.sortBy || [];

        sortBy = sortBy.map((s) => {
          return { column: s.attribute, order: s.order, nulls: "last" };
        });

        let whereClause = {};
        whereClause["op"] = "in";
        whereClause["column"] = valueKey;
        whereClause["value"] = filteredByTag;

        // console.log("relation based", resource, whereClause, resourceSpec);

        let operations = [];

        operations.push({
          resourceSpec: resourceSpec,
          operation: "select",
          filters: [whereClause],
          selectColumns: "*",
          sortBy,
        });

        let generatedData = await locoConfig.operator.dbOps(operations);
        generatedData = generatedData["data"];
        // console.log("generatedData", generatedData);

        for (let gIndex = 0; gIndex < generatedData.length; gIndex++) {
          const generatedItem = generatedData[gIndex];
          generatedItem["count"] = valueAndCountMap[generatedItem[valueKey]];
        }

        facets[tag] = generatedData;
      }
    }

    delete context.locoAction["opResult"]["generated_facets"];
    context.locoAction["opResult"]["facets"] = facets;
  }

  return context;
};

module.exports = generateFacets;
