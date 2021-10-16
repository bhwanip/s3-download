import { encryptFile } from "./security";
import { fetchAndSaveDataFromS3 } from "./s3Downloader";
import { config } from "./config";

async function downloadS3Data(
  { rootDir = process.cwd() }: { rootDir: string } = Object.create(null)
): Promise<{
  rootDir: string;
  downloadFolder: string;
}> {
  const { downloadFolder } = await fetchAndSaveDataFromS3({
    bucket: config.bucket,
    rootDir,
  });

  await encryptFile(downloadFolder, rootDir);

  return { downloadFolder, rootDir };
}

export { downloadS3Data };
export { decryptFile } from "./security";
