export async function generateRsaKeyPairPEM(modulusLength = 4096) {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"]
  );

  const [spki, pkcs8] = await Promise.all([
    crypto.subtle.exportKey("spki", keyPair.publicKey),   // ArrayBuffer
    crypto.subtle.exportKey("pkcs8", keyPair.privateKey), // ArrayBuffer
  ]);

  const publicPem = derToPem(spki, "PUBLIC KEY");
  const privatePem = derToPem(pkcs8, "PRIVATE KEY");
  return { publicPem, privatePem };
}

function derToPem(buf: ArrayBuffer, label: string) {
  const b64 = arrayBufferToBase64(buf);
  const lines = b64.match(/.{1,64}/g)?.join("\n") ?? b64;
  return `-----BEGIN ${label}-----\n${lines}\n-----END ${label}-----`;
}

function arrayBufferToBase64(buf: ArrayBuffer) {
  const bytes = new Uint8Array(buf); 
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary);
}

export function downloadText(filename: string, text: string) {
  const blob = new Blob([text], { type: "application/x-pem-file" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
