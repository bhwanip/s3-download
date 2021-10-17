import AWSMock from "aws-sdk-mock";
import AWS from "aws-sdk";
import { algorithm, iv } from "../../src/security/constants";

AWSMock.setSDKInstance(AWS);

jest.mock("fs-extra", () => ({
  readFile: jest
    .fn()
    .mockResolvedValueOnce(Buffer.from("encrypted content"))
    .mockResolvedValueOnce(Buffer.from("encryptionkey")),
  writeFile: jest.fn().mockResolvedValue({}),
}));

jest.mock("crypto", () => ({
  createDecipheriv: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnValue(Buffer.from("update")),
    final: jest.fn().mockReturnValue(Buffer.from("final")),
  }),
}));

import { decryptFile } from "../../src/security/index";
import * as fs from "fs-extra";
import * as crypto from "crypto";

describe("security/decrypt.ts", () =>
  test("should decrypt file", async () => {
    const testPlainKey = Buffer.from("ABC");

    AWSMock.mock(
      "KMS",
      "decrypt",
      jest.fn().mockResolvedValue({
        Plaintext: testPlainKey,
      })
    );

    await decryptFile({ rootDir: "root", downloadFolder: "downloads" });

    expect(crypto.createDecipheriv).toHaveBeenCalledTimes(1);
    expect(crypto.createDecipheriv).toHaveBeenCalledWith(
      algorithm,
      testPlainKey,
      iv
    );

    expect(fs.writeFile).toHaveBeenCalledTimes(1);
    expect(fs.writeFile).toHaveBeenNthCalledWith(
      1,
      "root/downloads/report_decrypted.csv",
      Buffer.from("updatefinal")
    );
  }));
