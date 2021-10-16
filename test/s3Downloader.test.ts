import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { PassThrough } from "stream";

AWSMock.setSDKInstance(AWS);

const mockWritableStream = new PassThrough();

jest.mock("fs-extra", () => ({
  mkdir: jest.fn().mockResolvedValue({}),
  createWriteStream: jest.fn().mockReturnValue(mockWritableStream),
  writeFile: jest.fn().mockResolvedValue({}),
}));

jest.mock("csv-stringify", () => ({
  __esModule: true,
  default: jest.fn((_, __, cb) => {
    cb();
  }),
}));

import { default as stringify } from "csv-stringify";
import { fetchAndSaveDataFromS3 } from "../src/s3Downloader";

describe("s3Downloader Test Suite", () => {
  test("Should download files with success", async () => {
    const [mockedStreamOne, mockedStreamTwo] = [
      new PassThrough(),
      new PassThrough(),
    ];

    AWSMock.mock(
      "S3",
      "listObjects",
      jest.fn().mockResolvedValue({
        Contents: [{ Key: "key_01" }, { Key: "key_02" }],
      })
    );

    AWSMock.mock(
      "S3",
      "getObject",
      jest
        .fn()
        .mockReturnValueOnce({
          createReadStream: jest.fn().mockReturnValue(mockedStreamOne),
        })
        .mockReturnValueOnce({
          createReadStream: jest.fn().mockReturnValue(mockedStreamTwo),
        })
    );

    const promise = fetchAndSaveDataFromS3({
      bucket: "testBucket",
      rootDir: "testDir",
    });

    setTimeout(() => {
      expect(stringify).toBeCalledWith(
        [
          { key: "key_01", status: "success" },
          { key: "key_02", status: "success" },
        ],
        {
          delimiter: ",",
        },
        expect.anything()
      );
    }, 1000);

    await promise;
  });

  test("Should download files with errors", async () => {
    const [mockedStreamOne, mockedStreamTwo] = [
      new PassThrough(),
      new PassThrough(),
    ];

    AWSMock.mock(
      "S3",
      "listObjects",
      jest.fn().mockResolvedValue({
        Contents: [{ Key: "key_01" }, { Key: "key_02" }],
      })
    );

    AWSMock.mock(
      "S3",
      "getObject",
      jest
        .fn()
        .mockReturnValueOnce({
          createReadStream: jest.fn().mockReturnValue(mockedStreamOne),
        })
        .mockReturnValueOnce({
          createReadStream: jest.fn().mockReturnValue(mockedStreamTwo),
        })
    );

    const promise = fetchAndSaveDataFromS3({
      bucket: "testBucket",
      rootDir: "testDir",
    });

    setTimeout(() => {
      mockWritableStream.emit("error", new Error("Test Error"));

      expect(stringify).toBeCalledWith(
        expect.arrayContaining([
          { key: "key_01", status: "error" },
          { key: "key_02", status: "error" },
        ]),
        {
          delimiter: ",",
        },
        expect.anything()
      );
    }, 1000);

    await promise;
  });
});
