// Import the Firebase Admin SDK and Node.js readline module for confirmation
const admin = require('firebase-admin');
const readline = require('readline'); // Added for user confirmation

// ---- Configuration ----
// Path to your downloaded service account key JSON file
const serviceAccount = require('/home/lea/Insync/naszhu@gmail.com/Google Drive/shulai@iu.edu 2022-09-04 14:28/IUB/ctx-e3-0c2d428f6ca9.json');
// The name of the collection to check and delete from
// const collectionName = 'participants';
const collectionName = 'participants_finished';
// The exact length of a valid Prolific ID
const prolificIdLength = 24;
// Max number of documents to delete per batch (Firestore limit is 500)
const batchSize = 400; // Using 400 for safety margin
// ---------------------

// Function to ask for user confirmation
function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(question, ans => {
    rl.close();
    resolve(ans);
  }))
}


try {
  // Initialize Firebase Admin SDK
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  const db = admin.firestore();
  console.log("Firebase Admin SDK Initialized Successfully.");

  async function findAndDeleteNonProlificIds() {
    console.log(`\nChecking collection '${collectionName}' using listDocuments()...`);
    const collectionRef = db.collection(collectionName);
    // Store the actual DocumentReference objects to delete
    const refsToDelete = [];

    try {
      // Get all document references using listDocuments()
      const documentRefs = await collectionRef.listDocuments();

      if (!documentRefs || documentRefs.length === 0) {
        console.log(`Collection '${collectionName}' appears empty or could not be listed.`);
        return;
      }
      console.log(`Found ${documentRefs.length} total document references in '${collectionName}'.`);

      // Filter references based on the ID length rule
      documentRefs.forEach(ref => {
        if (ref.id.length !== prolificIdLength) {
          refsToDelete.push(ref); // Add the reference itself
        }
      });

      // --- SAFETY CHECK AND CONFIRMATION ---
      if (refsToDelete.length === 0) {
        console.log(`No documents found with ID length != ${prolificIdLength}. Nothing to delete.`);
        return;
      }

      console.log(`\nIdentified ${refsToDelete.length} documents(s) with ID length != ${prolificIdLength} to be DELETED:`);
      // Optionally print the IDs again for final review
      refsToDelete.slice(0, 50).forEach(ref => console.log(` - ${ref.id}`)); // Print first 50 IDs
      if (refsToDelete.length > 50) {
          console.log(`   (... and ${refsToDelete.length - 50} more)`);
      }
      console.log("\n!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
      console.log("!!! DELETION IS PERMANENT !!!");
      console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

      const confirmation = await askConfirmation(`Type exactly 'YES' to confirm deletion of these ${refsToDelete.length} documents INDIVIDUALLY: `);

      if (confirmation !== 'YES') {
        console.log("Deletion cancelled by user.");
        return;
      }

      // --- PERFORM RECURSIVE DELETION ---
      console.log(`\nStarting RECURSIVE deletion process for ${refsToDelete.length} documents...`);
      console.log("This will delete each listed document AND ALL ITS SUBCOLLECTIONS.");
      let successCount = 0;
      let errorCount = 0;

      // Create an array of recursive delete promises
      const deletePromises = refsToDelete.map(docRef => {
        // Use recursiveDelete instead of simple .delete()
        return db.recursiveDelete(docRef)
          .then(() => {
            console.log(`Recursively deleted: ${docRef.id} and its subcollections.`);
            successCount++;
          })
          .catch(error => {
            console.error(`Failed to recursively delete ${docRef.id}:`, error.message);
            errorCount++;
          });
      });

      // Wait for all delete operations to settle
      // NOTE: recursiveDelete can take longer per document than simple delete
      await Promise.allSettled(deletePromises);

      console.log("\n--- Deletion Summary ---");
      console.log(`Attempted to delete: ${refsToDelete.length}`);
      console.log(`Successfully deleted: ${successCount}`);
      console.log(`Failed to delete: ${errorCount}`);
      console.log("------------------------");
      console.log("Recursive deletion process complete.");
      // --- END RECURSIVE DELETION ---
    } catch (error) {
      console.error(`Error processing collection '${collectionName}':`, error);
    }
  }

  // Run the function
  findAndDeleteNonProlificIds();

} catch (initError) {
  console.error("Error initializing Firebase Admin SDK:", initError);
  console.error("Please ensure 'serviceAccountKey.json' is in the correct path and is valid.");
}