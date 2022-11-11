const locoFactory = require("./factory");
const executeAction = require("./actions");

const executeRoute = async (mentalRoute, frameworkData) => {
  const resolveUser = locoFactory.getResolveUserFn();
  const resolvePayload = locoFactory.getResolvePayloadFn();

  const permissions = await resolveUser(mentalRoute, frameworkData);
  const payload = await resolvePayload(mentalRoute, frameworkData);

  let result = await executeAction({
    resourceModels: locoFactory.getResourceModels(),
    locoConfig: locoFactory.getConfig(),
    locoAction: {
      resource: mentalRoute.resource,
      action: mentalRoute.action,
      permissions,
      payload,
    },
  });
  return result;
};

module.exports = executeRoute;
