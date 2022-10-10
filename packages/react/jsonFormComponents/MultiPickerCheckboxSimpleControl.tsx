import { useJsonForms, withJsonFormsControlProps } from "@jsonforms/react";
import { PickerCheckboxSimple } from "@reusejs/react";
import * as React from "react";
import { callLoco } from "../helpers/callLoco";

const ErrorText = (props: any) => (
  <div className="mt-2 text-xs text-red-500 lowercase">
    <ul className="list-none ml-2">
      {/* {JSON.stringify(props.errors, undefined, 2)} */}
      {props.errors.map((m: string, index: any) => (
        <li key={index}>{m}</li>
      ))}
    </ul>
  </div>
);

interface TextInputControlProps {
  data: any;
  handleChange(path: string, value: any): void;
  path: string;
}

const MultiPickerCheckboxSimpleControl = (props: any) => {
  const ctx = useJsonForms();
  const [refresh, setRefresh] = React.useState<string>("0");
  const [value, setValue] = React.useState<any>(
    props.data !== undefined && Object.keys(props.data).length > 0
      ? props.data
      : []
  );

  // console.log("props.data", props.data);

  const locoSpec = props.uischema.options.loco;
  //   console.log("MultiPickerCheckboxSimpleControl", props.path, locoSpec);

  return (
    <>
      <PickerCheckboxSimple
        scrollableBaseProps={{
          scrollableBaseClasses: {
            position: "z-50 block space-y-4",
            maxHeight: "none",
            border: "border-0",
            background: "bg-white",
            borderRadius: "",
          },
        }}
        valueKey="value"
        name={props.label}
        multiple={true}
        defaultSelected={value}
        dataSource={async (query: any) => {
          let response: any = await callLoco(
            locoSpec.prefix,
            locoSpec.resource,
            `_read`,
            {
              limitBy: {
                per_page: 999,
                page: 1,
              },
            }
          );
          return response?.data.map((d: any) => {
            return {
              value: d.uuid,
              label: d.name,
              slug: d.slug,
            };
          });
        }}
        error={props.errors ? <ErrorText errors={[props.errors]} /> : null}
        onChange={(v: any) => {
          props.handleChange(props.path, v);
        }}
      />
    </>
  );
};

export default withJsonFormsControlProps(MultiPickerCheckboxSimpleControl);
