import { NextResponse } from "next/server";

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_BUG_REPORT_SCRIPT_URL;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, title, description, email, page } = body;

    if (!type || !title) {
      return NextResponse.json(
        { error: "Bug type and title are required" },
        { status: 400 }
      );
    }

    if (!GOOGLE_SCRIPT_URL) {
      console.warn("[BugReport] GOOGLE_BUG_REPORT_SCRIPT_URL not configured");
      return NextResponse.json(
        { error: "Bug reporting not configured" },
        { status: 503 }
      );
    }

    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        title,
        description: description || "",
        email: email || "",
        page: page || "",
        timestamp: new Date().toISOString(),
        project: "Code Battle",
      }),
    });

    if (!response.ok) {
      throw new Error(`Google Apps Script responded with ${response.status}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[BugReport] Error:", error);
    return NextResponse.json(
      { error: "Failed to submit bug report" },
      { status: 500 }
    );
  }
}
