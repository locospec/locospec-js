const validator = require("./validator");
const { resolveByDot } = require("./utils");
const requireIfExists = require("./requireIfExists");

const addToConstraints = (
  constraints,
  attribute,
  validators,
  context,
  outsideValidatorFunctions
) => {
  const { locoAction } = context;
  let payload = locoAction.payload;
  let action = locoAction.action;
  let attribute_identifier = attribute.relation
    ? attribute.relation.resolveTo
    : attribute.identifier;

  let validatorTypes = validators.map((v) => {
    return v.type;
  });

  constraints[attribute_identifier] = {};

  if (
    validatorTypes.includes("optional") &&
    payload["attribute_identifier"] === undefined
  ) {
    return {};
  }

  for (let vCounter = 0; vCounter < validators.length; vCounter++) {
    const validator = validators[vCounter];
    if (validator.type === "required") {
      constraints[attribute_identifier]["presence"] = {
        allowEmpty: false,
        message: `^Please enter ${attribute.label}`,
      };
    }

    if (validator.type === "uuid") {
      constraints[attribute_identifier]["presence"] = {
        allowEmpty: false,
        message: `^Please enter ${attribute.label}`,
      };

      constraints[attribute_identifier]["format"] = {
        pattern:
          "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
        message: `^Please enter valid ${attribute.label} matching an uuid`,
      };
    }

    if (validator.type === "regex") {
      constraints[attribute_identifier]["format"] = {
        pattern: validator.value,
        message: `^Please enter valid ${attribute.label} matching ${validator.value}`,
      };
    }

    if (validator.type === "within") {
      constraints[attribute_identifier]["inclusion"] = {
        within: validator.value,
        message: `^Please choose valid type within ${JSON.stringify(
          validator.value
        )}`,
      };
    }

    if (validator.type === "unique") {
      let where = {};
      let whereNot = {};

      // if (action === "update") {
      //   validator.excludeAttributes = [
      //     ...locoAction.primaryColumns,
      //     ...validator.excludeAttributes,
      //   ];

      //   validator.excludeAttributes = [...new Set(validator.excludeAttributes)];
      // }

      if (
        payload[attribute_identifier] !== undefined &&
        payload[attribute_identifier] !== ""
      ) {
        const includeAttributes = validator.includeAttributes;
        const excludeAttributes = validator.excludeAttributes;

        where[attribute_identifier] = payload[attribute_identifier];

        for (let index = 0; index < includeAttributes.length; index++) {
          const includeAttribute = includeAttributes[index];
          if (payload[includeAttribute]) {
            where[includeAttribute] = payload[includeAttribute];
          }
        }

        for (let index = 0; index < excludeAttributes.length; index++) {
          const excludeAttribute = excludeAttributes[index];
          if (payload[excludeAttribute]) {
            whereNot[excludeAttribute] = payload[excludeAttribute];
          }
        }

        constraints[attribute_identifier]["unique"] = {
          message: `${attribute_identifier} should be unique.`,
          context: context,
          table: validator.table,
          where: where,
          whereNot: whereNot,
        };
      }
    }

    if (validator.type === "exists") {
      let where = {};
      let whereNot = {};
      const includeAttributes = validator.includeAttributes || [];
      const excludeAttributes = validator.excludeAttributes || [];
      where[validator.column || attribute_identifier] =
        payload[attribute_identifier];

      for (let index = 0; index < includeAttributes.length; index++) {
        const includeAttribute = includeAttributes[index];
        if (payload[includeAttribute]) {
          where[includeAttribute] = payload[includeAttribute];
        }
      }

      for (let index = 0; index < excludeAttributes.length; index++) {
        const excludeAttribute = excludeAttributes[index];
        if (payload[excludeAttribute]) {
          whereNot[excludeAttribute] = payload[excludeAttribute];
        }
      }

      constraints[attribute_identifier]["exists"] = {
        message: `${attribute_identifier} should exist.`,
        context: context,
        table: validator.table,
        where: where,
        whereNot: whereNot,
      };
    }

    if (validator.type === "custom_validator") {
      if (outsideValidatorFunctions[validator.value] !== undefined) {
        validator["custom_validator"] =
          outsideValidatorFunctions[validator.value];
        constraints[attribute_identifier]["outside_function"] = validator;
      } else {
        validator["custom_validator"] = () => {
          return `^custom_validator ${validator.value} doesn't exist`;
        };
        constraints[attribute_identifier]["outside_function"] = validator;
      }
    }
  }

  return constraints;
};

const validate = async (context) => {
  const { locoAction, resourceModels, locoConfig } = context;
  const resourceSpec = resourceModels[locoAction.resource];
  const attributes = resourceSpec.attributes;
  const outsideValidatorFunctions = requireIfExists(locoConfig.validatorsPath);

  const attributesWithOperations = attributes.filter((a) => {
    return a.operations !== undefined;
  });

  let payload = locoAction.payload;
  let action = locoAction.action;
  let forIndex = 0;
  let constraints = {};

  const payloadObjectKeys = Object.keys(payload);
  // console.log("payload", action, payloadObjectKeys);

  for (forIndex = 0; forIndex < attributesWithOperations.length; forIndex++) {
    const attribute = attributesWithOperations[forIndex];
    const operationKeys = Object.keys(attribute.operations);

    let validators = [];

    if (
      action === "patch" &&
      !payloadObjectKeys.includes(attribute.resolved_identifier)
    ) {
      continue;
    }

    for (let index = 0; index < operationKeys.length; index++) {
      const operationKey = operationKeys[index];
      const operationActions = operationKey.split(",");
      if (operationActions.includes("*") || operationActions.includes(action)) {
        const verificationType = resolveByDot(
          `operations.${operationKey}.validate`,
          attribute
        );
        if (verificationType) {
          validators = [...validators, ...verificationType];
        }
      }
    }

    if (validators) {
      // console.log("validators", attribute, validators);

      constraints = addToConstraints(
        constraints,
        attribute,
        validators,
        context,
        outsideValidatorFunctions
      );
    }
  }

  try {
    // console.log("constraints", payload, constraints);
    let validatorResult = await validator(payload, constraints);
  } catch (error) {
    throw error;
  }

  context.locoAction = locoAction;

  return context;
};

module.exports = validate;
