import { createPresignedUploadUrl } from "@/api";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    console.log("📡 Presign URL request received");

    const body = await req.json();
    const { fileType } = body;

    console.log("📄 File type:", fileType);

    if (!fileType) {
      console.error("❌ Missing fileType in request");
      return NextResponse.json({ error: "Missing fileType" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(fileType.toLowerCase())) {
      console.error("❌ Invalid file type:", fileType);
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${validTypes.join(", ")}` },
        { status: 400 },
      );
    }

    console.log("🔐 Creating presigned URL...");
    const data = await createPresignedUploadUrl(fileType);

    console.log("✅ Presigned URL created successfully");
    console.log("📦 Response data:", {
      hasUploadUrl: !!data.uploadUrl,
      hasFields: !!data.fields,
      hasFileUrl: !!data.fileUrl,
      fileKey: data.fileKey,
    });

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("❌ Error in presign API route:", {
        message: error.message,
        stack: error.stack,
        error,
      });

      return NextResponse.json(
        {
          error: "Failed to create presigned URL",
          message: error.message,
        },
        { status: 500 },
      );
    }
  }
}
