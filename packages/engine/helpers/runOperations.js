const runOperations = async (context) => {
  const { locoAction, resourceModels, locoConfig } = context;
  const { operations } = locoAction;
  let opResult = await locoConfig.operator(operations || []);
  locoAction["opResult"] = opResult;
  context.locoAction = locoAction;
  return context;
};

module.exports = runOperations;
