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

      // If the item has expired, remove it and return the initial value
      if (now.getTime() > item.expiry) {
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
    // Set default expiration time to 24 hours
    ttl: number = 24 * 60 * 60 * 1000,
  ) {
    // Clear the item if the value is not defined
    if (!value) {
      localStorage.removeItem(key);
      return;
    }

    const now = new Date();
    const item: StoredValue<T> = {
      value,
      expiry: now.getTime() + ttl, // Set expiration time
    };
    localStorage.setItem(key, JSON.stringify(item));
  }

  return { getValue, setValue };
}
