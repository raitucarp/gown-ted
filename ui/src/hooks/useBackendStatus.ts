import { useState, useEffect } from "react";
import { IsReady } from "@bindings/github.com/raitucarp/gown-ted/service/lexicalservice.js";

export function useBackendStatus() {
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const checkReady = async () => {
      try {
        const ready = await IsReady();
        if (ready) {
          setIsBackendReady(true);
          clearInterval(interval);
        }
      } catch (e) {
        // Retry silently
      }
    };
    checkReady();
    interval = setInterval(checkReady, 500);
    return () => clearInterval(interval);
  }, []);

  return { isBackendReady };
}
