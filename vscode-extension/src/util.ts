import * as vscode from "vscode";

export function getNonce() {
  let text = "";
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

export function getCurrentTabIndex() {
  const group = vscode.window.tabGroups.activeTabGroup;
  const tabs = group.tabs;
  const index = tabs.findIndex((tab) => tab.isActive);

  return index + 1;
}

export function getCurrentEditorUri() {
  // First, check if there is an active text editor
  if (vscode.window.activeTextEditor) {
    const documentUri = vscode.window.activeTextEditor.document.uri;
    console.log("Current active text editor URI:", documentUri.toString());
    return documentUri;
  }

  // If no active text editor, check active tab in tab groups
  const activeTab = vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .find((tab) => tab.isActive);

  if (activeTab && activeTab.input && (activeTab.input as any).uri) {
    console.log(
      "Current active non-text editor URI:",
      (activeTab.input as any).uri.toString()
    );
    return (activeTab.input as any).uri;
  }

  console.log("No active editor with a URI found.");
  return null;
}
