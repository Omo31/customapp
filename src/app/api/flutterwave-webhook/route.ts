
import { NextRequest, NextResponse } from 'next/server';
import { doc, writeBatch, collection, serverTimestamp, getDoc } from 'firebase-firestore';
import { db } from '@/firebase/server-init'; // We'll need a server-side admin init
import { type Quote } from '@/types';

// This function will verify the transaction with Flutterwave's API
// NOTE: In a real app, you would use a library like 'node-fetch' or 'axios'
async function verifyTransaction(transactionId: string) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
        throw new Error("Flutterwave secret key is not configured.");
    }
    const url = `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`;
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${secretKey}`
        }
    });

    if (!response.ok) {
        throw new Error(`Failed to verify transaction. Status: ${response.status}`);
    }
    
    return response.json();
}


export async function POST(req: NextRequest) {
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers.get('verif-hash');

    if (!signature || signature !== secretHash) {
        // This request isn't from Flutterwave. Discard.
        return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 401 });
    }

    try {
        const body = await req.json();
        
        // Log for debugging purposes
        console.log("Webhook payload received:", body);

        // Check for the event type and status
        if (body.event === 'charge.completed' && body.data.status === 'successful') {
            const { tx_ref: txRef, id: transactionId, amount, currency, customer } = body.data;
            
            // The tx_ref should contain our quoteId
            const quoteId = txRef;
            if (!quoteId) {
                console.error("Webhook Error: tx_ref (quoteId) is missing in payload");
                return NextResponse.json({ status: 'error', message: 'tx_ref is missing' }, { status: 400 });
            }

            // 1. VERIFY THE TRANSACTION with Flutterwave's API to be sure
            const verificationResponse = await verifyTransaction(transactionId);
            
            if (
                verificationResponse.status === 'success' &&
                verificationResponse.data.amount >= amount && // Check if amount paid is >= expected
                verificationResponse.data.currency === currency
            ) {
                // 2. FETCH THE QUOTE to ensure it exists and isn't already paid
                const quoteRef = doc(db, 'quotes', quoteId);
                const quoteSnap = await getDoc(quoteRef);

                if (!quoteSnap.exists()) {
                    console.error(`Webhook Error: Quote ${quoteId} not found.`);
                    return NextResponse.json({ status: 'error', message: 'Quote not found' }, { status: 404 });
                }

                const quote = quoteSnap.data() as Quote;

                if (quote.status === 'Paid') {
                    // This payment has already been processed. Acknowledge and exit.
                    console.log(`Webhook Info: Quote ${quoteId} is already paid. Acknowledging webhook.`);
                    return NextResponse.json({ status: 'success', message: 'Already processed' });
                }

                // 3. PERFORM DATABASE UPDATES in a batch
                const batch = writeBatch(db);

                // Update quote status
                batch.update(quoteRef, { status: "Paid", updatedAt: serverTimestamp() });

                // Create new order
                const orderRef = doc(collection(db, "orders"));
                batch.set(orderRef, {
                    userId: quote.userId,
                    quoteId: quoteId,
                    customerName: quote.customerName,
                    customerEmail: quote.customerEmail,
                    items: quote.items,
                    totalCost: amount, // Use the amount from the verified transaction
                    shippingAddress: quote.shippingAddress,
                    status: 'Pending',
                    createdAt: serverTimestamp(),
                });

                // Create user notification
                const userNotifRef = doc(collection(db, `users/${quote.userId}/notifications`));
                batch.set(userNotifRef, {
                    userId: quote.userId,
                    title: "Order Placed Successfully!",
                    description: `Your order #${orderRef.id.slice(-6)} has been received.`,
                    href: `/account/orders/${orderRef.id}`,
                    isRead: false,
                    createdAt: serverTimestamp(),
                });
                
                // Create admin notification in the central notifications collection
                const adminNotifRef = doc(collection(db, `notifications`));
                batch.set(adminNotifRef, {
                     userId: 'admin', // Keep a generic user ID for system-wide notifications
                     title: "New Order Received",
                     description: `A new order #${orderRef.id.slice(-6)} was placed by ${quote.customerName}.`,
                     href: `/admin/orders/${orderRef.id}`,
                     isRead: false,
                     createdAt: serverTimestamp()
                });

                await batch.commit();
                
                console.log(`Successfully processed payment and created order for quote ${quoteId}.`);
            } else {
                 console.error("Webhook Error: Transaction verification failed.", verificationResponse);
                 return NextResponse.json({ status: 'error', message: 'Transaction verification failed' }, { status: 400 });
            }
        }
        
        // Acknowledge receipt of the webhook to Flutterwave
        return NextResponse.json({ status: 'success' });

    } catch (error: any) {
        console.error('Webhook processing error:', error);
        return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
    }
}
