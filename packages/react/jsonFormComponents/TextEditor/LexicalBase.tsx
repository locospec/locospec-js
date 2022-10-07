import { withJsonFormsControlProps } from "@jsonforms/react";
import { ButtonBase, FileUploaderBase, LabelBase } from "@reusejs/react";

import { $getRoot, $getSelection } from "lexical";
import { useEffect, useRef, useState } from "react";

import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { PlainTextPlugin } from "@lexical/react/LexicalPlainTextPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import TreeViewPlugin from "./plugins/TreeViewPlugin";
import ToolbarPlugin from "./plugins/ToolbarPlugin";
import { $generateHtmlFromNodes } from "@lexical/html";
import PlaygroundNodes from "./nodes/PlaygroundNodes";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import TableCellActionMenuPlugin from "./plugins/TableActionMenuPlugin";
import theme from "./theme";

// When the editor changes, you can get notified via the
// LexicalOnChangePlugin!
function onChange(editorState: any, editor: any) {
  editorState.read(() => {
    // Read the contents of the EditorState here.
    const root = $getRoot();
    const selection = $getSelection();

    // console.log(root, selection);
  });
}

function SavePlugin() {
  const [editor] = useLexicalComposerContext();

  const onSubmit = () => {
    console.log(JSON.stringify(editor.getEditorState()));
  };

  return (
    <button className="bg-blue-500 p-2 text-white" onClick={onSubmit}>
      Submit
    </button>
  );
}

// Lexical React plugins are React components, which makes them
// highly composable. Furthermore, you can lazy load plugins if
// desired, so you don't pay the cost for plugins until you
// actually use them.
function MyCustomAutoFocusPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Focus the editor when the effect fires!
    editor.focus();
  }, [editor]);

  return null;
}

// Catch any errors that occur during Lexical updates and log them
// or throw them as needed. If you don't throw them, Lexical will
// try to recover gracefully without losing user data.
function onError(error: any) {
  console.error(error);
}

function Editor(props: any) {
  // console.log("props", props);

  const editorStateRef = useRef();

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  const loadContent = () => {
    return props?.data?.json || null;
  };

  const initialConfig = {
    namespace: "MyEditor",
    theme,
    onError,
    nodes: [...PlaygroundNodes],
    editorState: loadContent(),
  };

  return (
    <div
      style={{
        maxWidth: "unset !important",
      }}
    >
      <div className="flex justify-between items-center border-b pb-2 w-full">
        <LabelBase label={props.label} />
      </div>

      <LexicalComposer initialConfig={initialConfig}>
        <div className="w-full">
          <ToolbarPlugin />
          <div className="font-base relative mb-4 border font-normal">
            <RichTextPlugin
              contentEditable={
                <div className="relative h-full" ref={onRef}>
                  <ContentEditable className="w-full h-96 p-2 outline-none overflow-scroll" />
                </div>
              }
              placeholder={<Placeholder />}
            />
          </div>
          <OnChangePlugin
            onChange={(editorState: any, editor: any) => {
              editor.update(() => {
                let payload: any = {};

                const htmlString = $generateHtmlFromNodes(editor, null);
                payload["html"] = htmlString;
                payload["json"] = JSON.stringify(editor.getEditorState());

                console.log("payload", props.path);

                // payload = payload["html"];

                props.handleChange(props.path, JSON.stringify(payload));
              });

              onChange(editorState, editor);
            }}
          />
          <TablePlugin />

          <HistoryPlugin />
          <MyCustomAutoFocusPlugin />
          {/* <TreeViewPlugin /> */}
          <ListPlugin />
          {floatingAnchorElem && (
            <>
              {/* <TableCellActionMenuPlugin anchorElem={floatingAnchorElem} /> */}
            </>
          )}
        </div>
      </LexicalComposer>
    </div>
  );
}

function Placeholder() {
  return (
    <div className="text pointer-events-none absolute top-0 p-2 text-gray-500">
      Start typing..
    </div>
  );
}

export default withJsonFormsControlProps(Editor);
