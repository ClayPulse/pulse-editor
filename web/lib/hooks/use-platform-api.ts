"use client";

import { useEffect, useRef, useState } from "react";
import { AbstractPlatformAPI } from "../platform-api/abstract-platform-api";
import { getAbstractPlatformAPI } from "../platform-api/get-abstract-platform-api";

export function usePlatformApi() {
  // const platformApi = useRef<AbstractPlatformAPI | undefined>(undefined);
  const [platformApi, setPlatformApi] = useState<
    AbstractPlatformAPI | undefined
  >(undefined);

  useEffect(() => {
    const api = getAbstractPlatformAPI();
    setPlatformApi(api);
  }, []);

  return {
    platformApi,
  };
}
