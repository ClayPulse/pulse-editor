## About
Chisel Editor is an editor designed to build and work with AI more naturally on cross-platform devices. 

## Getting Started

### Web Development
Chisel Editor uses Next.js as the frontend (and backend -- TBD). 
You can get started with local development by running: 
```bash
npm run dev
```

### Mobile Development
Chisel Editor uses Capacitor.js to create mobile apps on Android and iOS. To develop mobile app locally, run the following:
```bash
# Development with Live Reload
npx cap run android -l --host [your_LAN_host_that_your_phone_can_access]
# Production
npm run android
```

### Desktop Development
Chisel Editor uses Electron.js to create desktop apps on Windows, Mac and Linux. To develop desktop app locally,
run:
```bash
# Development
npm run desktop-dev
# Production
npm run desktop-build
```

If you run `npm run desktop-build` for a production build, you can file an executable file inside `out-desktop`.

### VSCode Extension Development
Chisel Editor uses VSCode Webview API to create a VSCode Extension. To develop VScode Extension locally, open the `vscode-extension` in a separate VSCode window. Then press F5 to launch debug task.

Note that you will also need to run the Nextjs server locally during development.