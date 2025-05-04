// Import the Firebase Admin SDK and Node.js readline module for confirmation
const admin = require('firebase-admin');
const readline = require('readline'); // For user confirmation prompts

// ---- Configuration ----
// Path to your downloaded service account key JSON file
// ** Using the exact path you provided **
const serviceAccount = require('/home/lea/Insync/naszhu@gmail.com/Google Drive/shulai@iu.edu 2022-09-04 14:28/IUB/ctx-e3-0c2d428f6ca9.json');

// The exact length of a valid Prolific ID
// Documents whose ID length is NOT this value will be targeted for deletion.
const prolificIdLength = 24;
// NOTE: collectionName is removed from here, it will be chosen via prompt
// NOTE: batchSize is removed as recursiveDelete doesn't use manual batches
// ---------------------

// Function to ask for user confirmation (used for final delete)
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

// --- ADDED: Function to ask for initial collection choice ---
function askCollectionChoice() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  const question = `Which collection do you want to process?\n  1: participants\n  2: participants_finished\nEnter number (1 or 2): `;
  return new Promise((resolve, reject) => {
    rl.question(question, ans => {
      rl.close();
      if (ans === '1') {
        resolve('participants');
      } else if (ans === '2') {
        resolve('participants_finished');
      } else {
        reject(new Error('Invalid choice. Please enter 1 or 2.'));
      }
    });
  });
}
// --- END ADDED FUNCTION ---


// --- ADDED: Main async function to orchestrate the process ---
async function run() {
  let targetCollectionName; // Variable to hold the chosen name
  try {
    // Ask the user which collection to process first
    targetCollectionName = await askCollectionChoice();
    console.log(`\n--> Okay, proceeding to process collection: "${targetCollectionName}"`);
  } catch (choiceError) {
    // Handle invalid choice from the prompt
    console.error("Exiting:", choiceError.message);
    process.exit(1); // Stop the script
  }

  // --- Original main try block starts here ---
  try {
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    const db = admin.firestore();
    console.log("Firebase Admin SDK Initialized Successfully.");

    // --- MODIFIED: Function definition now accepts collection name ---
    async function findAndDeleteNonProlificIds(collectionNameToProcess) {
      // --- MODIFIED: Use the passed-in name ---
      console.log(`\nChecking collection '${collectionNameToProcess}' using listDocuments()...`);
      const collectionRef = db.collection(collectionNameToProcess); // Use passed-in name
      // --- End Modification ---

      // Store the actual DocumentReference objects to delete
      const refsToDelete = [];

      try {
        // Get all document references using listDocuments()
        const documentRefs = await collectionRef.listDocuments();

        if (!documentRefs || documentRefs.length === 0) {
          // --- MODIFIED: Use the passed-in name ---
          console.log(`Collection '${collectionNameToProcess}' appears empty or could not be listed.`);
          // --- End Modification ---
          return;
        }
        // --- MODIFIED: Use the passed-in name ---
        console.log(`Found ${documentRefs.length} total document references in '${collectionNameToProcess}'.`);
        // --- End Modification ---

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

        // --- MODIFIED: Updated confirmation prompt text slightly ---
        const confirmation = await askConfirmation(`Type exactly 'YES' to confirm RECURSIVE deletion of these ${refsToDelete.length} documents (and their subcollections) from '${collectionNameToProcess}': `);
        // --- End Modification ---

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
        // --- MODIFIED: Use the passed-in name ---
        console.error(`Error processing collection '${collectionNameToProcess}':`, error);
        // --- End Modification ---
      }
    } // --- End of findAndDeleteNonProlificIds definition ---

    // --- MODIFIED: Call the function with the chosen name ---
    await findAndDeleteNonProlificIds(targetCollectionName);
    // --- End Modification ---

  } catch (initError) {
    console.error("Error initializing Firebase Admin SDK:", initError);
    console.error("Please ensure 'serviceAccountKey.json' is in the correct path and is valid.");
  }
// --- ADDED: End brace for the run() function ---
}
// --- END OF MAIN EXECUTION WRAPPER ---


// --- MODIFIED: Call the main run() function to start everything ---
run();
// --- End Modification ---