const locoFactory = require("./factory");
const executeAction = require("./actions");
const executeRoute = require("./executeRoute");
const executeActionInternally = require("./executeActionInternally");

module.exports = { executeRoute, locoFactory, executeActionInternally };
