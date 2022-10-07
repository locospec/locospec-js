const runOperations = async (context) => {
  const { locoAction, resourceModels, mentalConfig } = context;
  const { operations } = locoAction;
  let opResult = await mentalConfig.operator(operations || []);
  locoAction["opResult"] = opResult;
  context.locoAction = locoAction;
  return context;
};

module.exports = runOperations;
