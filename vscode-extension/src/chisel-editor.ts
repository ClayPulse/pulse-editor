import * as vscode from "vscode";
import { getNonce } from "./util";

/**
 * Provider for cat scratch editors.
 *
 * Cat scratch editors are used for `.cscratch` files, which are just json files.
 * To get started, run this extension and open an empty `.cscratch` file in VS Code.
 *
 * This provider demonstrates:
 *
 * - Setting up the initial webview for a custom editor.
 * - Loading scripts and styles in a custom editor.
 * - Synchronizing changes between a text document and a custom editor.
 */
export class ChiselEditorProvider
  implements vscode.CustomTextEditorProvider
{
  public static register(
    context: vscode.ExtensionContext,
    setIsEditInChisel: (isEditInChisel: boolean) => void
  ): vscode.Disposable {
    const provider = new ChiselEditorProvider(
      context,
      setIsEditInChisel
    );
    const providerRegistration = vscode.window.registerCustomEditorProvider(
      ChiselEditorProvider.viewType,
      provider
    );
    return providerRegistration;
  }

  public static readonly viewType = "chisel.editorWebview";
  private readonly chisel_editor = "http://localhost:3000";

  constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly setIsEditInChisel: (isEditInChisel: boolean) => void
  ) {}

  /**
   * Called when our custom editor is opened.
   *
   *
   */
  public async resolveCustomTextEditor(
    document: vscode.TextDocument,
    webviewPanel: vscode.WebviewPanel,
    _token: vscode.CancellationToken
  ): Promise<void> {
    // Setup initial content for the webview
    webviewPanel.webview.options = {
      enableScripts: true,
    };
    webviewPanel.webview.html = await this.getHtmlForWebview(
      webviewPanel.webview
    );
    webviewPanel.webview.onDidReceiveMessage((e) => {
      if (e.command === "switchToTextEditor") {
        vscode.commands.executeCommand("chisel.editInVSCode");
      }
    });

    webviewPanel.onDidChangeViewState((e) => {
      if (e.webviewPanel.active) {
        vscode.commands.executeCommand(
          "setContext",
          "chisel.isEditInChisel",
          true
        );
        this.setIsEditInChisel(true);
      }
    });

    // Set isEditInChisel context to true when the editor is opened
    vscode.commands.executeCommand(
      "setContext",
      "chisel.isEditInChisel",
      true
    );
    this.setIsEditInChisel(true);

    function updateWebview() {
      webviewPanel.webview.postMessage({
        type: "update",
        text: document.getText(),
      });
    }

    // Hook up event handlers so that we can synchronize the webview with the text document.
    //
    // The text document acts as our model, so we have to sync change in the document to our
    // editor and sync changes in the editor back to the document.
    //
    // Remember that a single text document can also be shared between multiple custom
    // editors (this happens for example when you split a custom editor)

    const changeDocumentSubscription = vscode.workspace.onDidChangeTextDocument(
      (e) => {
        if (e.document.uri.toString() === document.uri.toString()) {
          updateWebview();
        }
      }
    );

    // Make sure we get rid of the listener when our editor is closed.
    webviewPanel.onDidDispose(() => {
      changeDocumentSubscription.dispose();
    });

    // Receive message from the webview.
    webviewPanel.webview.onDidReceiveMessage((e) => {});

    updateWebview();
  }

  /**
   * Get the static html used for the editor webviews.
   */
  private async getHtmlForWebview(webview: vscode.Webview): Promise<string> {
    // Local path to script and css for the webview
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this.context.extensionUri,
        "media",
        "chisel-editor.css"
      )
    );

    // Use a nonce to whitelist which scripts can be run
    const nonce = getNonce();

    return /* html */ `
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">

				<!--
				Use a content security policy to only allow loading images from https or from our extension directory,
				and only allow scripts that have a specific nonce.
				-->
				<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource}; style-src ${webview.cspSource}; script-src 'nonce-${nonce}'; frame-src ${this.chisel_editor};">

				<meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="${styleUri}" rel="stylesheet">

				<title>Chisel Editor</title>
        <script nonce="${nonce}">
          (function() {
            const vscode = acquireVsCodeApi();
  
            // On keydown ctrl+alt+s, send a message to the extension
            window.addEventListener('keydown', (e) => {
              if (e.ctrlKey && e.altKey && e.code === 'KeyS') {
                vscode.postMessage({
                  command: 'switchToTextEditor'
                });
                console.log("switchToTextEditor from webview keydown listener");
              }
            });
  
            // Add listener for messages from the iframe content
            window.addEventListener('message', (e) => {
              const message = e.data;
              if (message.command === 'switchToTextEditor') {
                vscode.postMessage({
                  command: 'switchToTextEditor'
                });
                console.log("switchToTextEditor from iframe listener");
              }
            });

            window.focus();
        }())
        </script>
			</head>
			<body>
          <iframe src="${this.chisel_editor}?vscode=true"></iframe>
			</body>
			</html>`;
  }
}
