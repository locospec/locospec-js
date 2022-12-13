const { pickKeysFromObject, resolveByDot } = require("./utils");
const requireIfExists = require("./requireIfExists");

const runTransformation = async (context, valueFromSource, transformation) => {
  const { locoAction, resourceModels, locoConfig } = context;

  let transformedValue = valueFromSource;

  const operations = [];
  let resourceSpec = null;

  if (transformation.resource) {
    resourceSpec = resourceModels[transformation.resource];
  }

  switch (transformation.operation) {
    case "alias":
      transformedValue = transformedValue[transformation.findByKey];
      break;

    case "extract_from_json":
      transformedValue = resolveByDot(
        transformation.findByKey,
        transformedValue
      );
      break;

    case "find":
      let getWhere = {};
      getWhere[transformation.findByKey] =
        valueFromSource[transformation.findByValue];
      //   console.log("here to find", valueFromSource, transformation);

      operations.push({
        resourceSpec: resourceSpec,
        operation: "select_first",
        where: getWhere,
      });

      transformedValue = await locoConfig.operator.dbOps(operations);

      transformedValue = pickKeysFromObject(
        transformedValue,
        Array.isArray(transformation.extract)
          ? transformation.extract
          : [transformation.extract]
      );
      break;

    case "in":
    case "json_path_contains":
    case "json_path_like":
    case "like":
    case "eq":
      let whereClause = {};
      whereClause["op"] = transformation.operation;
      whereClause["column"] = transformation.findByKey;
      whereClause["value"] = valueFromSource[transformation.findByValue];

      operations.push({
        resourceSpec: resourceSpec,
        operation: "select",
        filters: [whereClause],
        selectColumns: [transformation.extract],
      });

      transformedValue = await locoConfig.operator.dbOps(operations);

      transformedValue = transformedValue.data.map((t) => {
        return t[transformation.extract];
      });

      arrangedTransformedValue = {};
      arrangedTransformedValue[transformation.findByValue] = transformedValue;
      transformedValue = arrangedTransformedValue;

      break;

    case "custom_query_function":
      const outsideQueryFunctions = requireIfExists(locoConfig.queriesPath);

      if (outsideQueryFunctions[transformation.function] !== undefined) {
        transformedValue = await outsideQueryFunctions[transformation.function](
          locoConfig.operator.knex,
          valueFromSource,
          transformation
        );

        arrangedTransformedValue = {};
        arrangedTransformedValue[transformation.findByValue] = transformedValue;
        transformedValue = arrangedTransformedValue;
      }

      break;

    default:
      break;
  }

  //   console.log("ope", operations);

  // console.log("result", transformedValue);

  return transformedValue;
};

module.exports = runTransformation;
