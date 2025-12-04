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

    if (!email || typeof email !== "string" || !emailParam) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let memberstackUser = await memberstack.members.retrieve({
      email: email || emailParam,
    });

    if (!memberstackUser) {
      console.log("Missing memberstack user");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    console.log(`Setting ${email} from ${prevAccess} to ${access}...`);

    if (!process.env.MEMBERSTACK_DEFAULT_PLAN) {
      console.log("Missing ENV MEMBERSTACK_DEFAULT_PLAN");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // If access hasn't changed, bail out
    // if (
    //   memberstackUser.data.planConnections.some((p) => {
    //     if (typeof p === "object" && "planID" in p) {
    //       p?.planID === process.env.MEMBERSTACK_DEFAULT_PLAN;
    //     }
    //   })
    // ) {
    //   console.log(`${name} access is already ${access}. Skipping...`);
    //   const message = `${name}'s access has been set to ${access}`;
    //   return new NextResponse(html("Success", message), {
    //     status: 200,
    //     headers: {
    //       "Content-Type": "text/html",
    //     },
    //   });
    // }

    let webflowData;
    console.log("new access", access);
    switch (access) {
      case "Approved":
        console.log("member approved");
        await memberstack.members.addFreePlan({
          id: memberstackUser.data.id,
          data: {
            planId: process.env.MEMBERSTACK_DEFAULT_PLAN,
          },
        });
        await base("Users").update(id, {
          Access: access,
        });
        break;
      case "Blacklisted":
        console.log("setting user to blacklisted");
        await memberstack.members.addFreePlan({
          id: memberstackUser.data.id,
          data: {
            planId: process.env.MEMBERSTACK_BLACKLIST_PLAN || "",
          },
        });
        await base("Users").update(id, {
          Access: access,
        });
        break;

      default:
        console.log("member deleted");
        try {
          await memberstack.members.delete({ id: memberstackUser.data.id });
        } catch (error) {
          throw Error("Could Not Delete Memeberstack User");
        }
        try {
          await base("Users").destroy(id);
        } catch (error) {
          throw Error("Could Not Delete Airtable User");
        }
        break;
    }
    // Update the user's access in Airtable

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
        ? `${
            name || email
          }'s account has been deleted in Memberstack. They'll need to sign up again to access the portal.`
        : `${name || email}'s access has been set to ${access}`;

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
