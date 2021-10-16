import { Promise as BlueBirdPromise } from "bluebird";
import { default as csvStringify } from "csv-stringify";
import * as fs from "fs-extra";
import * as path from "path";
import AWS from "aws-sdk";
import { config } from "../config";

export async function fetchAndSaveDataFromS3({
  bucket,
  rootDir,
}: {
  bucket: string;
  rootDir?: string;
}): Promise<{ downloadFolder: string }> {
  const downloadFolder = `downloads_${Date.now()}`;
  const downloadFolderPath = path.join(rootDir, downloadFolder);
  const reportPath = path.join(downloadFolderPath, "report.csv");

  const records = new Array<{
    key: string;
    status: "error" | "success";
  }>();
  const s3Client = new AWS.S3({ region: config.region });

  const { Contents: objectsList } = await s3Client
    .listObjects({ Bucket: bucket })
    .promise();

  await BlueBirdPromise.map(
    objectsList,
    async ({ Key: key }) => {
      const filePath = path.join(downloadFolderPath, key);
      const { dir } = path.parse(filePath);

      await fs.mkdir(dir, { recursive: true });

      const file = fs.createWriteStream(filePath);

      return new BlueBirdPromise((resolve) => {
        s3Client
          .getObject({
            Bucket: bucket,
            Key: key,
          })
          .createReadStream()
          .pipe(file)
          .on("error", (err: Object) => {
            console.error(`FAILED to download: ${key}`, err);
            records.push({ key, status: "error" });
            resolve();
          })
          .on("finish", () => {
            console.error(`COMPLETED download of ${key}`);
            records.push({ key, status: "success" });
            resolve();
          });
      });
    },
    { concurrency: 4 }
  );

  return new Promise((resolve) => {
    csvStringify(
      records,
      {
        delimiter: ",",
      },
      async function (_, output) {
        await fs.writeFile(reportPath, output, "utf8");
        resolve({ downloadFolder });
      }
    );
  });
}
