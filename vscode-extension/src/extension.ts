// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { PulseEditorProvider } from "./pulse-editor-provider";
import { getCurrentEditorUri, getCurrentTabIndex } from "./util";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "Pulse" is now active!');

  let isEditInPulse = false;

  vscode.window.onDidChangeActiveTextEditor((doc) => {
    const uri = doc?.document.uri.toString();
    isEditInPulse = false;
    if (uri) {
      // Set isEditInPulse context to false because the editor is text editor
      vscode.commands.executeCommand(
        "setContext",
        "pulse.isEditInPulse",
        isEditInPulse
      );
    }
  });

  let command_edit_studio = vscode.commands.registerCommand(
    "pulse.editInPulse",
    () => {
      if (isEditInPulse) {
        return;
      }
      isEditInPulse = true;
      vscode.window.showInformationMessage("Editing in Pulse Editor!");
      vscode.commands.executeCommand(
        "setContext",
        "pulse.isEditInPulse",
        isEditInPulse
      );

      // Close and reopen editor with "pulse.editorWebview" view type
      const file = getCurrentEditorUri();
      const tab_index = getCurrentTabIndex();
      vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      vscode.commands.executeCommand(
        "vscode.openWith",
        file,
        PulseEditorProvider.viewType
      );

      // Re-order tabs
      vscode.commands.executeCommand("moveActiveEditor", {
        to: "position",
        value: tab_index,
      });
    }
  );

  let command_edit_vscode = vscode.commands.registerCommand(
    "pulse.editInVSCode",
    () => {
      if (!isEditInPulse) {
        return;
      }
      isEditInPulse = false;
      vscode.window.showInformationMessage("Editing in VSCode!");
      vscode.commands.executeCommand(
        "setContext",
        "pulse.isEditInPulse",
        isEditInPulse
      );

      // Close and reopen the editor with "default" view type
      const file = getCurrentEditorUri();
      const tab_index = getCurrentTabIndex();
      vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      vscode.commands.executeCommand("vscode.openWith", file, "default");

      // Re-order tabs
      vscode.commands.executeCommand("moveActiveEditor", {
        to: "position",
        value: tab_index,
      });
    }
  );

  const setIsEditInPulse = (value: boolean) => {
    isEditInPulse = value;
    vscode.commands.executeCommand(
      "setContext",
      "pulse.isEditInPulse",
      isEditInPulse
    );
  };
  context.subscriptions.push(
    PulseEditorProvider.register(context, setIsEditInPulse)
  );
  context.subscriptions.push(command_edit_studio);
  context.subscriptions.push(command_edit_vscode);
}

// This method is called when your extension is deactivated
export function deactivate() {}
