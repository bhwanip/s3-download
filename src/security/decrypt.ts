import * as crypto from "crypto";
import * as fs from "fs-extra";
import * as path from "path";
import { kmsClient } from "../aws-clients";
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

export async function decryptFile(
  {
    rootDir = process.cwd(),
    downloadFolderName = process.argv[2],
  }: {
    rootDir: string;
    downloadFolderName: string;
  } = Object.create(null)
) {
  const downloadFolderPath = path.join(rootDir, downloadFolderName);

  const encryptedContent = await fs.readFile(
    path.join(downloadFolderPath, "report.csv")
  );
  const encryptionKey = await fs.readFile(
    path.join(downloadFolderPath, "report.csv.key")
  );

  const { Plaintext: plainTextKey } = (await kmsClient
    .decrypt({
      CiphertextBlob: encryptionKey,
      KeyId: config.keyId,
    })
    .promise()) as { Plaintext: Uint8Array };

  const result = decryptAES(plainTextKey, encryptedContent);

  //making the plain text data key null
  clearKey(plainTextKey);

  await fs.writeFile(
    path.join(downloadFolderPath, "report_decrypted.csv"),
    result
  );
}

// decryptFile().then(() => console.log("===========DONE============"));
