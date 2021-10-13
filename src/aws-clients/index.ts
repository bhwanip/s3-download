import { S3, KMS } from "aws-sdk";
import { config } from "../config";

export const s3Client = new S3({ region: config.region });

export const kmsClient = new KMS({region: config.region});