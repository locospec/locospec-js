const prepareRelationIncludes = (
  locoAction,
  relationColumns,
  relationMappings
) => {
  let includes = [];

  if (locoAction.apiConfig.includeRelations !== undefined) {
    if (Array.isArray(locoAction.apiConfig.includeRelations)) {
      return locoAction.apiConfig.includeRelations;
    }

    if (locoAction.apiConfig.includeRelations === "*") {
      for (let index = 0; index < relationColumns.length; index++) {
        const column = relationColumns[index];
        const columnSpec = relationMappings[column];
        includes.push(columnSpec.identifier);
      }
    }
  }

  return includes;
};

module.exports = prepareRelationIncludes;
