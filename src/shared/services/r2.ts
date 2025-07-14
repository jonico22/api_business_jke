import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { Readable } from "stream";

export const r2 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const uploadFileToR2 = async (
  key: string,
  buffer: Buffer,
  contentType: string
) => {
  const stream = Readable.from(buffer);

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME!,
    Key: key,
    Body: stream,
    ContentType: contentType,
  });

  await r2.send(command);
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};
