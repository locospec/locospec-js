function resolveByDot(path, obj) {
  let value = path.split(".").reduce(function (prev, curr) {
    return prev ? prev[curr] : null;
  }, obj);

  return value !== null && value !== undefined ? value : undefined;
}

function setByDot(obj, path, val) {
  path.split(".").reduce(function (prev, curr, _idx, _arr) {
    if (_idx === _arr.length - 1 && prev) {
      prev[curr] = val;
    }

    return prev ? prev[curr] : null;
  }, obj);

  return obj;
}

function pickKeysFromObject(instance, attributes) {
  const result = {};

  for (const attribute of attributes) {
    if (instance[attribute] || instance[attribute] === false) {
      result[attribute] = instance[attribute];
    }
  }

  return result;
}

module.exports = {
  resolveByDot,
  setByDot,
  pickKeysFromObject,
};
