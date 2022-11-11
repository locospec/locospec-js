const executeSequence = require("../helpers/executeSequence");
const enhanceWithHooks = require("../helpers/enhanceWithHooks");
const cleanPayload = require("../helpers/cleanPayload");

module.exports = async (context) => {
  const { locoAction, resourceModels } = context;

  const sequence = await enhanceWithHooks(context, {
    prepare: [cleanPayload],
    authorize: [],
    validate: [],
    handle: [],
    respond: [],
  });

  context = await executeSequence(context, sequence);

  let columnsData = {};

  let resourceSpec = resourceModels[locoAction.resource];
  columnsData["relations"] = locoAction["relationColumns"];
  columnsData["mutations"] = locoAction["mutationColumns"];

  return { respondResult: { ...columnsData, ...resourceSpec } };
};
