const MAGIC = 'AURA_TUNE_ARTN_V1';
const KEY = 0xA5;

const textToUint8 = (text) => new TextEncoder().encode(text);
const uint8ToText = (bytes) => new TextDecoder().decode(bytes);
const bytesToBinary = (bytes) => {
  let str = '';
  for (let i = 0; i < bytes.length; i += 1) {
    str += String.fromCharCode(bytes[i]);
  }
  return str;
};

const binaryToBytes = (binary) => {
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
};

const obfuscate = (data) => {
  const bytes = textToUint8(data);
  const obfuscated = bytes.map((byte) => byte ^ KEY);
  return btoa(bytesToBinary(obfuscated));
};

const deobfuscate = (encoded) => {
  const binary = atob(encoded);
  const bytes = binaryToBytes(binary).map((byte) => byte ^ KEY);
  return uint8ToText(bytes);
};

export const createArtnFile = (playlists) => {
  const payload = JSON.stringify(playlists);
  const payloadEncoded = obfuscate(payload);
  const fileContent = `${MAGIC}:${payloadEncoded}`;
  return new Blob([fileContent], { type: 'application/octet-stream' });
};

export const parseArtnFile = async (file) => {
  if (!file.name.endsWith('.artn')) {
    throw new Error('Invalid file type. Expected .artn');
  }

  const text = await file.text();
  if (!text.startsWith(`${MAGIC}:`)) {
    throw new Error('Invalid artn file content.');
  }

  const encoded = text.slice(MAGIC.length + 1);
  const json = deobfuscate(encoded);
  const data = JSON.parse(json);

  if (!Array.isArray(data)) {
    throw new Error('Invalid playlist payload.');
  }

  return data;
};
