import {
  materialRenderers,
  materialCells,
} from "@jsonforms/material-renderers";

import TextInputControl from "./TextInputControl";
import TextInputControlTester from "./TextInputControlTester";
import TextAreaControl from "./TextAreaControl";
import TextAreaControlTester from "./TextAreaControlTester";
import SingleFileUploadControlTester from "./SingleFileUploadControlTester";
import MultiFileUploadControlTester from "./MultiFileUploadControlTester";
import SingleFileUploadControl from "./SingleFileUploadControl";
import MultiFileUploadControl from "./MultiFileUploadControl";
import ToggleControl from "./ToggleControl";
import ToggleControlTester from "./ToggleControlTester";
import SinglePickerSelectSimpleControl from "./SinglePickerSelectSimpleControl";
import SinglePickerSelectSimpleControlTester from "./SinglePickerSelectSimpleControlTester";

import MultiPickerCheckboxSimpleControl from "./MultiPickerCheckboxSimpleControl";
import MultiPickerCheckboxSimpleControlTester from "./MultiPickerCheckboxSimpleControlTester";
import TextEditorControlTester from "./TextEditorControlTester";
import TextEditorControl from "./TextEditor/LexicalBase";

const renderers = [
  ...materialRenderers,
  //register custom renderers
  { tester: TextInputControlTester, renderer: TextInputControl },
  {
    tester: SinglePickerSelectSimpleControlTester,
    renderer: SinglePickerSelectSimpleControl,
  },
  {
    tester: MultiPickerCheckboxSimpleControlTester,
    renderer: MultiPickerCheckboxSimpleControl,
  },
  {
    tester: TextAreaControlTester,
    renderer: TextAreaControl,
  },
  {
    tester: ToggleControlTester,
    renderer: ToggleControl,
  },
  {
    tester: SingleFileUploadControlTester,
    renderer: SingleFileUploadControl,
  },
  {
    tester: MultiFileUploadControlTester,
    renderer: MultiFileUploadControl,
  },
  {
    tester: TextEditorControlTester,
    renderer: TextEditorControl,
  },
];

export { renderers };
