const runTransformation = require("../helpers/runTransformation");
const prepareMutationIncludes = require("./prepareMutationIncludes");

const runTransformations = async (context) => {
  const { locoAction, resourceModels, mentalConfig } = context;

  const resourceSpec = resourceModels[locoAction.resource];
  const attributes = resourceSpec.attributes;
  let currentData =
    context.locoAction["opResult"]["data"] === undefined
      ? [context.locoAction["opResult"]]
      : context.locoAction["opResult"]["data"];
  let newOpResult = [];

  let includeMutations = prepareMutationIncludes(locoAction, attributes);

  let forIndex = 0;

  for (let index = 0; index < currentData.length; index++) {
    const currentDataItem = currentData[index];
    let transformed = currentDataItem;

    for (forIndex = 0; forIndex < attributes.length; forIndex++) {
      const attribute = attributes[forIndex];
      const transformations = attribute.transformations;

      if (!includeMutations.includes(attribute.identifier)) {
        continue;
      }

      // console.log("transformations", transformations);

      if (
        transformations !== undefined &&
        attribute.mutateFrom !== undefined &&
        transformations.length > 0
      ) {
        let transformedValue = currentDataItem;
        for (let index = 0; index < transformations.length; index++) {
          const transformation = transformations[index];
          transformedValue = await runTransformation(
            context,
            transformedValue,
            transformation
          );
        }
        // console.log("transformedValue", transformedValue);
        transformed[attribute.identifier] = transformedValue;
      } else {
        // const valueFromSource = currentDataItem[attribute.source];
        // transformed[attribute.identifier] = valueFromSource;
      }
    }
    newOpResult.push(transformed);
  }

  if (context.locoAction["opResult"]["data"] === undefined) {
    context.locoAction["opResult"] = newOpResult[0];
  } else {
    context.locoAction["opResult"]["data"] = newOpResult;
  }

  return context;

  //   console.log("runTransformations", context.locoAction["opResult"]);
  return context;
};

module.exports = runTransformations;
