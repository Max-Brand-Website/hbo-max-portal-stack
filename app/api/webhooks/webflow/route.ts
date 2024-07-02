import { NextRequest, NextResponse } from "next/server";
import airtable from "airtable";

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

export async function GET(request: NextRequest) {
  /* Send back sample of user from Airtable */
  const users = await base('Users').select({
    maxRecords: 3,
    view: "Grid view"
  }).all();

  return NextResponse.json({ body: users });
}

// {
//   "triggerType": "user_account_added",
//   "payload": {
//     "id": "6570ec7d8ccc12afb13912e8",
//     "createdOn": "2023-12-06T21:49:50.418Z",
//     "lastUpdated": "2023-12-06T21:49:50.418Z",
//     "isEmailVerified": false,
//     "data": {
//       "company": "Old Friends",
//       "region": {
//         "name": "US/CANADA",
//         "id": "1609555d657769968ab2251cac44939a",
//         "slug": "us-canada"
//       },
//       "contact-name": "James Clements",
//       "contact-email": "jamesvclements@gmail.com",
//       "reason": "Testing",
//       "name": "James Clements",
//       "email": "jamesvclements+b@gmail.com",
//       "accept-communications": false,
//       "accept-privacy": false
//     },
//     "status": "unverified",
//     "accessGroups": []
//   }
// }

export async function POST(request: NextRequest) {
  console.log(`Received POST to /api/webhooks/webflow...`);
  const body = await request.json();
  // console.log(JSON.stringify(body, null, 2));

  console.log(`triggerType: ${body.triggerType}...`);

  if (body.triggerType === 'user_account_added') {
    console.log(`Received new user account for ${body.payload.data.email}...`);

    // Fetch the regions from Airtable
    const regions = await base('Regions').select({
      maxRecords: 100,
    }).all();


    // Map region name from Webflow to Airtable ID
    const region = regions.find(region => region.fields.Name === body.payload.data.region.name)!;


    // Create this user in Airtable */
    const response = await base('Users').create([
      {
        "fields": {
          "Email": body.payload.data.email,
          "Name": body.payload.data.name,
          "Company": body.payload.data.company,
          "Region": [region.id],
          "Reason": body.payload.data.reason,
          "Contact Name": body.payload.data['contact-name'],
          "Contact Email": body.payload.data['contact-email'],
          "Webflow ID": body.payload.id,
        }
      }
    ]);

    return NextResponse.json({ body: response });
  }


  return NextResponse.json({ body });
}