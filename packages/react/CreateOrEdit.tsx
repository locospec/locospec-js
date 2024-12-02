import React, { useEffect, useState, useMemo } from "react";
import FormWrapper from "./helpers/FormWrapper";
import {
  ButtonBase,
  TextInputBase,
  TextAreaBase,
  PickerSelectSimple,
  ToggleBase,
} from "@reusejs/react";
import { callLoco, getByUuid } from "./helpers/callLoco";
import resolveByDot from "./helpers/resolveByDot";
import { JsonForms } from "@jsonforms/react";
import { materialCells } from "@jsonforms/material-renderers";
import { renderers } from "./jsonFormComponents";
import { DateTime } from "luxon";

const ErrorText = (message: any) => (
  <div className="mt-2 text-xs text-red-500 lowercase">
    <ul className="list-none ml-2">
      {message?.message?.map((m: string, index: any) => (
        <li key={index}>{m}</li>
      ))}
    </ul>
  </div>
);

function CreateOrEditForm({
  resourceSpec,
  resourceData,
  formInstance,
  action,
  router,
  primaryIdentifier,
  routePrefix,
}: {
  resourceSpec: any;
  resourceData: any;
  formInstance: any;
  action: any;
  router: any;
  primaryIdentifier: any;
  routePrefix: any;
}) {
  // console.log("router", router);

  const resource = router.query.resource;
  const [schema, setSchema] = useState<any>({
    type: "object",
    properties: {},
  });
  const [uischema, setUISchema] = useState<any>({
    type: "VerticalLayout",
    elements: [],
  });
  const [formData, setFormData] = useState<any>({});
  const [ready, setReady] = useState<any>(false);
  const [additionalErrors, setAdditionalErrors] = useState<any>([]);

  const handleSubmit = async (e?: any) => {
    try {
      const payload = { ...formData };

      if (action === "update") {
        payload["uuid"] = primaryIdentifier;
      }

      for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          const element = payload[key];

          console.log(
            "element",
            element,
            typeof element,
            Array.isArray(element)
          );

          if (
            typeof element === "object" &&
            element !== null &&
            !Array.isArray(element)
          ) {
            payload[key] = element["value"];
          }

          if (
            typeof element === "object" &&
            element !== null &&
            Array.isArray(element)
          ) {
            payload[key] = JSON.stringify(element);
          }
        }
      }

      console.log("createStateForm", action, payload);
      // return false;

      // e.preventDefault();
      formInstance.startProcessing();
      await callLoco(routePrefix, resource, `_${action}`, payload);
      formInstance.finishProcessing();
      router.back();
      // if (action === "update") {
      //   router.push(`/${resource}/${primaryIdentifier}`);
      // } else {
      //   router.push(`/${resource}`);
      // }
      // router.push(`/${resource}`);
    } catch (errors: any) {
      console.log("handleSubmit errors", errors);
      let ajvErrors = [];

      for (const key in errors) {
        if (Object.prototype.hasOwnProperty.call(errors, key)) {
          const errorMessages = errors[key];
          for (let index = 0; index < errorMessages.length; index++) {
            const errorMessage = errorMessages[index];
            ajvErrors.push({
              instancePath: `/${key}`,
              message: errorMessage,
            });
          }
        }
      }

      setAdditionalErrors(ajvErrors);
      formInstance.finishProcessing();
    }
  };

  const prepareJsonFormsSchema = async (attributes: any) => {
    const localSchemaProperties: any = {};
    const localUISchemaElements: any = [];
    const localFormData: any = {};

    for (let index = 0; index < attributes.length; index++) {
      const attribute = attributes[index];
      const uiComponent = resolveByDot(`ui.${action}.component`, attribute);
      const type = resolveByDot(`ui.${action}.type`, attribute);

      if (type === "array") {
        const arrayAttributes = resolveByDot(
          `ui.${action}.atrtibutes`,
          attribute
        );

        let arraySchemaProperties: any = {};
        let arrayUISchemaElements: any = [];
        let arrayFormData: any = {};

        for (
          let arrayIndex = 0;
          arrayIndex < arrayAttributes.length;
          arrayIndex++
        ) {
          const arrayAttribute = arrayAttributes[arrayIndex];
          // console.log("arrayAttribute", arrayAttribute);

          switch (arrayAttribute.uiComponent) {
            case "TextInputBase":
              arraySchemaProperties[arrayAttribute.resolved_identifier] = {
                type: "string",
              };
              break;

            case "MaterialUIDefault":
              arraySchemaProperties[arrayAttribute.resolved_identifier] =
                arrayAttribute.schemaObject;
              break;

            default:
              arraySchemaProperties[arrayAttribute.resolved_identifier] = {
                type: "string",
              };
              // arrayUISchemaElements.push({
              //   type: "Control",
              //   label: arrayAttribute.label,
              //   scope: `#/properties/${arrayAttribute.resolved_identifier}`,
              //   options: {
              //     reusejs: uiComponent,
              //   },
              // });
              break;
          }
        }

        localSchemaProperties[attribute.resolved_identifier] = {
          type: "array",
          items: {
            type: "object",
            properties: arraySchemaProperties,
          },
        };

        localUISchemaElements.push({
          type: "Control",
          label: attribute.label,
          scope: `#/properties/${attribute.resolved_identifier}`,
        });

        if (action === "update") {
          localFormData[attribute.resolved_identifier] =
            resourceData[attribute.resolved_identifier];
        } else {
          localFormData[attribute.resolved_identifier] = [];
        }

        // console.log("arrayUISchemaElements", arrayUISchemaElements);
      }

      if (uiComponent !== undefined) {
        switch (uiComponent) {
          case "TextInputBase":
          case "TextAreaBase":
            localSchemaProperties[attribute.resolved_identifier] = {
              type: "string",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
              },
            });

            if (
              resourceData[attribute.resolved_identifier] === null ||
              resourceData[attribute.resolved_identifier] === undefined
            ) {
              resourceData[attribute.resolved_identifier] = "";
            }

            localFormData[attribute.resolved_identifier] =
              resourceData[attribute.resolved_identifier];
            break;

          case "MultiFileUploader":
            if (action === "update") {
            }

            if (action === "create") {
              let prefillValues: any = {};
              Object.entries(router.query).forEach((q: any) => {
                let [key, value] = q;
                if (key.startsWith("prefillValue-")) {
                  key = key.replace(/prefillValue-/, "");

                  if (attribute.ui[action]["params"].includes(key)) {
                    prefillValues[key] = value;
                  }
                }
              });

              attribute.params = prefillValues;
              localSchemaProperties[attribute.resolved_identifier] = {
                type: "string",
              };

              localUISchemaElements.push({
                type: "Control",
                label: attribute.label,
                scope: `#/properties/${attribute.resolved_identifier}`,
                options: {
                  reusejs: uiComponent,
                  attributeSpec: attribute,
                  loco: {
                    prefix: routePrefix,
                  },
                },
              });
              formInstance.startProcessing();
            }
            break;

          case "SingleFileUploader":
            if (action === "update") {
              attribute.primaryIdentifier = primaryIdentifier;
              localSchemaProperties[attribute.resolved_identifier] = {
                type: "string",
              };
              localUISchemaElements.push({
                type: "Control",
                label: attribute.label,
                scope: `#/properties/${attribute.resolved_identifier}`,
                options: {
                  reusejs: uiComponent,
                  attributeSpec: attribute,
                  loco: {
                    prefix: routePrefix,
                  },
                },
              });

              localFormData[attribute.resolved_identifier] =
                resourceData[attribute.resolved_identifier];
            }
            break;

          case "DatePickerBase":
          case "DateTimePickerBase":
            localSchemaProperties[attribute.resolved_identifier] = {
              type: "string",
              format: uiComponent === "DatePickerBase" ? "date" : "date-time",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
              },
            });

            if (
              resourceData[attribute.resolved_identifier] === null ||
              resourceData[attribute.resolved_identifier] === undefined
            ) {
              resourceData[attribute.resolved_identifier] = "";
            }

            localFormData[attribute.resolved_identifier] = DateTime.fromISO(
              resourceData[attribute.resolved_identifier]
            ).toISO();
            break;

          case "ToggleBase":
            localSchemaProperties[attribute.resolved_identifier] = {
              type: "boolean",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
              },
            });

            if (
              resourceData[attribute.resolved_identifier] === null ||
              resourceData[attribute.resolved_identifier] === undefined
            ) {
              resourceData[attribute.resolved_identifier] = false;
            }

            localFormData[attribute.resolved_identifier] =
              resourceData[attribute.resolved_identifier];
            break;

          case "SinglePickerSelectSimple":
            let dependsOn = resolveByDot(`ui.${action}.dependsOn`, attribute);
            // console.log("attribute", dependsOn);
            localSchemaProperties[attribute.resolved_identifier] = {
              type: "object",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
                loco: {
                  dependsOn: dependsOn,
                  resource: attribute.relation?.resource
                    ? attribute.relation.resource
                    : null,
                  prefix: routePrefix,
                },
              },
              nameKey: attribute.ui.create?.nameKey
                ? attribute.ui.create.nameKey
                : "name",
              staticData: attribute.ui.create?.staticData
                ? attribute.ui.create.staticData
                : null,
            });

            if (action === "update") {
              let valueKeyInResponse = resolveByDot(
                `ui.${action}.valueKeyInResponse`,
                attribute
              );

              if (valueKeyInResponse !== undefined) {
                let response: any = {};
                let dependsOnData = resourceData[valueKeyInResponse];
                // console.log("update scenario", valueKeyInResponse);
                // console.log("dependsOnData", dependsOnData);

                response["label"] = dependsOnData["name"];
                response["value"] = dependsOnData["uuid"];

                // console.log("update scenario", valueKeyInResponse, response);

                localFormData[attribute.resolved_identifier] = response;
              } else {
                let response: any = {};
                if (attribute.ui.create?.staticData) {
                  let data = attribute.ui.create?.staticData;
                  let filteredData = data.filter(
                    (item: any) =>
                      item.value === resourceData[attribute.resolved_identifier]
                  );
                  response = filteredData[0];
                } else {
                  if(resourceData[attribute.resolved_identifier]){
                    response = await getByUuid(
                      routePrefix,
                      attribute.relation.resource,
                      resourceData[attribute.resolved_identifier]
                    );

                    response["label"] =
                      response[
                        attribute.ui.create?.nameKey
                          ? attribute.ui.create.nameKey
                          : "name"
                      ];
                    response["value"] = response["uuid"];
                  }
                }
                localFormData[attribute.resolved_identifier] = response;
              }
            } else {
              localFormData[attribute.resolved_identifier] = {};
            }

            break;

          case "PrefillFromUrl":
            Object.entries(router.query).forEach((q: any) => {
              let [key, value] = q;
              if (key === `prefillValue-${attribute.resolved_identifier}`) {
                localFormData[attribute.resolved_identifier] = value;
              }
            });

            break;

          case "TextEditor":
            localSchemaProperties[attribute.resolved_identifier] = {
              type: "string",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
                attributeSpec: attribute,
              },
            });

            localFormData[attribute.resolved_identifier] =
              resourceData[attribute.resolved_identifier];
            break;

          case "Documentor":
            localSchemaProperties[attribute.resolved_identifier] = {
              type: "string",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
                attributeSpec: attribute,
              },
            });

            localFormData[attribute.resolved_identifier] =
              resourceData[attribute.resolved_identifier];
            break;

          case "MaterialUIDefault":
            const defaultSchemaObject = resolveByDot(
              `ui.${action}.schemaObject`,
              attribute
            );

            localSchemaProperties[attribute.resolved_identifier] =
              defaultSchemaObject;

            localUISchemaElements.push({
              type: "Control",
              label: attribute.label,
              scope: `#/properties/${attribute.resolved_identifier}`,
            });

            localFormData[attribute.resolved_identifier] =
              resourceData[attribute.resolved_identifier];

            break;

          default:
            break;
        }
      } else {
        if (type !== "array") {
          localFormData[attribute.resolved_identifier] =
            resourceData[attribute.resolved_identifier];
        }
      }
    }

    console.log("localFormData", localSchemaProperties);

    return { localSchemaProperties, localUISchemaElements, localFormData };
  };

  useEffect(() => {
    const attributes = resourceSpec?.attributes;
    // const localSchemaProperties: any = {};
    // const localUISchemaElements: any = [];
    // const localFormData: any = {};

    // console.log("CreateOrEdit Mounted");

    (async () => {
      // console.log("localSchemaProperties", localSchemaProperties);

      const { localSchemaProperties, localUISchemaElements, localFormData } =
        await prepareJsonFormsSchema(attributes);

      await Promise.all([
        await setSchema((prev: any) => {
          prev.properties = localSchemaProperties;
          return { ...prev };
        }),
        await setUISchema((prev: any) => {
          prev.elements = localUISchemaElements;
          return { ...prev };
        }),
        await setFormData((prev: any) => {
          return { ...localFormData };
        }),
      ]);
      await setReady(true);
    })();

    // console.log("localSchema", localSchema);
    // console.log("localUISchema", localUISchema);
  }, []);

  return (
    <FormWrapper
      resourceSpec={resourceSpec}
      title={resourceSpec.label}
      description={
        action === "update"
          ? `Update ${resourceSpec.label}`
          : `Create ${resourceSpec.label}`
      }
    >
      <div>
        <div className="border border-gray-300 dark:border-gray-800 sm:rounded-md p-1 max-w-full">
          <div className="max-w-full px-4 py-5 bg-white dark:bg-gray-900 sm:p-6">
            {ready && (
              <JsonForms
                schema={schema}
                uischema={uischema}
                data={formData}
                renderers={renderers}
                cells={materialCells}
                onChange={({ data }) => {
                  return setFormData(data);
                }}
                validationMode="NoValidation"
                additionalErrors={additionalErrors}
              />
            )}

            {/* <div className="grid grid-cols-6 gap-6">{formList}</div> */}
          </div>

          <div className="flex items-center justify-end px-4 py-3 text-right bg-gray-50 dark:bg-gray-800 sm:px-6">
            <ButtonBase
              type="button"
              onClick={() => {
                handleSubmit();
              }}
              label={action === "update" ? "Update" : "Create"}
              disabled={formInstance.busy}
              busyText={"Processing.."}
            />
          </div>
        </div>
      </div>
    </FormWrapper>
  );
}

export default CreateOrEditForm;
