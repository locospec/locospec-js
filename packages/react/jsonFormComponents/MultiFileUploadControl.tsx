import * as React from "react";
import { withJsonFormsControlProps } from "@jsonforms/react";
import { ButtonBase, FileUploaderBase, LabelBase } from "@reusejs/react";
import useEffectAfterFirstRender from "./useEffectAfterFirstRender";
import { createFile } from "../helpers/callMental";

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
        <div className="flex justify-between items-center border-b pb-2">
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
        <div className="flex justify-between items-center border-b pb-2">
          <LabelBase label={"Uploaded Files"} />
          <ButtonBase
            type="button"
            label={`Uploaded ${props.afterUploadedFiles.length} files`}
          />
        </div>

        {props.afterUploadedFiles.length > 0 && (
          <>
            <div className="mt-4">
              {props.afterUploadedFiles.map((file: any, index: number) => {
                return <div key={index}>{file.file_name}</div>;
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const MultiFileUploadControl = (props: any) => {
  const [value, setValue] = React.useState<any>(
    props.data === (undefined || null) ? "" : props.data
  );

  const [beforeUploadedFiles, setBeforeUploadedFiles] = React.useState<any>([]);
  const [afterUploadedFiles, setAfterUploadedFiles] = React.useState<any>([]);
  const [selectedFiles, setSelectedFiles] = React.useState<any>([]);

  const mentalSpec = props.uischema.options.mental;

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
          multiple={true}
          autoUpload={false}
          selectedFiles={(selectedFiles) => {
            setSelectedFiles(selectedFiles);
          }}
          upload={async (selectedFile) => {
            return await createFile("files", selectedFile, mentalSpec.params);
          }}
          beforeUpload={(uploadedFiles) => {
            // console.log("beforeUpload", uploadedFiles);
          }}
          afterUpload={(uploadedFiles) => {
            // console.log("uploadedFiles", uploadedFiles);
            setAfterUploadedFiles(uploadedFiles);
            setSelectedFiles([]);
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

export default withJsonFormsControlProps(MultiFileUploadControl);
