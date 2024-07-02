import AccessNotification from "@/emails/access-notification";
import { Access } from "@/types";
import { html } from "@/utils/utils";
import airtable from "airtable";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Webflow from "webflow-api";

interface UserPutRequest {
  id: string;
  // name: string
  // email: string;
  // access: Access;
}

const webflow = new Webflow({ beta: true, token: process.env.WEBFLOW_API_TOKEN! });
const siteId = process.env.WEBFLOW_SITE_ID!;

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

const resend = new Resend(process.env.RESEND_API_KEY);

// This endpoint receives update events from Airtable
// and updates the user's access group in Webflow and notifies them via email
export async function GET(request: NextRequest) {
  try {
    console.log(`Received GET to /api/user...`);
    // const body = await request.json();

    // id and access are stored in the URL 
    const id = request.nextUrl.searchParams.get('id')!;
    const access = request.nextUrl.searchParams.get('access')!;

    // const { id } = body as UserPutRequest;
    // console.log(`Fetching user ${id}...`);




    if (!id || access !== 'Approved' && access !== 'Denied' && access !== 'Blacklisted' && access !== 'Deleted') {
      // Invalid request
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Fetch user's information from Airtable
    const user = await base('Users').find(id);

    const { Name: name, Email: email, "Webflow ID": webflowId, Access: prevAccess } = user.fields;



    console.log(`Setting ${email} from ${prevAccess} to ${access}...`);

    // If access hasn't changed, bail out
    if (prevAccess === access) {
      console.log(`${name} access is already ${access}. Skipping...`);
      // Not using verbose message, keeping it the same as the success message so regional managers are unaware that we're swallowing requests
      // const message = `${name} access is already ${access}. This can happen if someone else already managed their request, or if your email client opens links multiple times to verify them.`
      const message = `${name}'s access has been set to ${access}`;
      return new NextResponse(html('Success', message), {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }

    let webflowData;
    if (access === 'Deleted') {

      // Delete this user in Webflow
      const { data } = await webflow.delete(`/sites/${siteId}/users/${webflowId}`);
      webflowData = data;

    } else if (access == 'Blacklisted') {
      // Blacklisted users we delete, but it's okay if they don't exist
      try {
        const { data } = await webflow.delete(`/sites/${siteId}/users/${webflowId}`);
        webflowData = data;
      } catch (err) {
        if ((err as any).response?.data?.code === 'user_not_found') {
          console.log(`User ${webflowId} does not exist in Webflow. Continuing to still set as Blacklisted..`);
        } else {
          throw err;
        }
      }
    } else {
      // Approved users get default access, Denied have none
      const accessGroups = access === 'Approved' ? ['default'] : []

      const data = await webflow.patch(`/sites/${siteId}/users/${webflowId}`, {
        accessGroups
      });

      webflowData = data;
    }

    // Update the user's access in Airtable
    const updatedUser = await base('Users').update(id, {
      Access: access
    });

    let resendData, resendError;
    if (access === 'Approved' || access === 'Denied' || access === 'Blacklisted') {
      // Notify the user about their access or lack thereof
      const { data, error } = await resend.emails.send({
        from: process.env.FROM_ADDRESS!,
        to: [email as string],
        subject: access === 'Approved' ? 'Access Granted' : 'Access Denied',
        react: AccessNotification({
          name: name as string,
          access: access as Access,
          url: `${process.env.PORTAL_URL!}/access-granted`
        })
      });

      resendData = data;
      resendError = error;
    }

    if (resendError) {
      console.error(`Error sending email to ${email}...`);
      console.error(resendError);
      return NextResponse.json({ error: resendError }, { status: 500 });
    };

    const message = access === 'Deleted' ? `${name}'s account has been deleted in Webflow. They'll need to sign up again to access the portal.` : `${name}'s access has been set to ${access}`;

    return new NextResponse(html('Success', message), {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
    });

  } catch (err) {
    if ((err as any).response?.data?.code === 'user_not_found') {
      return new NextResponse(html('Not Found', `This user does not have an account in Webflow`), {
        status: 200,
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    return NextResponse.json({ error: err }, { status: (err as any).status || 500 });
  }
}

