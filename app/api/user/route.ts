import AccessNotification from "@/emails/access-notification";
import { Access } from "@/types";
import { html } from "@/utils/utils";
import airtable from "airtable";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import memberstackAdmin from "@memberstack/admin";

interface UserPutRequest {
  id: string;
  // name: string
  // email: string;
  // access: Access;
}

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

const resend = new Resend(process.env.RESEND_API_KEY);

if (!process.env.MEMBERSTACK_SECRET_KEY) {
  throw new Error("Missing ENV Key");
}

const memberstack = memberstackAdmin.init(process.env.MEMBERSTACK_SECRET_KEY);
// This endpoint receives update events from Airtable
// and updates the user's access group in Webflow and notifies them via email
export async function GET(request: NextRequest) {
  try {
    console.log(`Received GET to /api/user...`);
    // const body = await request.json();

    // id and access are stored in the URL
    const id = request.nextUrl.searchParams.get("id")!;
    const access = request.nextUrl.searchParams.get("access")!;
    const emailParam = request.nextUrl.searchParams.get("email");

    if (
      !id ||
      (access !== "Approved" &&
        access !== "Denied" &&
        access !== "Blacklisted" &&
        access !== "Deleted")
    ) {
      // Invalid request
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Fetch user's information from Airtable
    const user = await base("Users").find(id);

    const {
      Name: name,
      Email: email,
      "Webflow ID": webflowId,
      Access: prevAccess,
    } = user.fields;

    if (!email) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let memberstackUser = await memberstack.members.retrieve({
      email: email || emailParam,
    });

    console.log(`Setting ${email} from ${prevAccess} to ${access}...`);

    // If access hasn't changed, bail out
    if (prevAccess === access) {
      console.log(`${name} access is already ${access}. Skipping...`);
      // Not using verbose message, keeping it the same as the success message so regional managers are unaware that we're swallowing requests
      // const message = `${name} access is already ${access}. This can happen if someone else already managed their request, or if your email client opens links multiple times to verify them.`
      const message = `${name}'s access has been set to ${access}`;
      return new NextResponse(html("Success", message), {
        status: 200,
        headers: {
          "Content-Type": "text/html",
        },
      });
    }

    let webflowData;
    if (access === "Deleted") {
      memberstack.members.delete({ id: memberstackUser.data.id });
    } else if (access == "Blacklisted") {
      // Blacklisted users we delete, but it's okay if they don't exist
      memberstack.members.delete({ id: memberstackUser.data.id });
    } else {
      if (!process.env.MEMBERSTACK_DEFAULT_PLAN) {
        return NextResponse.json({ error: "Invalid request" }, { status: 400 });
      }

      await memberstack.members.addFreePlan({
        id: memberstackUser.data.id,
        data: {
          planId: process.env.MEMBERSTACK_DEFAULT_PLAN,
        },
      });
    }

    // Update the user's access in Airtable
    await base("Users").update(id, {
      Access: access,
    });

    let resendData, resendError;
    if (
      access === "Approved" ||
      access === "Denied" ||
      access === "Blacklisted"
    ) {
      // Notify the user about their access or lack thereof
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_ADDRESS!,
        to: [email as string],
        subject: access === "Approved" ? "Access Granted" : "Access Denied",
        react: AccessNotification({
          name: name as string,
          access: access as Access,
          url: `${process.env.PORTAL_URL!}/access-granted`,
        }),
      });

      resendData = data;
      resendError = error;
    }

    if (resendError) {
      console.error(`Error sending email to ${email}...`);
      console.error(resendError);
      return NextResponse.json({ error: resendError }, { status: 500 });
    }

    const message =
      access === "Deleted"
        ? `${name}'s account has been deleted in Memberstack. They'll need to sign up again to access the portal.`
        : `${name}'s access has been set to ${access}`;

    return new NextResponse(html("Success", message), {
      status: 200,
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (err) {
    console.log(err);
    if ((err as any).response?.data?.code === "user_not_found") {
      return new NextResponse(
        html("Not Found", `This user does not have an account in Memberstack`),
        {
          status: 200,
          headers: {
            "Content-Type": "text/html",
          },
        }
      );
    }
    return NextResponse.json(
      { error: err },
      { status: (err as any).status || 500 }
    );
  }
}
