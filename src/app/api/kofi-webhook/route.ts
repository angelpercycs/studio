import { NextRequest, NextResponse } from 'next/server';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

// --- Firebase Admin SDK Initialization ---
// This needs to run only once.
if (!admin.apps.length) {
  // When deployed to Firebase App Hosting, the Admin SDK can initialize
  // without credentials. It automatically discovers the service account.
  admin.initializeApp();
}

const db = admin.firestore();
// --- End of Initialization ---

/**
 * This is your Ko-fi Webhook endpoint.
 * It listens for POST requests from Ko-fi whenever a donation is made.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const kofiData = body.data;

    // 1. **Verify the request is from Ko-fi**
    // You MUST set this token in your Ko-fi webhook settings and as an environment variable.
    const verificationToken = process.env.KOFI_VERIFICATION_TOKEN;
    if (!verificationToken || kofiData.verification_token !== verificationToken) {
      console.warn('Ko-fi Webhook: Invalid verification token.');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // 2. **Check if it's a "Donation" or "Subscription"**
    if (kofiData.type !== 'Donation' && kofiData.type !== 'Subscription') {
       return NextResponse.json({ message: 'Ignoring non-donation event.' }, { status: 200 });
    }

    // 3. **Get the donor's email**
    const email = kofiData.email;
    if (!email) {
      console.log('Ko-fi Webhook: No email provided for donation. Cannot grant premium status.');
      return NextResponse.json({ message: 'No email found, cannot process.' }, { status: 200 });
    }

    // 4. **Find the user in Firestore**
    const usersRef = db.collection('users');
    const querySnapshot = await usersRef.where('email', '==', email).limit(1).get();

    if (querySnapshot.empty) {
      console.log(`Ko-fi Webhook: User with email ${email} not found.`);
      // Return 200 OK to prevent Ko-fi from retrying.
      return NextResponse.json({ message: 'User not found in our database.' }, { status: 200 });
    }

    // 5. **Update the user's document to grant premium status**
    const userDoc = querySnapshot.docs[0];
    const newExpiryDate = new Date();
    newExpiryDate.setDate(newExpiryDate.getDate() + 30); // Add 30 days of premium

    await userDoc.ref.update({
      donationExpiry: Timestamp.fromDate(newExpiryDate)
    });
    
    console.log(`Ko-fi Webhook: Granted premium until ${newExpiryDate.toISOString()} for user ${userDoc.id} (${email})`);

    // 6. **Return a success response to Ko-fi**
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Ko-fi Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
