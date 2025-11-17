import { NextRequest, NextResponse } from "next/server";
import memberstackAdmin from "@memberstack/admin";

export const runtime = "nodejs"; // required for proper raw body handling
export const dynamic = "force-dynamic"; // avoid caching errors

const memberstack = memberstackAdmin.init(process.env.MEMBERSTACK_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    // 1. Read the raw body (equivalent to disabling bodyParser)
    const rawBody = await req.text();

    // 2. IMPORTANT: Pass ALL headers exactly as received
    const headers = Object.fromEntries(req.headers.entries());

    console.log("Received headers:", headers);

    // 3. Verify signature (same as Pages example)
    const isValid = memberstack.verifyWebhookSignature({
      payload: JSON.parse(rawBody),
      headers,
      secret: process.env.MEMBERSTACK_WEBHOOK_SECRET!,
    });

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    // 4. Safe to parse JSON AFTER verification
    const data = JSON.parse(rawBody);

    console.log("Webhook event verified:", data.event);

    // Handle events
    switch (data.event) {
      case "member.created":
        console.log("Handle member.created");
        break;
      case "member.updated":
        console.log("Handle member.updated");
        break;
      default:
        console.log("Unhandled event:", data.event);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
