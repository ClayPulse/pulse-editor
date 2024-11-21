// Create simple password-based encryption/decryption functions.
// Do not use CryptoJS.

export function encrypt(data: string, password: string) {
  // Encrypt data with password
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const encodedPassword = encoder.encode(password);

  // Derive a unique key using a hash-like approach
  const key = encodedPassword.reduce((hash, byte) => (hash * 31 + byte) % 256, 0);

  // XOR each byte of data with the derived key
  const encrypted = encodedData.map(byte => byte ^ key);
  return btoa(String.fromCharCode(...Array.from(encrypted)));
}

export function decrypt(data: string, password: string) {
  // Decrypt data with password
  const decoder = new TextDecoder();
  const encryptedData = atob(data).split('').map(char => char.charCodeAt(0));
  const encodedPassword = new TextEncoder().encode(password);

  // Derive the same unique key using the same hash-like approach
  const key = encodedPassword.reduce((hash, byte) => (hash * 31 + byte) % 256, 0);

  // XOR each byte of the encrypted data with the derived key
  const decrypted = encryptedData.map(byte => byte ^ key);
  return decoder.decode(new Uint8Array(decrypted));
}
