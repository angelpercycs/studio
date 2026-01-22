import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

/**
 * Ko-fi Webhook endpoint (Currently Inactive).
 * This endpoint is reserved for manual donation processing.
 * Automatic processing has been disabled to simplify the architecture.
 */
export async function POST(req: NextRequest) {
  // The automatic webhook functionality is currently disabled.
  // The new process involves the user manually claiming their reward via a form.
  // This endpoint remains but does no action.
  return NextResponse.json({ success: true, message: 'Webhook inactivo. El usuario debe reclamar la recompensa manualmente.' }, { status: 200 });
}
