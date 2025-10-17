
'use server';
import * as admin from 'firebase-admin';
import { onDocumentUpdated, onDocumentCreated } from 'firebase-functions/v2/firestore';
import { onUserCreate } from 'firebase-functions/v2/auth';
import { FieldValue } from 'firebase-admin/firestore';

admin.initializeApp();
const db = admin.firestore();

// The email address of the designated super admin.
const SUPER_ADMIN_EMAIL = 'olaomo31@yahoo.co.uk';

/**
 * Trigger to create a user document in Firestore when a new Firebase Auth user is created.
 * It also grants admin role and sets custom claims for the designated super admin.
 */
export const createFirestoreUser = onUserCreate(async (event) => {
  const user = event.data;
  const { uid, email, displayName } = user;

  if (!email) {
    console.log(`User ${uid} has no email, cannot process for admin role.`);
    return;
  }

  const userRef = db.collection('users').doc(uid);

  const nameParts = displayName?.split(' ') || [];
  const firstName = nameParts[0] || 'New';
  const lastName = nameParts.slice(1).join(' ') || 'User';

  let userRole = 'user';

  try {
    // Check if the new user's email matches the designated super admin email.
    if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
      userRole = 'admin';
      console.log(`Super admin user detected. Granting admin role and custom claim to ${uid}.`);
      // Set the admin custom claim immediately. This is the most reliable method.
      await admin.auth().setCustomUserClaims(uid, { admin: true });
    }
    
    // Create the user document in Firestore with the determined role.
    await userRef.set({
      uid: uid,
      email: email,
      firstName: firstName,
      lastName: lastName,
      role: userRole,
      createdAt: FieldValue.serverTimestamp(),
    }, { merge: true });

    console.log(`Successfully created user document for ${uid} with role: ${userRole}`);

  } catch (error) {
    console.error(`Error in createFirestoreUser for ${uid}:`, error);
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

    const adminUsers = await db.collection('users').where('role', '==', 'admin').get();
    if (adminUsers.empty) {
      console.log('No admins found to notify.');
      return;
    }

    const batch = db.batch();
    const notification = {
      title: 'New Order for Review',
      message: `${userName} placed a new order (#${orderId}) that needs your review.`,
      link: `/admin/orders`,
      isRead: false,
      timestamp: FieldValue.serverTimestamp(),
    };

    adminUsers.docs.forEach(adminDoc => {
      const adminId = adminDoc.id;
      const notificationRef = db.collection('users').doc(adminId).collection('notifications').doc();
      batch.set(notificationRef, { ...notification, userId: adminId });
    });

    await batch.commit();
    console.log(`Notified ${adminUsers.size} admins about new order ${orderId} for review.`);
  } catch (error) {
    console.error(`Error creating notifications for order ${orderId}:`, error);
  }
});

/**
 * Notifies a user when their order status is updated by an admin or by themselves.
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
  let shouldNotifyAdmins = false;

  // Determine the notification content and recipients based on the status change
  switch (afterData.status) {
    case 'Pending User Approval':
      shouldNotifyUser = true;
      message = `An admin has reviewed your order. Please approve the final quote to proceed.`;
      break;
    case 'Accepted':
       shouldNotifyAdmins = true;
       // We don't notify the user here because they initiated the action.
       break;
    case 'Rejected':
       shouldNotifyAdmins = true;
       // We don't notify the user here.
       break;
    case 'Processing':
    case 'Shipped':
    case 'Canceled':
      shouldNotifyUser = true;
      break;
  }

  try {
    // Notify the user if required
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

    // Notify admins if required
    if (shouldNotifyAdmins) {
      const userDoc = await db.collection('users').doc(userId).get();
      const userName = userDoc.exists ? `${userDoc.data()?.firstName} ${userDoc.data()?.lastName}` : 'A customer';
      
      const adminUsers = await db.collection('users').where('role', '==', 'admin').get();
      if (adminUsers.empty) {
        console.log('No admins found to notify.');
        return;
      }

      const batch = db.batch();
      const adminNotification = {
        title: `Order #${orderId} ${afterData.status}`,
        message: `${userName} has ${afterData.status.toLowerCase()} their order.`,
        link: `/admin/orders`,
        isRead: false,
        timestamp: FieldValue.serverTimestamp(),
      };

      adminUsers.docs.forEach(adminDoc => {
        const adminId = adminDoc.id;
        const notificationRef = db.collection('users').doc(adminId).collection('notifications').doc();
        batch.set(notificationRef, { ...adminNotification, userId: adminId });
      });

      await batch.commit();
      console.log(`Notified ${adminUsers.size} admins about status change for order ${orderId}.`);
    }

  } catch (error) {
    console.error('Error sending order status notification:', error);
  }
});
    