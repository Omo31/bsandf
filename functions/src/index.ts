'use server';
import * as admin from 'firebase-admin';
import { onDocumentWritten, onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onUserCreate } from 'firebase-functions/v2/auth';
import { UserRecord } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';

admin.initializeApp();
const db = admin.firestore();

/**
 * Trigger to create a user document in Firestore when a new Firebase Auth user is created.
 */
export const createFirestoreUser = onUserCreate(async (event) => {
  const user = event.data;
  const { uid, email, displayName } = user;

  const userRef = db.collection('users').doc(uid);

  // Split displayName into firstName and lastName
  const nameParts = displayName?.split(' ') || [];
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  try {
    await userRef.set({
      uid: uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: 'user', // Default role
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });
    console.log(`Successfully created user document for ${uid}`);
  } catch (error) {
    console.error(`Error creating user document for ${uid}:`, error);
  }
});


/**
 * Trigger to grant or revoke admin custom claims based on the existence
 * of a document in the /roles_admin/{userId} collection.
 */
export const handleAdminRole = onDocumentWritten('roles_admin/{userId}', async event => {
  const userId = event.params.userId;
  const afterData = event.data?.after.data();

  try {
    const user: UserRecord = await admin.auth().getUser(userId);
    const currentCustomClaims = user.customClaims || {};

    // If a document exists, grant admin role.
    if (afterData) {
      if (currentCustomClaims.admin !== true) {
        console.log(`Granting admin role to user: ${userId}`);
        await admin.auth().setCustomUserClaims(userId, { ...currentCustomClaims, admin: true });
      }
    } else {
      // If document is deleted, revoke admin role.
      if (currentCustomClaims.admin === true) {
        console.log(`Revoking admin role for user: ${userId}`);
        const { admin, ...otherClaims } = currentCustomClaims;
        await admin.auth().setCustomUserClaims(userId, otherClaims);
      }
    }
  } catch (error) {
    console.error(`Error processing admin role for user ${userId}:`, error);
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
                batch.update(productRef, { inventory: FieldValue.increment(-item.quantity) });
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
 * Notifies all admins when a new order is created.
 */
export const onOrderCreated = onDocumentCreated('users/{userId}/orders/{orderId}', async (event) => {
  const orderId = event.params.orderId;
  const userId = event.params.userId;
  const orderData = event.data?.data();

  if (!orderData) {
    console.log('No data associated with the event');
    return;
  }

  try {
    const userDoc = await db.collection('users').doc(userId).get();
    const userData = userDoc.data();
    const userName = userData ? `${userData.firstName} ${userData.lastName}` : 'A customer';

    const adminRoles = await db.collection('roles_admin').get();
    if (adminRoles.empty) {
      console.log('No admins found to notify.');
      return;
    }

    const batch = db.batch();
    const notification = {
      title: 'New Order Received',
      message: `${userName} just placed a new order: #${orderId}.`,
      link: `/admin/orders`,
      isRead: false,
      timestamp: FieldValue.serverTimestamp(),
    };

    adminRoles.docs.forEach(adminDoc => {
      const adminId = adminDoc.id;
      const notificationRef = db.collection('users').doc(adminId).collection('notifications').doc();
      batch.set(notificationRef, { ...notification, userId: adminId });
    });

    await batch.commit();
    console.log(`Notified ${adminRoles.size} admins about new order ${orderId}.`);
  } catch (error) {
    console.error(`Error creating notifications for order ${orderId}:`, error);
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

  const notification = {
    userId: userId,
    title: `Order #${orderId} Updated`,
    message: `Your order status has been updated to: ${afterData.status}.`,
    link: '/dashboard/history',
    isRead: false,
    timestamp: FieldValue.serverTimestamp(),
  };

  try {
    const notificationRef = db.collection('users').doc(userId).collection('notifications').doc();
    await notificationRef.set(notification);
    console.log(`Sent status update notification to user ${userId} for order ${orderId}.`);
  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
});
