const { executeRoute, locoFactory } = require("@locospec/engine");
const operator = require("@locospec/operator-knexjs");
const path = require("path");
const Config = require("../config")();
const responseKey = Config["responseKey"];

module.exports = (server) => {
  locoFactory.init({
    // resourcesPath: path.resolve(`loco/resources`),
    mixinsPath: path.resolve(`loco/mixins`),
    hooksPath: path.resolve(`loco/hooks/index.js`),
    validatorsPath: path.resolve(`loco/validators/index.js`),
    generatorsPath: path.resolve(`loco/generators/index.js`),
    resolvePayloadFnPath: path.resolve(`loco/functions/resolvePayload.js`),
    resolveUserFnPath: path.resolve(`loco/functions/resolveUser.js`),
    operator: operator,
  });

  const routes = locoFactory.generateRoutes();

  console.log("routes", routes);

  routes.forEach((locoRoute) => {
    server[locoRoute.method](locoRoute.path, async (req, res, next) => {
      let result = await executeRoute(locoRoute, {
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
