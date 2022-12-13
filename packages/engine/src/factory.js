const fs = require("fs-extra");
const path = require("path");
const generateRoutes = require("./generate_routes");
const executeAction = require("./actions");
const deepAssign = require("./helpers/deepAssign");
const requireIfExists = require("./helpers/requireIfExists");

const locoFactory = (function () {
  "use strict";
  const resourceModels = {};
  let locoConfig = {};
  let resolvePayload = undefined;
  let resolveUser = undefined;
  return {
    getConfig: () => {
      return locoConfig;
    },
    getResourceModels: () => {
      return resourceModels;
    },
    generateRoutes: () => {
      return generateRoutes({ resourceModels }, locoConfig);
    },
    getResolveUserFn: () => {
      return resolveUser;
    },
    getResolvePayloadFn: () => {
      return resolvePayload;
    },
    executeRoute: async (mentalRoute, frameworkData) => {
      const resolvePayload = require(locoConfig.resolvePayloadFnPath);
      const resolveUser = require(locoConfig.resolveUserFnPath);
      const permissions = await resolveUser(mentalRoute, frameworkData);
      const payload = await resolvePayload(mentalRoute, frameworkData);

      let result = await executeAction({
        resourceModels: resourceModels,
        locoConfig: locoConfig,
        locoAction: {
          resource: mentalRoute.resource,
          action: mentalRoute.action,
          permissions,
          payload,
        },
      });
      return result;
    },
    init: (config) => {
      locoConfig = {
        ...{
          resourcesPath: path.resolve(config.locoPath, `resources`),
          mixinsPath: path.resolve(config.locoPath, `mixins`),
          hooksPath: path.resolve(config.locoPath, `hooks/index.js`),
          validatorsPath: path.resolve(config.locoPath, `validators/index.js`),
          generatorsPath: path.resolve(config.locoPath, `generators/index.js`),
          queriesPath: path.resolve(config.locoPath, `queries/index.js`),
          resolvePayloadFnPath: path.resolve(
            config.locoPath,
            `functions/resolvePayload.js`
          ),
          resolveUserFnPath: path.resolve(
            config.locoPath,
            `functions/resolveUser.js`
          ),
        },
        ...config,
      };

      resolvePayload = requireIfExists(
        locoConfig.resolvePayloadFnPath,
        async (locoRoute, frameworkData) => {
          return frameworkData.req.body;
        }
      );

      resolveUser = requireIfExists(
        locoConfig.resolveUserFnPath,
        async (locoRoute, frameworkData) => {
          return "*";
        }
      );

      let resources = fs.readdirSync(locoConfig.resourcesPath);

      let mixins = [];
      try {
        mixins = fs.readdirSync(locoConfig.mixinsPath);
      } catch (error) {
        mixins = [];
      }

      resources = resources.filter(
        (e) => path.extname(e).toLowerCase() === ".json"
      );

      mixins = mixins.filter((e) => path.extname(e).toLowerCase() === ".json");

      resources.forEach((resource) => {
        const resourcePath = path.resolve(
          `${locoConfig.resourcesPath}/${resource}`
        );
        let resourceData = JSON.parse(fs.readFileSync(resourcePath, "utf-8"));
        if (resourceData.name) {
          if (resourceData.mixins && resourceData.mixins.length > 0) {
            for (let index = 0; index < resourceData.mixins.length; index++) {
              let mixin = resourceData.mixins[index];
              if (mixins.includes(mixin)) {
                const mixinPath = path.resolve(
                  `${locoConfig.mixinsPath}/${mixin}`
                );
                let mixinData = JSON.parse(fs.readFileSync(mixinPath, "utf-8"));
                resourceData = deepAssign({})(resourceData, mixinData);
              }
            }
          }

          if (Array.isArray(resourceData.attributes) === false) {
            let attributesArray = [];

            for (const identifier in resourceData.attributes) {
              const attribute = resourceData.attributes[identifier];
              attribute["identifier"] = identifier;
              attribute["resolved_identifier"] = attribute.relation
                ? attribute.relation.resolveTo
                : attribute.identifier;
              attribute["source"] = `${resourceData.meta.table}.${identifier}`;
              attributesArray.push(attribute);
            }
            resourceData.attributes = attributesArray;
          }

          resourceModels[resourceData.name] = resourceData;
        }
      });
    },
  };
})();

module.exports = locoFactory;
