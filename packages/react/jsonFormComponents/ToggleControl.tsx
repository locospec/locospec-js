import * as React from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import {
  ButtonBase,
  TextInputBase,
  TextAreaBase,
  PickerSelectSimple,
  ToggleBase,
} from "@reusejs/react";
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

const ToggleControl = (props: any) => {
  const [value, setValue] = React.useState<any>(
    props.data === (undefined || null) ? false : props.data
  );

  useEffectAfterFirstRender(() => {
    setValue(props.data);
  }, [props.data]);

  return (
    <ToggleBase
      defaultValue={value}
      labelBaseProps={{ label: props.label }}
      onChange={(v: any) => {
        props.handleChange(props.path, v);
      }}
    />
  );
};

export default withJsonFormsControlProps(ToggleControl);
