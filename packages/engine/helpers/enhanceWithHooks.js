function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const enhanceWithHooks = async (context, actionSequence) => {
  const { locoAction, resourceModels, locoConfig } = context;
  const requiredHooks = require(locoConfig.hooksPath);
  const lifeCycles = ["before", "after"];
  const methods = ["prepare", "authorize", "validate", "handle", "respond"];

  let hooks = [];

  methods.forEach((method) => {
    lifeCycles.forEach((lifeCycle) => {
      const hookName = `${lifeCycle}${capitalizeFirstLetter(
        method
      )}${capitalizeFirstLetter(locoAction.action)}${capitalizeFirstLetter(
        locoAction.resource
      )}`;

      if (requiredHooks[hookName]) {
        hooks.push(requiredHooks[hookName]);
      }

      if (lifeCycle === "before") {
        const actionFuncs = actionSequence[method];
        hooks = [...hooks, ...actionFuncs];
      }
    });
  });

  // console.log("Hooks--", hooks);

  return hooks;
};

module.exports = enhanceWithHooks;
