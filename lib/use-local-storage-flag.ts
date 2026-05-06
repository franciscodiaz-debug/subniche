"use client";

import { useCallback, useSyncExternalStore } from "react";

export function useLocalStorageFlag(
  key: string,
  changeEventName: string,
  serverSnapshot = true,
) {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      function handleStorage(event: StorageEvent) {
        if (event.key === key || event.key === null) {
          onStoreChange();
        }
      }

      window.addEventListener("storage", handleStorage);
      window.addEventListener(changeEventName, onStoreChange);

      return () => {
        window.removeEventListener("storage", handleStorage);
        window.removeEventListener(changeEventName, onStoreChange);
      };
    },
    [changeEventName, key],
  );

  const getSnapshot = useCallback(
    () => window.localStorage.getItem(key) === "true",
    [key],
  );
  const getServerSnapshot = useCallback(
    () => serverSnapshot,
    [serverSnapshot],
  );
  const value = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  const setValue = useCallback(
    (nextValue: boolean) => {
      if (nextValue) {
        window.localStorage.setItem(key, "true");
      } else {
        window.localStorage.removeItem(key);
      }

      window.dispatchEvent(new Event(changeEventName));
    },
    [changeEventName, key],
  );

  return [value, setValue] as const;
}
