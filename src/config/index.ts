export const config = {
    region: process.env.AWS_REGION || "ap-southeast-2",
    bucket: "test-177",
    keyId: process.env.AWS_KMS_KEY_ID || "654e3f0b-8202-4763-86fa-01f62069e438", // The identifier of the CMK to use to encrypt the data key
};