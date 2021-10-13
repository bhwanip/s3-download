export function clearKey(plainTextKey: Uint8Array) {
  for (let i = 0; i < plainTextKey.length; i++) {
    plainTextKey[i] = null;
  }
}
