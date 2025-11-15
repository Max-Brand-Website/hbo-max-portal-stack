// @ts-nocheck
import PortalPasswordEmail from "@/emails/portal-password";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface WebflowFormSubmission {
  _id: string;
  d: string;
  formId: string;
  name: string;
  site: string;
  data: {
    [key: string]: string;
  };
}

const base = require("airtable").base(process.env.AIRTABLE_PASSWORD);

export async function POST(request: NextRequest) {
  try {
    console.log(`Received POST to /api/password`);

    const { name, data } = (await request.json()) as WebflowFormSubmission;

    if (name === "Request Form") {
      console.log(`Received request for ${data["Email"]}...`);
      console.log(JSON.stringify({ name, data }, null, 2));

      /* Fetch the password from Airtable */
      const record = await base("Password").find(
        process.env.AIRTABLE_PASSWORD_RECORD_ID
      );
      const password = record.get("Password");
      console.log(`Retrieved password: ${password} from Airtable...`);

      /* Send the email with the password info */
      console.log(`Attempting to send from ${process.env.FROM_ADDRESS}...`);

      const resendResponse = await resend.emails.send({
        from: "Max Brand Portal <maxbrandportal@wbd.com>",
        to: [data["Email"]],
        subject: "Access the Max Brand Portal",
        react: PortalPasswordEmail({
          url: process.env.PORTAL_URL,
          password,
        }),
      });

      console.log(`Resend response...`);
      console.log(JSON.stringify(resendResponse, null, 2));

      /* Log this visitor's information in Airtable */
      const { data: emailData, error: emailError } = await base(
        "Visitors"
      ).create([
        {
          fields: {
            "Email Address": data["Email"],
            Company: data["Company"],
            "First Name": data["First Name"],
            "Last Name": data["Last Name"],
            Region: data["Region"],
            "Job Title": data["Job Title"],
          },
        },
      ]);

      if (emailError || !emailData) {
        throw new Error(error.message);
      }

      createResponse.forEach(function (record) {
        console.log(`Created visitor record ${record.getId()}...`);
      });

      return NextResponse.json({ data, resendResponse, createResponse });
    } else {
      return NextResponse.json({ error: "Invalid form name" });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error });
  }
}
