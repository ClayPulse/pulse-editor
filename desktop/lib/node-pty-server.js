import http from "http";
import { WebSocketServer } from "ws";
import os from "os";
import pty from "node-pty";

let sharedPtyProcess = null;
let sharedTerminalMode = false;

const shell = os.platform() === "win32" ? "powershell.exe" : "bash";

const spawnShell = () => {
  return pty.spawn(shell, [], {
    name: "xterm-color",
    env: process.env,
  });
};

const setSharedTerminalMode = (useSharedTerminal) => {
  sharedTerminalMode = useSharedTerminal;
  if (sharedTerminalMode && !sharedPtyProcess) {
    sharedPtyProcess = spawnShell();
  }
};

const handleTerminalConnection = (ws) => {
  let ptyProcess = sharedTerminalMode ? sharedPtyProcess : spawnShell();

  ws.on("message", (command) => {
    const processedCommand = commandProcessor(command);
    ptyProcess.write(processedCommand);
  });

  ptyProcess.on("data", (rawOutput) => {
    const processedOutput = outputProcessor(rawOutput);
    ws.send(processedOutput);
  });

  ws.on("close", () => {
    if (!sharedTerminalMode) {
      ptyProcess.kill();
    }
  });
};

// Utility function to process commands
const commandProcessor = (command) => {
  return command;
};

// Utility function to process output
const outputProcessor = (output) => {
  return output;
};

/* Host ws node-pty server */
setSharedTerminalMode(false); // Set this to false to allow a shared session
const port = 6060;

export function createTerminalServer() {
  const server = http.createServer((req, res) => {});

  const wss = new WebSocketServer({ noServer: true });

  wss.on("connection", handleTerminalConnection);

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit("connection", ws, request);
    });
  });

  server.listen(port, () => {
    console.log(`HTTP and WebSocket server is running on port ${port}`);
  });
}
