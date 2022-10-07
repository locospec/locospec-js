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

const TextAreaControl = (props: any) => {
  const [value, setValue] = React.useState<any>(
    props.data === (undefined || null) ? "" : props.data
  );

  useEffectAfterFirstRender(() => {
    setValue(props.data);
  }, [props.data]);

  return (
    <TextAreaBase
      autoGrow={true}
      value={value}
      name={props.label}
      labelBaseProps={{ label: props.label }}
      error={props.errors ? <ErrorText errors={[props.errors]} /> : null}
      onChange={(v: any) => {
        props.handleChange(props.path, v);
      }}
    />
  );
};

export default withJsonFormsControlProps(TextAreaControl);
