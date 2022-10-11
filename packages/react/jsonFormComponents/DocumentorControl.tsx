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
import { EditorComposer } from "@reusejs/documentor";

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

const DocumentorControl = (props: any) => {
  const [value, setValue] = React.useState<any>(
    props.data === (undefined || null) ? {} : props.data
  );

  useEffectAfterFirstRender(() => {
    setValue(props.data);
  }, [props.data]);

  return (
    <EditorComposer
      initialEditorState={(value && value.json) || null}
      onChange={(payload: any) => {
        props.handleChange(props.path, JSON.stringify(payload));
      }}
    ></EditorComposer>
  );
};

export default withJsonFormsControlProps(DocumentorControl);
