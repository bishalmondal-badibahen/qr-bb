import { NextResponse } from "next/server";
import { adminDB } from "@/lib/firebase_admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, imageURL, wantsToSee } = body;

    if (!name || !imageURL || wantsToSee === undefined) {
      return NextResponse.json(
        { error: "Invalid request payload" },
        { status: 400 },
      );
    }

    await adminDB.ref("users").push({
      name,
      imageURL,
      wantsToSee,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
