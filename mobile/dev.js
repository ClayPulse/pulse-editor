import { execSync } from "child_process";
import os from "os";

function getLocalNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface) {
      if (config.family === "IPv4" && !config.internal) {
        return config.address; // Returns the first non-internal IPv4 address
      }
    }
  }
  return "localhost"; // Fallback
}

const isWindows = process.platform === "win32";

// Get the local dev IP
const localDevIp = getLocalNetworkIP();

// Build the command
const command = `npx cap run android -l --host=${localDevIp}`;

// Execute the command with platform-specific syntax
if (isWindows) {
  execSync(command, { stdio: "inherit", shell: "pwsh" });
} else {
  execSync(command, { stdio: "inherit", shell: "bash" });
}
