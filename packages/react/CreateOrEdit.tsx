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
  console.log("router", router);

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

  const handleSubmit = async (e: any) => {
    try {
      const payload = formData;

      if (action === "update") {
        payload["uuid"] = primaryIdentifier;
      }

      for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          const element = payload[key];

          // console.log("element", element, typeof element);

          if (typeof element === "object" && element !== null) {
            payload[key] = element["value"];
          }
        }
      }

      // console.log("createStateForm", action, formData);

      e.preventDefault();
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

  useEffect(() => {
    const attributes = resourceSpec?.attributes;
    const localSchemaProperties: any = {};
    const localUISchemaElements: any = [];
    const localFormData: any = {};

    // console.log("resourceData", resourceData);

    (async () => {
      for (let index = 0; index < attributes.length; index++) {
        const attribute = attributes[index];
        const uiComponent = resolveByDot(`ui.${action}.component`, attribute);
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
              // console.log("attribute", attribute);
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
                    resource: attribute.relation.resource,
                    prefix: routePrefix,
                  },
                },
              });

              if (action === "update") {
                console.log("resourceData", resourceData);
                let response: any = await getByUuid(
                  routePrefix,
                  attribute.relation.resource,
                  resourceData[attribute.resolved_identifier]
                );
                response["label"] = response["name"];
                response["value"] = response["uuid"];

                localFormData[attribute.resolved_identifier] = response;
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

            default:
              break;
          }
        } else {
          localFormData[attribute.resolved_identifier] =
            resourceData[attribute.resolved_identifier];
        }
      }

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
      <form action="#" method="POST" onSubmit={(e) => handleSubmit(e)}>
        <div className="border border-gray-300 dark:border-gray-800 sm:rounded-md p-1 max-w-full">
          <div className="max-w-full px-4 py-5 bg-white dark:bg-gray-900 sm:p-6">
            {ready && (
              <JsonForms
                schema={schema}
                uischema={uischema}
                data={formData}
                renderers={renderers}
                cells={materialCells}
                onChange={({ data }) => setFormData(data)}
                validationMode="NoValidation"
                additionalErrors={additionalErrors}
              />
            )}

            {/* <div className="grid grid-cols-6 gap-6">{formList}</div> */}
          </div>

          <div className="flex items-center justify-end px-4 py-3 text-right bg-gray-50 dark:bg-gray-800 sm:px-6">
            <ButtonBase
              type="submit"
              label={action === "update" ? "Update" : "Create"}
              disabled={formInstance.busy}
              busyText={"Processing.."}
            />
          </div>
        </div>
      </form>
    </FormWrapper>
  );
}

export default CreateOrEditForm;
