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
// import DocumentorControl from "./DocumentorControl";
import DocumentorControlTester from "./DocumentorControlTester";

import dynamic from "next/dynamic";

const DocumentorControl = dynamic(() => import("./DocumentorControl"), {
  ssr: false,
});

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
    tester: DocumentorControlTester,
    renderer: DocumentorControl,
  },
];

export { renderers };
