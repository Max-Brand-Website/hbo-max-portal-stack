import airtable from "airtable";
import { NextRequest, NextResponse } from "next/server";


const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};
// This endpoint receives update events from Airtable
// and updates the user's access group in Webflow and notifies them via email
export async function POST(request: NextRequest) {
  console.log(`Received POST to /api/user/verify...`);
  try {

    const body = await request.json();
    const { email } = body;

    if (!email) {
      // Invalid request
      return NextResponse.json({ error: 'Invalid request' }, { headers, status: 400 });
    }

    // Check if this email is in the 'Blacklist' view of the 'Users' table
    const deniedOrBlacklisted = await base('Users').select({
      view: 'Denied or Blacklisted',
      filterByFormula: `Email = "${email}"`
    }).firstPage();

    if (deniedOrBlacklisted.length > 0) {
      return NextResponse.json({ error: 'User is denied or blacklisted' }, { headers, status: 401 });
    } else {
      return NextResponse.json({ message: 'User is not denied or blacklisted' }, { headers, status: 200 });
    }
  } catch (err) {
    return NextResponse.json({ error: err }, { status: 500 })
  }
}
