import { useEffect, useState } from "react";
import { ExtensionManager } from "../extensions/extension-manager";

export default function useExtensionManager() {
  const [manager, setManager] = useState<ExtensionManager | undefined>(
    undefined,
  );

  useEffect(() => {
    const manager = new ExtensionManager();
    setManager(manager);
  }, []);

  return {
    extensionManager: manager,
  };
}
