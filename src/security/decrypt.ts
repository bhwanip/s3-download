import AWS from "aws-sdk";
import * as crypto from "crypto";
import * as fs from "fs-extra";
import * as path from "path";
import { config } from "../config";
import { clearKey } from "./clearKey";
import { algorithm, iv } from "./constants";

function decryptAES(key: Uint8Array, encryptedContent: Buffer) {
  const decipher = crypto.createDecipheriv(algorithm, key, iv);

  const result = Buffer.concat([
    decipher.update(encryptedContent),
    decipher.final(),
  ]);

  return result;
}

export async function decryptFile({
  rootDir,
  downloadFolder,
}: {
  rootDir: string;
  downloadFolder: string;
}): Promise<string> {
  const downloadFolderPath = path.join(rootDir, downloadFolder);

  const encryptedContent = await fs.readFile(
    path.join(downloadFolderPath, "report.csv")
  );
  const encryptionKey = await fs.readFile(
    path.join(downloadFolderPath, "report.csv.key")
  );

  const kmsClient = new AWS.KMS({ region: config.region });

  const { Plaintext: plainTextKey } = (await kmsClient
    .decrypt({
      CiphertextBlob: encryptionKey,
      KeyId: config.keyId,
    })
    .promise()) as { Plaintext: Uint8Array };

  const result = decryptAES(plainTextKey, encryptedContent);

  //making the plain text data key null
  clearKey(plainTextKey);

  const decryptFileName = "report_decrypted.csv";

  await fs.writeFile(path.join(downloadFolderPath, decryptFileName), result);

  return decryptFileName;
}
