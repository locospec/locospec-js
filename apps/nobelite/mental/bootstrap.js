const { executeRoute, locoFactory } = require("@locospec/engine");
const operator = require("@locospec/operator-knexjs");
const path = require("path");
const Config = require("../config")();
const responseKey = Config["responseKey"];

module.exports = (server) => {
  locoFactory.init({
    resourcesPath: path.resolve(`mental/resources`),
    mixinsPath: path.resolve(`mental/mixins`),
    hooksPath: path.resolve(`mental/hooks/index.js`),
    validatorsPath: path.resolve(`mental/validators/index.js`),
    generatorsPath: path.resolve(`mental/generators/index.js`),
    resolvePayloadFnPath: path.resolve(`mental/functions/resolvePayload.js`),
    resolveUserFnPath: path.resolve(`mental/functions/resolveUser.js`),
    apiPrefix: "/loco",
    operator: operator,
  });

  const routes = locoFactory.generateRoutes();

  routes.forEach((mentalRoute) => {
    server[mentalRoute.method](mentalRoute.path, async (req, res, next) => {
      let result = await executeRoute(mentalRoute, {
        req: req,
        reqBody: req.body,
        reqParams: req.params,
        reqQuery: req.query,
        reqHeaders: req.Headers,
      });
      return res.code(200).send(result[responseKey]);
    });
  });
};
