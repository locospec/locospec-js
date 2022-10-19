const fs = require("fs");

const requireIfExists = (path, defaultReturn = {}) => {
  try {
    return require(path);
  } catch (ex) {
    return defaultReturn;
  }
};

module.exports = requireIfExists;
