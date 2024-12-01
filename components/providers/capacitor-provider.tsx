"use client";

import { useEffect } from "react";
import { StatusBar } from "@capacitor/status-bar";
import { ScreenOrientation } from "@capacitor/screen-orientation";

export default function CapacitorProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    async function setStatusBar() {
      const orientation = await ScreenOrientation.orientation();
      if (
        orientation.type === "landscape-primary" ||
        orientation.type === "landscape-secondary"
      ) {
        // If landscape mode is enabled full screen and hide status bar.
        StatusBar.setOverlaysWebView({ overlay: true });
        StatusBar.hide();
      } else {
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.show();
      }
    }

    ScreenOrientation.addListener("screenOrientationChange", setStatusBar);
  }, []);
  return children;
}
