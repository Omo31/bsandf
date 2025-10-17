import * as admin from "firebase-admin";
import {onDocumentWritten} from "firebase-functions/v2/firestore";
import {UserRecord} from "firebase-admin/auth";

admin.initializeApp();

/**
 * Trigger to grant or revoke admin custom claims based on the existence
 * of a document in the /roles_admin/{userId} collection.
 */
export const handleAdminRole = onDocumentWritten("roles_admin/{userId}", async (event) => {
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
    } else { // If document is deleted, revoke admin role.
      if (currentCustomClaims.admin === true) {
        console.log(`Revoking admin role for user: ${userId}`);
        const {admin, ...otherClaims} = currentCustomClaims;
        await admin.auth().setCustomUserClaims(userId, otherClaims);
      }
    }
  } catch (error) {
    console.error(`Error processing admin role for user ${userId}:`, error);
  }
});
