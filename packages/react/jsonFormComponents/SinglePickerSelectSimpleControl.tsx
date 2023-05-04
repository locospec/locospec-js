import * as React from "react";
import { withJsonFormsControlProps, JsonFormsDispatch } from "@jsonforms/react";
import {
  ButtonBase,
  TextInputBase,
  TextAreaBase,
  PickerSelectSimple,
  ToggleBase,
} from "@reusejs/react";
import { callLoco } from "../helpers/callLoco";
import { useJsonForms } from "@jsonforms/react";
import useEffectAfterFirstRender from "./useEffectAfterFirstRender";

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

const PickerSelectSimpleControl = (props: any) => {
  const ctx = useJsonForms();
  const [disabled, setDisabled] = React.useState<any>(!props.enabled);
  const [dependsOnValue, setDependsOnValue] = React.useState<any>({});
  const [refresh, setRefresh] = React.useState<string>("0");
  const [value, setValue] = React.useState<any>(
    props.data !== undefined && Object.keys(props.data).length > 0
      ? [props.data]
      : []
  );

  // console.log("props.data", props.data);

  const locoSpec = props.uischema.options.loco;
  // console.log("PickerSelectSimpleControl", props.path, locoSpec.dependsOn);

  React.useEffect(() => {
    if (props.path === "city_uuid") {
      console.log("mounted selectpiker", ctx?.core?.data);
    }
  }, []);

  if (locoSpec.dependsOn !== undefined) {
    useEffectAfterFirstRender(() => {
      let dependsOnValue = ctx?.core?.data[locoSpec.dependsOn.attribute];
      let dependsOnValueKeys = Object.keys(dependsOnValue);

      if (dependsOnValueKeys.length > 0) {
        setDependsOnValue(dependsOnValue);
        setDisabled(false);
      } else {
        setDisabled(true);
      }

      props.handleChange(props.path, []);
      setRefresh((prev: string) => {
        return prev + 1;
      });
    }, [ctx?.core?.data[locoSpec.dependsOn.attribute]]);
  }

  return (
    <PickerSelectSimple
      refresh={refresh}
      valueKey="value"
      enableClear={false}
      enableClose={false}
      multiple={false}
      disabled={disabled}
      enableSearch={true}
      defaultSelected={value}
      dataSource={async (query: any) => {
        // console.log("query", query === "");
        if (props.uischema.staticData) {
          return props.uischema.staticData;
        } else {
          let filterBy: any = [];

          if (query !== undefined) {
            filterBy.push({
              attribute: props.uischema.nameKey,
              op: "LIKE",
              value: query,
            });
          }

          if (
            locoSpec.dependsOn !== undefined &&
            Object.keys(ctx?.core?.data[locoSpec.dependsOn.attribute]).length >
              0
          ) {
            filterBy.push({
              attribute: locoSpec.dependsOn.filterBy,
              op: "eq",
              value: ctx?.core?.data[locoSpec.dependsOn.attribute]["value"],
            });
          }

          // if (props.path === "district" && ctx?.core?.data?.state.length > 0) {
          //   filterBy.push({
          //     attribute: "state",
          //     value: [ctx?.core?.data?.state[0]["slug"]],
          //   });
          // }

          // console.log("dataSource", filterBy);
          let response: any = await callLoco(
            locoSpec.prefix,
            locoSpec.resource,
            `_read`,
            {
              filterBy: filterBy,
            }
          );
          // // console.log("Search", query, response);
          return response?.data.map((d: any) => {
            return {
              value: d.uuid,
              label: d[props.uischema.nameKey],
              slug: d.slug,
            };
          });
          // return [];
        }
      }}
      labelBaseProps={{ label: props.label }}
      error={props.errors ? <ErrorText errors={[props.errors]} /> : null}
      onChange={(v: any) => {
        // console.log("v", v);
        props.handleChange(props.path, v);
      }}
    />
  );
};

export default withJsonFormsControlProps(PickerSelectSimpleControl);
