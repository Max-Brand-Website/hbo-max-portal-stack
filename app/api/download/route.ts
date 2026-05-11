import { NextRequest, NextResponse } from "next/server";
import airtable from "airtable";

export const dynamic = "force-dynamic";

const base = airtable.base(process.env.AIRTABLE_BASE_ID!);

function escapeFormulaValue(value: string) {
  return value.replace(/'/g, "\\'");
}

export async function GET(request: NextRequest) {
  
  const { searchParams } = new URL(request.url); 

  const fileName = searchParams.get("fileName") || "Unknown File";
  
  const fileUrl = searchParams.get("fileUrl") || "";

  const normalUrl = decodeURIComponent(fileUrl);

  console.log(normalUrl); 
  
  const email = searchParams.get("email") || "";
  
  const name = searchParams.get("name") || "";
  const company = searchParams.get("company") || "";
  const region = searchParams.get("region") || "";
  const pageUrl = searchParams.get("pageUrl") || "";
  //const memberId = searchParams.get("memberId") || "";
  console.log({fileName,fileUrl,email,name,company,region,pageUrl})

  if (!fileUrl) {
    return NextResponse.json(
      { error: "Missing fileUrl" },
      { status: 400 }
    );
  }

  let linkedUserRecordId: string | null = null;

  if (email) {
    const users = await base("Users")
      .select({
        maxRecords: 1,
        filterByFormula: `{Email} = '${escapeFormulaValue(email)}'`,
      })
      .all();

    if (users.length > 0) {
      linkedUserRecordId = users[0].id;
    }
  }

  await base("Download Activity").create([
    {
      fields: {
        "Email": email,
        "Name": name, 
       // "Company": company,
       // "Region": region,
        //"Memberstack ID": memberId,
        "File Name": fileName,
        "File URL": fileUrl,
        "Downloaded At": new Date().toISOString(),
        "Page URL": pageUrl,
       // ...(linkedUserRecordId
         // ? { "User": [linkedUserRecordId] }
          //: {}),
      },
    },
  ]);

  return NextResponse.redirect(normalUrl);
}
