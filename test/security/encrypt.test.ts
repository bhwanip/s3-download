import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { algorithm, iv } from "../../src/security/constants";

AWSMock.setSDKInstance(AWS);

jest.mock("fs-extra", () => ({
  readFile: jest.fn().mockResolvedValue("test content"),
  writeFile: jest.fn().mockResolvedValue({}),
}));

jest.mock("crypto", () => ({
  createCipheriv: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(Buffer.from("content")),
    final: jest.fn().mockReturnValue(Buffer.from("end")),
  }),
}));

afterAll(() => {
  jest.resetAllMocks();
});

import { encryptFile } from "../../src/security/index";
import * as fs from "fs-extra";
import * as crypto from "crypto";

describe("security/encrypt.ts", () =>
  test("should encrypt file", async () => {
    const testPlainKey = Buffer.from("ABC");
    const testCipherKey = Buffer.from("cipherText");

    AWSMock.mock(
      "KMS",
      "generateDataKey",
      jest.fn().mockResolvedValue({
        Plaintext: testPlainKey,
        CiphertextBlob: testCipherKey,
      })
    );

    await encryptFile("downloads", "root");

    expect(crypto.createCipheriv).toHaveBeenCalledTimes(1);
    expect(crypto.createCipheriv).toHaveBeenCalledWith(
      algorithm,
      testPlainKey,
      iv
    );

    expect(fs.writeFile).toHaveBeenCalledTimes(2);
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      "root/downloads/report.csv",
      Buffer.from("contentend")
    );
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      2,
      "root/downloads/report.csv.key",
      Buffer.from("cipherText")
    );
  }));
