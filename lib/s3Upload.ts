import Compressor from "compressorjs";

/**
 * Compress an image file
 * @param {File} file - The file to compress
 * @returns {Promise<File>} - The compressed file
 */
export const compressImage = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.8,
      maxWidth: 2000,
      maxHeight: 2000,
      convertSize: 5 * 1024 * 1024, // only compress if >5MB
      success(result) {
        resolve(result as File);
      },
      error(err) {
        reject(err);
      },
    });
  });
};

/**
 * Upload a file to S3
 * @param {File} file - The file to upload
 * @returns {Promise<string>} - The S3 file URL
 */
export const uploadToS3 = async (file: File): Promise<string> => {
  try {
    // console.log("📤 Starting S3 upload for file:", file.name, file.type);

    // 1. Ask server for presigned URL
    const res = await fetch("/api/s3/presign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileType: file.type }),
    });

    // console.log("📡 Presign response status:", res.status);

    if (!res.ok) {
      const errorText = await res.text();
      // console.error("❌ Presign request failed:", res.status, errorText);
      throw new Error(
        `Failed to get presigned URL: ${res.status} - ${errorText}`,
      );
    }

    // Check if response has content
    const contentType = res.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      // console.error("❌ Invalid response content-type:", contentType);
      throw new Error("Invalid response from presign endpoint");
    }

    const responseText = await res.text();
    if (!responseText) {
      // console.error("❌ Empty response from presign endpoint");
      throw new Error("Empty response from presign endpoint");
    }

    let presignData;
    try {
      presignData = JSON.parse(responseText);
    } catch (parseError: unknown) {
      // console.error("❌ Failed to parse JSON:", responseText);
      if (parseError instanceof Error)
        throw new Error(
          `Invalid JSON response from presign endpoint: ${parseError.message}`,
        );
      else throw new Error(`Invalid JSON response from presign endpoint`);
    }

    const { uploadUrl, fields, fileUrl } = presignData;

    if (!uploadUrl || !fields || !fileUrl) {
      // console.error("❌ Incomplete presign data:", presignData);
      throw new Error(
        "Incomplete presign data: missing uploadUrl, fields, or fileUrl",
      );
    }

    // console.log("✅ Presigned URL received, uploading to S3...");

    // 2. Upload directly to S3
    const form = new FormData();
    Object.entries(fields).forEach(([k, v]) => form.append(k, v as string));
    form.append("file", file);

    const uploadRes = await fetch(uploadUrl, {
      method: "POST",
      body: form,
    });

    if (!uploadRes.ok) {
      const uploadError = await uploadRes.text();
      // console.error("❌ S3 upload failed:", uploadRes.status, uploadError);
      throw new Error(`S3 upload failed: ${uploadRes.status}`);
    }

    // console.log("✅ File uploaded successfully to S3:", fileUrl);

    // Return final accessible S3 URL
    return fileUrl;
  } catch (error) {
    console.error("❌ Error in uploadToS3:", error);
    throw error;
  }
};

/**
 * Compress and upload an image to S3
 * @param {File} file - The image file to compress and upload
 * @returns {Promise<string>} - The S3 file URL
 */
export const compressAndUploadImage = async (file: File): Promise<string> => {
  const compressedFile = await compressImage(file);

  // console.log("Original:", (file.size / 1024 / 1024).toFixed(2), "MB");
  // console.log(
  //   "Compressed:",
  //   (compressedFile.size / 1024 / 1024).toFixed(2),
  //   "MB",
  // );

  const fileUrl = await uploadToS3(compressedFile);

  if (!fileUrl) {
    throw new Error("Failed to upload image to S3");
  }

  return fileUrl;
};
