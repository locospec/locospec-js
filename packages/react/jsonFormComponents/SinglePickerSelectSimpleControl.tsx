import * as React from "react";
import { withJsonFormsControlProps, JsonFormsDispatch } from "@jsonforms/react";
import {
  ButtonBase,
  TextInputBase,
  TextAreaBase,
  PickerSelectSimple,
  ToggleBase,
} from "@reusejs/react";
import { callMental } from "../helpers/callMental";
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
  const [refresh, setRefresh] = React.useState<string>("0");
  const [value, setValue] = React.useState<any>(
    props.data !== undefined && Object.keys(props.data).length > 0
      ? [props.data]
      : []
  );

  // console.log("props.data", props.data);

  const mentalSpec = props.uischema.options.mental;
  //   console.log("PickerSelectSimpleControl", props.path, mentalSpec);

  if (mentalSpec.dependsOn !== undefined) {
    useEffectAfterFirstRender(() => {
      console.log(
        "Changed",
        mentalSpec.dependsOn,
        ctx?.core?.data[mentalSpec.dependsOn]
      );
      props.handleChange(props.path, []);
      setRefresh((prev: string) => {
        return prev + 1;
      });
    }, [ctx?.core?.data[mentalSpec.dependsOn]]);
  }

  return (
    <PickerSelectSimple
      refresh={refresh}
      valueKey="value"
      enableClear={false}
      enableClose={false}
      multiple={false}
      disabled={!props.enabled}
      enableSearch={true}
      defaultSelected={value}
      dataSource={async (query: any) => {
        // console.log("query", query === "");

        let filterBy: any = [];

        if (query !== undefined) {
          filterBy.push({
            attribute: "name",
            op: "LIKE",
            value: query,
          });
        }

        // if (props.path === "district" && ctx?.core?.data?.state.length > 0) {
        //   filterBy.push({
        //     attribute: "state",
        //     value: [ctx?.core?.data?.state[0]["slug"]],
        //   });
        // }

        // console.log("dataSource", filterBy);
        let response: any = await callMental(mentalSpec.resource, `_read`, {
          filterBy: filterBy,
        });
        // // console.log("Search", query, response);
        return response?.data.map((d: any) => {
          return {
            value: d.uuid,
            label: d.name,
            slug: d.slug,
          };
        });
        // return [];
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
