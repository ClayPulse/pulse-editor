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
# Build Next.js
npm run build
# Copy Next.js build to mobile folders
npx cap sync
# For android, run
npx cap run android
```

### Desktop Development (WIP)
Chisel Editor uses Electron.js to create desktop apps on Windows, Mac and Linux. To develop desktop app locally,
run:

### VSCode Extension Development (WIP)
Chisel Editor uses VSCode Webview API to create a VSCode Extension. To develop VScode Extension locally, run:
