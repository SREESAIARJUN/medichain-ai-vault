/**
 * Crypto Utils - AES-256-GCM encryption and decryption
 */

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();

// Helper to convert ArrayBuffer to base64
const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(buffer)));
};

// Helper to convert base64 to ArrayBuffer
const base64ToArrayBuffer = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Encrypt data with AES-256-GCM
export const encryptData = async (data: any, password: string): Promise<string> => {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  const dataBuffer = ENCODER.encode(dataString);
  const passwordBuffer = ENCODER.encode(password);

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    dataBuffer
  );

  const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
  combined.set(salt, 0);
  combined.set(iv, salt.length);
  combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

  return arrayBufferToBase64(combined.buffer);
};

// Decrypt data with AES-256-GCM
export const decryptData = async (encryptedData: string, password: string): Promise<string> => {
  const encryptedBuffer = base64ToArrayBuffer(encryptedData);
  const encryptedArray = new Uint8Array(encryptedBuffer);

  const salt = encryptedArray.slice(0, 16);
  const iv = encryptedArray.slice(16, 28);
  const data = encryptedArray.slice(28);

  const passwordBuffer = ENCODER.encode(password);

  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits', 'deriveKey']
  );

  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    data
  );

  return DECODER.decode(decryptedBuffer);
};
