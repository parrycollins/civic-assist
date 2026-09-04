import { NextResponse } from "next/server";
import { cloudMeta, listCloudComplaints, recordCloudComplaint, type CloudComplaint } from "@/lib/cloud-ledger";
import { FORWARD_THRESHOLD } from "@/lib/dispatch";

export async function GET() {
  return NextResponse.json({
    cloud: "CivicGH Cloud",
    threshold: FORWARD_THRESHOLD,
    policy: "A location-matched problem is stored here and forwarded to the responsible agency only after 5 citizen complaints.",
    meta: cloudMeta(),
    complaints: listCloudComplaints(),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as CloudComplaint;
  if (!body?.issueId || !body.clusterKey) {
    return NextResponse.json({ error: "Missing complaint." }, { status: 400 });
  }
  const saved = recordCloudComplaint(body);
  return NextResponse.json({
    ok: true,
    threshold: FORWARD_THRESHOLD,
    complaint: saved,
    meta: cloudMeta(),
  });
}
