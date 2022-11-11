const prepareMutationIncludes = (locoAction, attributes) => {
  let includes = [];

  if (locoAction.apiConfig.includeMutations !== undefined) {
    if (Array.isArray(locoAction.apiConfig.includeMutations)) {
      return locoAction.apiConfig.includeMutations;
    }

    if (locoAction.apiConfig.includeMutations === "*") {
      for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index];
        includes.push(attribute.identifier);
      }
    }
  }

  return includes;
};

module.exports = prepareMutationIncludes;
