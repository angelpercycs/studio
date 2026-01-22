import { NextRequest, NextResponse } from 'next/server';

/**
 * Ko-fi Webhook endpoint (Currently Inactive).
 * This endpoint is reserved for future automatic donation processing.
 * For now, donation rewards are handled manually.
 */
export async function POST(req: NextRequest) {
  // The webhook functionality is currently disabled in favor of a manual process.
  // This endpoint returns a success message to Ko-fi to prevent retries,
  // but does not perform any action.
  return NextResponse.json({ success: true, message: 'Webhook inactivo. Procesamiento manual.' }, { status: 200 });
}
