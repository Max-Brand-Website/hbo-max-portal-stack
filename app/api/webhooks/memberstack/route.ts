export const runtime = "nodejs"; // Force serverless (shows logs)
export const dynamic = "force-dynamic"; // Prevent caching

import memberstackAdmin from "@memberstack/admin";
import { NextRequest, NextResponse } from "next/server";
import airtable from "airtable";

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);
const memberstack = memberstackAdmin.init(
  process.env.MEMBERSTACK_SECRET_KEY as string
);

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.MEMBERSTACK_WEBHOOK_SECRET!;
    console.log({
      MEMBERSTACK_WEBHOOK_SECRET: secret,
    });
    // Parse body (NextRequest does NOT have req.body)
    const rawBody = await req.text();

    const headers = {
      "svix-id":
        req.headers.get("svix-id") ||
        req.headers.get("Svix-Id") ||
        req.headers.get("SVIX-ID"),
      "svix-timestamp":
        req.headers.get("svix-timestamp") ||
        req.headers.get("Svix-Timestamp") ||
        req.headers.get("SVIX-TIMESTAMP"),
      "svix-signature":
        req.headers.get("svix-signature") ||
        req.headers.get("Svix-Signature") ||
        req.headers.get("SVIX-SIGNATURE"),
    };

    console.log("All headers:", req.headers);

    // 1. Verify webhook signature
    const isValid = memberstack.verifyWebhookSignature({
      payload: JSON.parse(rawBody), // parsed JSON
      headers, // Svix headers
      secret: process.env.MEMBERSTACK_WEBHOOK_SECRET!,
    });

    if (!isValid) {
      console.error("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    // 2. Check for duplicate webhooks
    const webhookId = req.headers.get("ms-webhook-id");

    if (!webhookId) {
      console.error("Missing webhook ID");
      return NextResponse.json(
        { error: "Missing webhook ID" },
        { status: 400 }
      );
    }

    // 3. Handle event data
    const { event, payload, timestamp } = body;

    console.log(`Processing webhook: ${event}`);

    switch (event) {
      case "member.created":
        // TODO: Handle new member creation
        console.log("Member created:", payload);
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
    }

    // Must return 200 so Memberstack does not retry
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Still return 200 to avoid retries
    return NextResponse.json({ error: "Error processed" }, { status: 200 });
  }
}
