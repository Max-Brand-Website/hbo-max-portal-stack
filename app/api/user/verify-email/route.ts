import airtable from "airtable";
import memberstackAdmin from "@memberstack/admin";
import { NextRequest, NextResponse } from "next/server";
import { html } from "@/utils/utils";

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

if (!process.env.MEMBERSTACK_SECRET_KEY) {
  throw new Error("Missing ENV Key");
}

const memberstack = memberstackAdmin.init(process.env.MEMBERSTACK_SECRET_KEY);

const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers });
}

export async function GET(request: NextRequest) {
  try {
    console.log(`Received GET to /api/user/verify-email...`);

    const id = request.nextUrl.searchParams.get("id")!;

    // Fetch user's information from Airtable
    const user = await base("Users").find(id);

    const { Email: email, Access: currentAccess } = user.fields;

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    let memberstackUser = await memberstack.members.retrieve({
      email: email,
    });

    if (!memberstackUser) {
      console.log("Missing memberstack user");
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    await memberstack.members.update({
      id: memberstackUser.data.id,
      data: {
        verified: true,
      },
    });

    return new NextResponse(html("Success", "Email Verified"), {
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
        },
      );
    }
    return NextResponse.json(
      { error: err },
      { status: (err as any).status || 500 },
    );
  }
}
