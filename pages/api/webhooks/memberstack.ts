// pages/api/webhook.js
import memberstackAdmin from "@memberstack/admin";
import { NextApiRequest, NextApiResponse } from "next";
import airtable from "airtable";

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);
// Initialize Memberstack outside the handler
const memberstack = memberstackAdmin.init(
  process.env.MEMBERSTACK_SECRET_KEY || ""
);

// Important: Disable body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Get the raw body
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    const rawBody = Buffer.concat(chunks).toString("utf8");

    // Extract the specific headers Svix needs
    const svixHeaders = {
      "svix-id": req.headers["svix-id"],
      "svix-timestamp": req.headers["svix-timestamp"],
      "svix-signature": req.headers["svix-signature"],
    };

    // Verify webhook with explicit headers
    // const isValid = memberstack.verifyWebhookSignature({
    //   payload: JSON.parse(rawBody),
    //   headers: svixHeaders,
    //   secret: process.env.MEMBERSTACK_WEBHOOK_SECRET || "",
    // });

    const isValid = true;

    if (isValid) {
      const data = JSON.parse(rawBody);
      console.log(`Webhook event: ${data.event}`);

      switch (data.event) {
        case "member.created":
          console.log("New User Data", data.payload);

          const regions = await base("Regions")
            .select({
              maxRecords: 100,
            })
            .all();

          // Map region name from Webflow to Airtable ID
          const region = regions.find(
            (region) =>
              region.fields.Name === data.payload.customFields?.["Region"]
          )!;

          const response = await base("Users").create([
            {
              fields: {
                Email: data.payload.auth.email,
                Name: data.payload.customFields?.["Name"] || "",
                Company: data.payload.customFields?.["Company"] || "",
                Reason: data.payload.customFields?.["Reason"] || "",
                Region: region ? [region.id] : undefined,
                "Contact Name":
                  data.payload.customFields?.["Contact Name"] || "",
                "Contact Email":
                  data.payload.customFields?.["Contact Email"] || "",
              },
            },
          ]);

          // Handle member creation
          break;
        case "member.updated":
          // Handle member update
          break;
        // Add more event types as needed
      }

      return res.status(200).json({ success: true });
    } else {
      console.error("Invalid webhook signature");
      return res.status(401).json({ error: "Invalid signature" });
    }
  } catch (error: any) {
    console.error("Webhook error:", error);
    return res.status(400).json({ error: error?.message || "" });
  }
}
