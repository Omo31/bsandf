'use server';
import * as admin from 'firebase-admin';
import { onDocumentWritten, onDocumentUpdated } from 'firebase-functions/v2/firestore';
import { UserRecord } from 'firebase-admin/auth';
import { FieldValue } from 'firebase-admin/firestore';

admin.initializeApp();

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

        const db = admin.firestore();
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
