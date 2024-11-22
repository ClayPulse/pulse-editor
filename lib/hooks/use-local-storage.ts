// Define the shape of the item to be stored in localStorage
export interface StoredValue<T> {
  value: T;
  expiry: number;
}

// Custom hook for handling localStorage with expiration
export function useLocalStorage() {
  // Function to get the value
  function getValue<T>(key: string): T | undefined {
    const itemStr = localStorage.getItem(key);
    if (itemStr) {
      const item: StoredValue<T> = JSON.parse(itemStr);
      const now = new Date();

      // If the expiry is -1, it means the item never expires
      if (item.expiry === -1) {
        return item.value;
      }
      // If the item has expired, remove it and return the initial value
      else if (now.getTime() > item.expiry) {
        localStorage.removeItem(key);
        return undefined;
      }
      return item.value;
    }
    return undefined;
  }

  // Function to save the value with expiry
  function setValue<T>(
    key: string,
    value: T,
    // Set default expiration time to forever
    ttl: number = -1,
  ) {
    // Clear the item if the value is not defined
    if (!value) {
      localStorage.removeItem(key);
      return;
    }

    const now = new Date();
    const time = now.getTime();
    const item: StoredValue<T> = {
      value,
      expiry: ttl === -1 ? -1 : time + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  return { getValue, setValue };
}
