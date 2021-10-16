import * as crypto from "crypto";
import * as fs from "fs-extra";
import { config } from "../config";
import { kmsClient } from "../aws-clients";
import { algorithm, iv } from "./constants";
import { clearKey } from "./clearKey";
import path from "path";

function encryptAES(key: Uint8Array, dataBuffer: Buffer) {
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const result = Buffer.concat([cipher.update(dataBuffer), cipher.final()]);

  return result;
}

async function generateDataKey() {
  const params = {
    KeyId: config.keyId,
    KeySpec: "AES_256", // Specifies the type of data key to return.
  };

  return await kmsClient.generateDataKey(params).promise();
}
export async function encryptFile(downLoadFolder: string, rootDir: string) {
  
  const downloadFolderPath = path.join(rootDir, downLoadFolder);
  const reportPath = path.join(downloadFolderPath, "report.csv");

  const content = await fs.readFile(reportPath);

  const { Plaintext: plainTextKey, CiphertextBlob: encryptionKey } =
    (await generateDataKey()) as {
      Plaintext: Uint8Array;
      CiphertextBlob: Uint8Array;
    };

  const encryptedContent = encryptAES(plainTextKey, content as Buffer);

  //making the plain text data key null
  clearKey(plainTextKey);

  return await Promise.all([
    fs.writeFile(reportPath, encryptedContent),
    fs.writeFile(`${reportPath}.key`, encryptionKey),
  ]);
}
