import AWS from "aws-sdk"; 
import { config } from "../config";

export const s3Client = new AWS.S3({ region: config.region });

export const kmsClient = new AWS.KMS({region: config.region});