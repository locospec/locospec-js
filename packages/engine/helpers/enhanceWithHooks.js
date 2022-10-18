function humanize(str, delim) {
  var i,
    frags = str.split(delim);
  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
  }
  return frags.join("");
}

function capitalizeFirstLetter(string) {
  string = humanize(string, "_");
  string = humanize(string, "-");
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

      // console.log("hookName", hookName);

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
