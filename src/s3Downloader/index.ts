import { Promise as BlueBirdPromise } from "bluebird";
import * as fs from "fs-extra";
import * as path from "path";
import { s3Client } from "../aws-clients";
import { reporter, initReporter } from "./reporter";

export async function fetchAndSaveDataFromS3({
  bucket,
  rootDir,
}: {
  bucket: string;
  rootDir?: string;
}): Promise<string> {
  const downloadFolderPath = path.join(rootDir, `downloads_${Date.now()}`);
  const reportPath = path.join(downloadFolderPath, "report.csv");
  
  let count = 0;

  const { Contents: objectsList } = await s3Client
    .listObjects({ Bucket: bucket })
    .promise();

  initReporter({ reportPath });

  await BlueBirdPromise.map(
    objectsList,
    async ({ Key: key }) => {
      const filePath = path.join(downloadFolderPath, key);
      const { dir } = path.parse(filePath);

      await fs.mkdir(dir, { recursive: true });

      const file = fs.createWriteStream(filePath);

      s3Client
        .getObject({
          Bucket: bucket,
          Key: key,
        })
        .createReadStream()
        .pipe(file)
        .on("error", (err: Object) => {
          console.error(`FAILED to download: ${key}`, err);
          reporter.write([key, "error"]);
        })
        .on("finish", () => {
          console.error(`COMPLETED download of ${key}`);
          reporter.write([key, "success"]);
          if (count++ == objectsList.length - 1) {
            reporter.end();
          }
        });
    },
    { concurrency: 4 }
  );

  return new Promise((resolve) => {
    reporter.on("finish", () => {
      resolve(reportPath);
    });
  });
}
