const withTM = require("next-transpile-modules")(["@locospec/react"]);

module.exports = withTM({
  reactStrictMode: true,
});
