import * as fs from "fs-extra";
import * as path from "path";
import { downloadS3Data, decryptFile } from "../../src";
import { s3Client } from "../../src/aws-clients";
import { config } from "../../src/config";

const testDataFolder = path.join(__dirname, "testData");

describe("Integration test suite", () => {
  test("Integration test", async () => {
    //upload test data to s3 bucket
    const s3Keys = await uploadTestData(path.join(__dirname, "testData"));

    //download data and encrypt report file
    const { downloadFolder, rootDir } = await downloadS3Data();

    //decrypt report file
    const decryptFileName = await decryptFile({ rootDir, downloadFolder });

    //run assertions
    await verifyReportContents(downloadFolder, decryptFileName, s3Keys);
  });
});

async function uploadTestData(
  directory: string,
  s3Keys = new Array<string>()
): Promise<Array<string>> {
  const files = await fs.readdir(directory);

  for (const fileName of files) {
    const filePath = path.join(directory, fileName);

    // recursive if directory
    if (fs.lstatSync(filePath).isDirectory()) {
      await uploadTestData(filePath, s3Keys);
      continue;
    }

    const fileContent = await fs.readFile(filePath);

    const s3key = path.relative(testDataFolder, filePath);

    await s3Client
      .putObject({
        Bucket: config.bucket,
        Key: s3key,
        Body: fileContent,
      })
      .promise();

    s3Keys.push(s3key);
  }

  return s3Keys;
}

async function verifyReportContents(
  downloadFolder: string,
  decryptFileName: string,
  s3Keys: Array<string>
) {
  const decryptedContent = await fs.readFile(
    path.join(downloadFolder, decryptFileName),
    "utf8"
  );

  const reportItems = decryptedContent
    .split("\n")
    .map((value) => value.split(",")[0].trim())
    .filter(Boolean);

  expect(s3Keys.length).toBe(reportItems.length);

  expect(s3Keys.sort()).toEqual(reportItems.sort());
}
