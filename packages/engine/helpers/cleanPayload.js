const { pickKeysFromObject } = require("./utils");

const cleanPayload = async (context) => {
  const { locoAction, resourceModels, locoConfig } = context;

  const resourceSpec = resourceModels[locoAction.resource];
  const attributes = resourceSpec.attributes;

  let payload = locoAction.payload;
  let action = locoAction.action;
  let relationColumns = {
    belongs_to_one: [],
    has_one: [],
    has_many: [],
    has_many_via_pivot: [],
  };
  let forIndex = 0;

  let directColumns = attributes
    .filter((c) => {
      return !c.relation && !c.mutateFrom;
    })
    .map((c) => {
      return `${c.identifier}`;
    });

  directColumns = [...directColumns];

  let mutationColumns = attributes
    .filter((c) => {
      return c.mutateFrom;
    })
    .map((c) => {
      return `${c.identifier}`;
    });

  mutationColumns = [...mutationColumns];

  // console.log("directColumns", mutationColumns);

  let belongsToOneColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "belongs_to_one";
    })
    .map((c) => {
      relationColumns["belongs_to_one"].push(c.identifier);
      return `${c.relation.resolveTo || c.identifier}`;
    });

  belongsToOneColumns = [...belongsToOneColumns];

  let belongsToOneMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "belongs_to_one";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  belongsToOneMappings = { ...belongsToOneMappings };

  let hasOneColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_one";
    })
    .map((c) => {
      relationColumns["has_one"].push(c.identifier);
      return `${c.relation.resolveTo || c.identifier}`;
    });

  hasOneColumns = [...hasOneColumns];

  let hasOneMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_one";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  hasOneMappings = { ...hasOneMappings };

  let hasManyColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many";
    })
    .map((c) => {
      relationColumns["has_many"].push(c.identifier);
      return `${c.relation.resolveTo || c.identifier}`;
    });

  hasManyColumns = [...hasManyColumns];

  let hasManyMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  hasManyMappings = { ...hasManyMappings };

  let hasManyViaPivotColumns = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many_via_pivot";
    })
    .map((c) => {
      relationColumns["has_many_via_pivot"].push(c.identifier);
      return `${c.relation.resolveTo || c.identifier}`;
    });

  hasManyViaPivotColumns = [...hasManyViaPivotColumns];

  let hasManyViaPivotMappings = attributes
    .filter((c) => {
      return c.relation && c.relation.type === "has_many_via_pivot";
    })
    .reduce(
      (obj, c) =>
        Object.assign(obj, {
          [`${c.relation.resolveTo || c.identifier}`]: c,
        }),
      {}
    );

  hasManyViaPivotMappings = { ...hasManyViaPivotMappings };

  // console.log("before cleaning", attributes, hasOneColumns);

  // let otherKeys = [];

  // if (locoAction.action === "read") {
  //   otherKeys = ["limitBy", "sortBy", "filterBy"];
  // }

  otherKeys = ["limitBy", "sortBy", "filterBy"];

  if (payload.apiConfig !== undefined) {
    locoAction["apiConfig"] = payload.apiConfig;
  } else {
    locoAction["apiConfig"] = {};
  }

  // console.log("includes -----", includes);

  const hasManyPayload = pickKeysFromObject(payload, [
    ...hasManyViaPivotColumns,
  ]);

  // console.log("cleanPayload", payload);

  payload = pickKeysFromObject(payload, [
    ...directColumns,
    ...belongsToOneColumns,
    ...otherKeys,
  ]);

  locoAction["payload"] = payload;
  locoAction["hasManyPayload"] = hasManyPayload;
  locoAction["directColumns"] = directColumns;
  locoAction["belongsToOneColumns"] = belongsToOneColumns;
  locoAction["belongsToOneMappings"] = belongsToOneMappings;
  locoAction["hasOneColumns"] = hasOneColumns;
  locoAction["hasOneMappings"] = hasOneMappings;
  locoAction["hasManyColumns"] = hasManyColumns;
  locoAction["hasManyMappings"] = hasManyMappings;
  locoAction["hasManyViaPivotColumns"] = hasManyViaPivotColumns;
  locoAction["hasManyViaPivotMappings"] = hasManyViaPivotMappings;
  locoAction["mutationColumns"] = mutationColumns;
  locoAction["relationColumns"] = relationColumns;

  locoAction["primaryColumns"] = resourceSpec.primary;
  context.locoAction = locoAction;

  return context;
};

module.exports = cleanPayload;
