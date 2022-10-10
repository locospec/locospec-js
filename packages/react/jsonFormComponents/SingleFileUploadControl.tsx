import * as React from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { ButtonBase, FileUploaderBase, LabelBase } from "@reusejs/react";
import useEffectAfterFirstRender from "./useEffectAfterFirstRender";
import { createFile } from "../helpers/callLoco";

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

const OpenFileUploader = (props: any) => {
  return (
    <div className="mt-2 grid grid-cols-2 grid-flow-col gap-4">
      <div className="bg-gray-50 py-2 px-2 border">
        <div className="flex justify-between items-center border-b pb-4">
          <LabelBase label={"Upload File"} />
          <ButtonBase
            type="button"
            label="Select File"
            onClick={() => {
              props.triggerClickHandler();
            }}
          />
        </div>

        <div className="mt-4">
          {props.selectedFiles.length > 0 && (
            <>
              <div>
                {props.selectedFiles.map((file: any, index: number) => {
                  return <div key={index}>{file.file.name}</div>;
                })}
              </div>

              <div className="mt-2">
                <ButtonBase
                  type="button"
                  label="Upload"
                  onClick={() => {
                    props.fileUploadRef?.current?.triggerUpload();
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bg-gray-50 py-2 px-2 border">
        <div className="flex justify-between items-center border-b pb-4">
          <LabelBase label={"Uploaded Files"} />
        </div>
        <div>{props.value && props.value.uuid}</div>
      </div>
    </div>
  );
};

const SingleFileUploadControl = (props: any) => {
  const [value, setValue] = React.useState<any>(
    props.data === (undefined || null) ? "" : props.data
  );

  const [beforeUploadedFiles, setBeforeUploadedFiles] = React.useState<any>([]);
  const [afterUploadedFiles, setAfterUploadedFiles] = React.useState<any>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<any>([]);

  const attributeSpec = props.uischema.options.attributeSpec;
  const locoSpec = props.uischema.options.loco;

  // console.log("attributeSpec", attributeSpec);

  let params = attributeSpec.relation.filter;
  params[attributeSpec.relation.foreignKey] = attributeSpec.primaryIdentifier;

  // console.log("params", params);

  const fileUploadRef = React.useRef();

  useEffectAfterFirstRender(() => {
    setValue(props.data);
  }, [props.data]);

  return (
    <>
      <LabelBase label={props.label} />
      <div className="mt-1">
        <FileUploaderBase
          ref={fileUploadRef}
          multiple={false}
          autoUpload={false}
          selectedFiles={(selectedFiles) => {
            setSelectedFiles(selectedFiles);
          }}
          upload={async (selectedFile) => {
            return await createFile(
              locoSpec.prefix,
              "files",
              selectedFile,
              params
            );
          }}
          beforeUpload={(uploadedFiles) => {
            // console.log("beforeUpload", uploadedFiles);
          }}
          afterUpload={(uploadedFiles) => {
            setSelectedFiles([]);
            props.handleChange(props.path, uploadedFiles[0]);
          }}
          openFileUploader={(triggerClickHandler) => (
            <OpenFileUploader
              selectedFiles={selectedFiles}
              afterUploadedFiles={afterUploadedFiles}
              triggerClickHandler={triggerClickHandler}
              fileUploadRef={fileUploadRef}
              value={value}
            />
          )}
        />
      </div>
    </>
  );
};

export default withJsonFormsControlProps(SingleFileUploadControl);
