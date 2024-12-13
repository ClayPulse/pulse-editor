// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { ChiselEditorProvider } from "./chisel-editor-provider";
import { getCurrentEditorUri, getCurrentTabIndex } from "./util";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('Congratulations, your extension "Chisel" is now active!');

  let isEditInChisel = false;

  vscode.window.onDidChangeActiveTextEditor((doc) => {
    const uri = doc?.document.uri.toString();
    isEditInChisel = false;
    if (uri) {
      // Set isEditInChisel context to false because the editor is text editor
      vscode.commands.executeCommand(
        "setContext",
        "chisel.isEditInChisel",
        isEditInChisel
      );
    }
  });

  let command_edit_studio = vscode.commands.registerCommand(
    "chisel.editInChisel",
    () => {
      if (isEditInChisel) {
        return;
      }
      isEditInChisel = true;
      vscode.window.showInformationMessage("Editing in Chisel Editor!");
      vscode.commands.executeCommand(
        "setContext",
        "chisel.isEditInChisel",
        isEditInChisel
      );

      // Close and reopen editor with "chisel.editorWebview" view type
      const file = getCurrentEditorUri();
      const tab_index = getCurrentTabIndex();
      vscode.commands.executeCommand("workbench.action.closeActiveEditor");
      vscode.commands.executeCommand(
        "vscode.openWith",
        file,
        ChiselEditorProvider.viewType
      );

      // Re-order tabs
      vscode.commands.executeCommand("moveActiveEditor", {
        to: "position",
        value: tab_index,
      });
    }
  );

  let command_edit_vscode = vscode.commands.registerCommand(
    "chisel.editInVSCode",
    () => {
      if (!isEditInChisel) {
        return;
      }
      isEditInChisel = false;
      vscode.window.showInformationMessage("Editing in VSCode!");
      vscode.commands.executeCommand(
        "setContext",
        "chisel.isEditInChisel",
        isEditInChisel
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

  const setIsEditInChisel = (value: boolean) => {
    isEditInChisel = value;
    vscode.commands.executeCommand(
      "setContext",
      "chisel.isEditInChisel",
      isEditInChisel
    );
  };
  context.subscriptions.push(
    ChiselEditorProvider.register(context, setIsEditInChisel)
  );
  context.subscriptions.push(command_edit_studio);
  context.subscriptions.push(command_edit_vscode);
}

// This method is called when your extension is deactivated
export function deactivate() {}
