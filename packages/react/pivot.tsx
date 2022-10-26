import { HomeIcon } from "@heroicons/react/solid";
import { NavigationPageHeading, ButtonBase } from "@reusejs/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { renderers } from "./jsonFormComponents";
import { PickerCheckboxSimple } from "@reusejs/react";
import resolveByDot from "./helpers/resolveByDot";
import { materialCells } from "@jsonforms/material-renderers";
import { JsonForms } from "@jsonforms/react";
import FormWrapper from "./helpers/FormWrapper";
import { callLoco, getByUuid } from "./helpers/callLoco";

const NextJSLink = (props: any) => {
  let { href, children, ...rest } = props;
  return (
    <Link href={href} legacyBehavior>
      <a {...rest}>{children}</a>
    </Link>
  );
};

const Pivot = ({
  resourceSpec,
  router,
  formInstance,
  primaryIdentifier,
  routePrefix,
}: {
  resourceSpec: any;
  router: any;
  formInstance: any;
  primaryIdentifier: any;
  routePrefix: any;
}) => {
  let endpoint = router.query?.loco;
  const attributeIdentifier = endpoint[2];
  const [additionalErrors, setAdditionalErrors] = useState<any>([]);

  const [readOne, setReadOne] = useState<any>({});
  const [ready, setReady] = useState(false);
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
  const [attributeSpec, setAttributeSpec] = useState<any>({});

  const handleSubmit = async (e: any) => {
    try {
      const payload = formData;

      payload["uuid"] = primaryIdentifier;

      for (const key in payload) {
        if (Object.prototype.hasOwnProperty.call(payload, key)) {
          const element = payload[key];
          if (typeof element === "object" && element !== null) {
            if (Array.isArray(element)) {
              console.log("is array");
              payload[key] = element.map((e: any) => {
                return e["value"];
              });
            } else {
              payload[key] = element["value"];
            }
          }
        }
      }

      console.log("createStateForm", payload);

      e.preventDefault();
      formInstance.startProcessing();
      await callLoco(routePrefix, resource, `_patch`, payload);
      formInstance.finishProcessing();
      router.push(`/${resource}/${primaryIdentifier}`);
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
    const attributes = resourceSpec.attributes;
    const attributeSpec = attributes.find((element: any) => {
      return element.identifier === attributeIdentifier;
    });

    setAttributeSpec(attributeSpec);

    // console.log("attributeSpec", attributeSpec);

    (async () => {
      const resourceData: any = await getByUuid(
        routePrefix,
        resourceSpec.name,
        primaryIdentifier
      );
      setReadOne(resourceData);

      const localSchemaProperties: any = {};
      const localUISchemaElements: any = [];
      const localFormData: any = {};
      const uiComponent = resolveByDot(`ui.create.component`, attributeSpec);
      //   console.log("uiComponent", uiComponent);

      if (uiComponent !== undefined) {
        switch (uiComponent) {
          case "MultiPickerCheckboxSimple":
            localSchemaProperties[attributeSpec.resolved_identifier] = {
              type: "array",
            };
            localUISchemaElements.push({
              type: "Control",
              label: attributeSpec.label,
              scope: `#/properties/${attributeSpec.resolved_identifier}`,
              options: {
                reusejs: uiComponent,
                loco: {
                  resource: attributeSpec.relation.resource,
                  prefix: routePrefix,
                },
              },
            });

            if (resourceData[attributeSpec.resolved_identifier].length > 0) {
              let selectedValues = resourceData[
                attributeSpec.resolved_identifier
              ].map((v: any) => {
                let newV: any = {};
                newV["value"] = v[attributeSpec.relation.resourceLocalKey];
                return newV;
              });
              console.log("selectedValues", selectedValues);
              localFormData[attributeSpec.resolved_identifier] = selectedValues;
            } else {
              localFormData[attributeSpec.resolved_identifier] = [];
            }

            console.log("response", attributeSpec);

            break;
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

      setReady(true);
    })();
  }, []);

  const HeadingActions = () => {
    return <div className="flex space-x-2"></div>;
  };

  return (
    <>
      <FormWrapper
        resourceSpec={resourceSpec}
        title={resourceSpec.label}
        description={`Update ${attributeSpec.label}`}
      >
        <form action="#" method="POST" onSubmit={(e) => handleSubmit(e)}>
          <div className="border border-gray-300 dark:border-gray-800 sm:rounded-md p-1">
            <div className="px-4 py-5 bg-white dark:bg-gray-900 sm:p-6">
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
            </div>

            <div className="flex items-center justify-end px-4 py-3 text-right bg-gray-50 dark:bg-gray-800 sm:px-6">
              <ButtonBase
                type="submit"
                label={"Save"}
                disabled={formInstance.busy}
                busyText={"Processing.."}
              />
            </div>
          </div>
        </form>
      </FormWrapper>
    </>
  );
};

export default Pivot;
