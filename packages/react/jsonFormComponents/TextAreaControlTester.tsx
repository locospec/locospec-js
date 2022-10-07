import { rankWith, scopeEndsWith, isStringControl } from "@jsonforms/core";

const contains = (uischema: any, expected: any) => {
  if (uischema.options && uischema.options.reusejs === expected) {
    return true;
  }
  return false;
};

const ReusejsComponent =
  (expected: string) =>
  (uischema: any): boolean => {
    return contains(uischema, expected);
  };

export default rankWith(
  3, //increase rank as needed
  ReusejsComponent("TextAreaBase")
);

// export default rankWith(
//   3, //increase rank as needed
//   isStringControl
// );
