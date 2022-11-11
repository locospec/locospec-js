const authorize = (context) => {
  const { locoAction } = context;

  const requiredBasicPermission = `${locoAction.action}_${locoAction.resource}`;

  if (
    locoAction.permissions !== "*" &&
    !locoAction.permissions.includes(requiredBasicPermission)
  ) {
    throw {
      statusCode: 403,
      message: "Forbidden",
    };
  }

  return context;
};

module.exports = authorize;
