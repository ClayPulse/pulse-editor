# Pulse Editor
## About
Pulse Editor is an editor designed to build and work with AI more naturally on cross-platform devices. 

## Getting Started -- User Guide
### Web Client
There is a web deployment at https://editor.claypulse.ai

For detailed web user guide, check out [Web User Guide](web/README.md)
### Mobile Client
Android client is available in release page.
>Current we only support Android, although it is technically possible to have an iOS build (see developer guide below).

For detailed mobile user guide, check out [Mobile User Guide](mobile/README.md)
### Desktop Client
Linux, MacOS, Windows clients are available in release page.
>Only Windows is tested in alpha release.

For detailed desktop user guide, check out [Desktop User Guide](desktop/README.md)
### VSCode Extension
A VSCode Webview Extension with limited features is available [here](https://marketplace.visualstudio.com/items?itemName=shellishack.pulse-editor).

For detailed VSCode extension user guide, check out [VSCode Extension User Guide](vscode-extension/README.md)


## Getting Started -- Development Guide
### Recommended Nodejs version
Nodejs 20
### Install dependencies
You can install dependencies for all workspaces using
```
npm i
```
Or, for a specific workspace. e.g. for web:
```
npm i --workspace=web
```

### Install dependencies (desktop native modules)
When dependencies in `desktop/`, use Electron's nodejs instead of local nodejs.

Make sure you have installed necessary build tools.
#### For Windows
Nodejs Windows Installer should already include windows-build-tools. In addition, make sure [Windows SDK](https://developer.microsoft.com/en-us/windows/downloads/windows-10-sdk) is also available:

#### For Linux
```
sudo apt install -y make python build-essential
```

Then you can rebuild native dependencies in `desktop/` using.
```
# For Windows
./node_modules/.bin/electron-rebuild.ps1 -m desktop -v electron_version
# For Linux
./node_modules/.bin/electron-rebuild -m desktop -v electron_version
```
For example, Electron may warn you need NODE_MODULE_VERSION 128. The corresponding Electron version to NODE_MODULE_VERSION 128 is 32.x.x. If you have electron@32.3.3 installed (check desktop/package.json), you can run:
```
./node_modules/.bin/electron-rebuild -m desktop -v 32.3.3
```


### Web Development
Pulse Editor uses Next.js as the frontend (and backend -- TBD). 
You can get started with local development by running: 
```bash
npm run web-dev
```

### Mobile Development
Pulse Editor uses Capacitor.js to create mobile apps on Android and iOS. To develop mobile app locally, run the following:
```bash
# Development with Live Reload. You need to first run a local development server as specified above.
cd mobile
npx cap run android -l --host [your_LAN_server_that_your_phone_can_access]
# Production
npm run android-build
```

### Desktop Development
Pulse Editor uses Electron.js to create desktop apps on Windows, Mac and Linux. To develop desktop app locally,
run:
```bash
# Development
npm run desktop-dev
# Production
npm run desktop-build
```

If you run `npm run desktop-build` for a production build, you can find an executable file inside `build/desktop`.

### VSCode Extension Development
Pulse Editor uses VSCode Webview API to create a VSCode Extension. To develop VScode Extension locally, open the `vscode-extension` in a separate VSCode window. Then press F5 to launch debug task.

Note that you will also need to run the Nextjs server locally during development.
