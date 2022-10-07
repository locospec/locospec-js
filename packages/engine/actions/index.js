const createAction = require("./create");
const updateAction = require("./update");
const readAction = require("./read");
const deleteAction = require("./delete");
const configAction = require("./config");

const executeAction = async (context) => {
  const { locoAction } = context;

  // console.log("executeAction", locoAction);

  // const customFunctions = engine.getCustomFunctions();
  // console.log("en", customFunctions);

  // await customFunctions["uniqueForAuthor"].apply(null, [
  //   { resource, action, permissions, payload },
  // ]);

  if (locoAction.action === "create") {
    return await createAction(context);
  }

  if (locoAction.action === "update") {
    return await updateAction(context);
  }

  if (locoAction.action === "patch") {
    return await updateAction(context);
  }

  if (locoAction.action === "read") {
    return await readAction(context);
  }

  if (locoAction.action === "delete") {
    return await deleteAction(context);
  }

  if (locoAction.action === "crud_config") {
    return await configAction(context);
    const { resourceModels } = context;
    const resourceSpec = resourceModels[locoAction.resource];
    return { respondResult: resourceSpec };
  }

  return { respondResult: locoAction };
};

module.exports = executeAction;
