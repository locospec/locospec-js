const executeActionInternally = async (mentalRoute, payload) => {
  const executeAction = require("./actions");
  const locoFactory = require("./factory");

  let result = await executeAction({
    resourceModels: locoFactory.getResourceModels(),
    locoConfig: locoFactory.getConfig(),
    locoAction: {
      resource: mentalRoute.resource,
      action: mentalRoute.action,
      stopAfterPhase: payload["stop_after_phase"],
      permissions: "*",
      payload,
    },
  });
  return result;
};

module.exports = executeActionInternally;
