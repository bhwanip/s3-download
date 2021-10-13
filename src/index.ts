import { encryptFile } from "./security";
import { fetchAndSaveDataFromS3 } from "./s3Downloader";
import { config } from "./config";


async function downloadS3Data({ rootDir = process.cwd() }: { rootDir: string } = Object.create(null)) {
  const downloadReport = await fetchAndSaveDataFromS3({ bucket: config.bucket, rootDir });
  await encryptFile(downloadReport);
}

export { downloadS3Data };
export { decryptFile } from "./security";

// downloadS3Data().then(() => console.log("=====DONE======"));