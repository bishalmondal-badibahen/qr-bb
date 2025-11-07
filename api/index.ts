import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import { randomUUID } from "node:crypto";

const s3 = new S3Client({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET = process.env.AWS_S3_RESOURCES_BUCKET!;

export const createPresignedUploadUrl = async (fileType = "") => {
  try {
    if (!BUCKET) {
      throw new Error(
        "AWS_S3_RESOURCES_BUCKET environment variable is not set",
      );
    }

    if (!fileType) {
      throw new Error("fileType is required");
    }

    const fileKey = `qr-bb/${randomUUID()}`;
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: BUCKET,
      Key: fileKey,
      Conditions: [
        ["starts-with", "$Content-Type", fileType.split("/")[0]],
        ["content-length-range", 0, 5 * 1024 * 1024], // 5MB max
      ],
      Expires: 60, // 1 minute
      Fields: {
        "Content-Type": fileType,
      },
    });

    const fileUrl = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

    return {
      uploadUrl: url,
      fields,
      fileKey,
      fileUrl,
    };
  } catch (error) {
    console.error("Error creating presigned URL:", error);
    throw error;
  }
};
