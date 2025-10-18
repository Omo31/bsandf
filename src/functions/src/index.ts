

'use server';
import * as admin from 'firebase-admin';
import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onUserCreate } from 'firebase-functions/v2/auth';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

admin.initializeApp();
const db = admin.firestore();

/**
 * Creates a user document in Firestore whenever a new user signs up.
 * This function is triggered by the onUserCreate event from Firebase Authentication.
 */
export const createUserDocument = onUserCreate(async (event) => {
  const user = event.data;
  const { uid, email, displayName } = user;

  const usersCollection = db.collection('users');

  // Parse displayName to get first and last names
  const nameParts = displayName?.split(' ') || [];
  const firstName = nameParts[0] || 'New';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  // Create the user document in the 'users' collection.
  const userRef = usersCollection.doc(uid);
  try {
    await userRef.set({
      uid,
      email,
      firstName,
      lastName,
      createdAt: FieldValue.serverTimestamp(),
    });
    console.log(`Successfully created user document for ${uid}.`);
  } catch (error) {
    console.error(`Error creating user document for ${uid}:`, error);
  }
});


/**
 * Trigger to update product inventory when an order status changes to 'Accepted'.
 */
export const updateInventoryOnOrderAccepted = onDocumentUpdated('users/{userId}/orders/{orderId}', async (event) => {
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    // Check if the status was changed to 'Accepted'
    if (beforeData?.status !== 'Accepted' && afterData?.status === 'Accepted') {
        const items = afterData.items;
        if (!items || !Array.isArray(items)) {
            console.log(`Order ${event.params.orderId} has no items to process.`);
            return;
        }

        const batch = db.batch();

        items.forEach((item: { productId: string; quantity: number }) => {
            if (item.productId && item.quantity > 0) {
                const productRef = db.collection('products').doc(item.productId);
                // Decrement the inventory count
                batch.update(productRef, { stock: FieldValue.increment(-item.quantity) });
            }
        });

        try {
            await batch.commit();
            console.log(`Inventory updated for order ${event.params.orderId}.`);
        } catch (error) {
            console.error(`Error updating inventory for order ${event.params.orderId}:`, error);
        }
    }
});


/**
 * Notifies all admins when a new order is created and requires review.
 */
export const onOrderCreated = onDocumentCreated('users/{userId}/orders/{orderId}', async (event) => {
  const orderId = event.params.orderId;
  const userId = event.params.userId;
  const orderData = event.data?.data();

  if (!orderData || orderData.status !== 'Pending Admin Review') {
    console.log('Order does not require admin review notification.');
    return;
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'A customer';

    // This is now an open system, but we might want to notify specific users later.
    // For now, let's log that a notification would be created. A real implementation
    // might query for users with a 'notification_recipient' flag, for example.
    console.log(`A new order #${orderId} was created by ${userName} and is pending review.`);
    
  } catch (error) {
    console.error(`Error processing new order notification for ${orderId}:`, error);
  }
});

/**
 * Notifies a user when their order status is updated.
 */
export const onOrderStatusUpdate = onDocumentUpdated('users/{userId}/orders/{orderId}', async (event) => {
  const orderId = event.params.orderId;
  const userId = event.params.userId;
  const beforeData = event.data?.before.data();
  const afterData = event.data?.after.data();

  if (!beforeData || !afterData || beforeData.status === afterData.status) {
    return; // No status change
  }

  let title = `Order #${orderId} Updated`;
  let message = `Your order status has changed to: ${afterData.status}.`;
  let link = '/dashboard/history';
  let shouldNotifyUser = false;
  
  // These notifications are sent to the user whose order it is.
  switch (afterData.status) {
    case 'Pending User Approval':
      shouldNotifyUser = true;
      message = `An admin has reviewed your order. Please approve the final quote to proceed.`;
      break;
    case 'Processing':
    case 'Shipped':
    case 'Canceled':
      shouldNotifyUser = true;
      break;
    // We don't notify the user for 'Accepted' or 'Rejected' because they initiated that action.
    case 'Accepted':
    case 'Rejected':
       break;
  }

  try {
    if (shouldNotifyUser) {
      const userNotification = {
        userId: userId,
        title: title,
        message: message,
        link: link,
        isRead: false,
        timestamp: FieldValue.serverTimestamp(),
      };
      const userNotifRef = db.collection('users').doc(userId).collection('notifications').doc();
      await userNotifRef.set(userNotification);
      console.log(`Sent status update notification to user ${userId} for order ${orderId}.`);
    }

  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
});
