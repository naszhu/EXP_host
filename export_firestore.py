import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import csv
import json
import os # Used for path manipulation and creating directories
import datetime # *** ADDED: To get timestamp for filename ***

# --- Configuration ---
# User confirmed path:
SERVICE_ACCOUNT_KEY_PATH = '/home/lea/Insync/naszhu@gmail.com/Google Drive/shulai@iu.edu 2022-09-04 14:28/IUB/ctx-e3-0c2d428f6ca9.json'

# Top-level collection name
TOP_LEVEL_COLLECTION = 'participants'
# Subcollection name where trial data is stored
SUBCOLLECTION_NAME = 'trials'

# Choose output format: 'csv' or 'json'
OUTPUT_FORMAT = 'csv' # Recommend CSV for R

# --- Output Directory and File Name ---
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, 'data')

# *** ADDED: Generate timestamp string for unique filename ***
timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
# *** CHANGED: Include timestamp in the filename ***
# output_file_name = f'{TOP_LEVEL_COLLECTION}_{SUBCOLLECTION_NAME}_export_{timestamp_str}.{OUTPUT_FORMAT}'
output_file_name = f'{TOP_LEVEL_COLLECTION}_{SUBCOLLECTION_NAME}_export.{OUTPUT_FORMAT}'


output_file_path = os.path.join(output_dir, output_file_name)
# --- End Configuration ---

def export_firestore_subcollection_data(key_path, top_collection, sub_collection, output_path, format):
    """
    Exports data from a specified subcollection within each document
    of a top-level collection to CSV or JSON using explicit document listing.
    """

    final_key_path = key_path
    if not os.path.exists(final_key_path):
        print(f"Error: Service account key file not found at {final_key_path}")
        return

    try:
        print(f"Initializing Firebase using key: {final_key_path}")
        cred = credentials.Certificate(final_key_path)
        if not firebase_admin._apps:
             firebase_admin.initialize_app(cred)
        else:
             print("Firebase Admin SDK already initialized.")

        db = firestore.client()
        print(f"Successfully connected to Firestore.")

        # --- Get data from subcollections (NEW METHOD) ---
        all_trials_data = []
        print(f"Listing documents in '{top_collection}' collection...")
        # 1. Get references to all documents in the top collection explicitly
        participant_refs = db.collection(top_collection).list_documents()
        participant_ids_found = [ref.id for ref in participant_refs] # Get just the IDs

        print(f"Found participant document IDs: {participant_ids_found}")

        if not participant_ids_found:
            print(f"No documents found in the '{top_collection}' collection.")
            return

        participants_processed = 0
        for participant_id in participant_ids_found: # Iterate through the list of IDs
            participants_processed += 1
            print(f"  Processing participant document with ID: {participant_id}")

            # 2. Get reference to the subcollection for this participant
            trials_ref = db.collection(top_collection).document(participant_id).collection(sub_collection)
            # 3. Stream documents from the subcollection
            trial_docs_stream = trials_ref.stream()

            trial_count_for_participant = 0
            for trial_doc in trial_docs_stream:
                try:
                    trial_data = trial_doc.to_dict()
                    if trial_data is None: # Check if document data is None (shouldn't happen often)
                        print(f"    Warning: Trial document {trial_doc.id} for participant {participant_id} has None data.")
                        continue

                    # Add participant ID and trial ID
                    if 'subject_id' not in trial_data:
                        trial_data['subject_id'] = participant_id
                    trial_data['trial_document_id'] = trial_doc.id

                    all_trials_data.append(trial_data)
                    trial_count_for_participant += 1
                except Exception as trial_error:
                    print(f"    Error processing trial document {trial_doc.id} for participant {participant_id}: {trial_error}")


            print(f"    Found {trial_count_for_participant} trials in '{sub_collection}' subcollection.")

        # --- End getting data ---

        print("-" * 20)
        print(f"Finished processing. Total participants processed: {participants_processed}")
        print(f"Retrieved a total of {len(all_trials_data)} trials.")
        print("-" * 20)


        if not all_trials_data:
            print("No trial data found in any subcollections.")
            return

        # --- Ensure output directory exists ---
        output_directory = os.path.dirname(output_path)
        if not os.path.exists(output_directory):
            print(f"Creating output directory: {output_directory}")
            os.makedirs(output_directory)
        # ---

        # Write data to file
        print(f"Writing data to {output_path} in {format.upper()} format...")

        if format == 'csv':
            headers = set()
            for data in all_trials_data:
                if isinstance(data, dict):
                     headers.update(data.keys())
                else:
                     print(f"Warning: Encountered non-dictionary data item: {data}")

            sorted_headers = sorted(list(headers)) if headers else []

            if not sorted_headers:
                 print("Error: No headers found, cannot write CSV.")
                 return

            with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=sorted_headers, extrasaction='ignore')
                writer.writeheader()
                dict_data_only = [d for d in all_trials_data if isinstance(d, dict)]
                writer.writerows(dict_data_only)

        elif format == 'json':
             # (JSON writing logic remains the same)
            with open(output_path, 'w', encoding='utf-8') as jsonfile:
                json.dump(all_trials_data, jsonfile, ensure_ascii=False, indent=4)
        else:
            print(f"Error: Invalid output format '{format}'. Choose 'csv' or 'json'.")
            return

        print(f"Successfully exported data to {output_path}")

    except FileNotFoundError:
         print(f"Error: Service account key file not found at {final_key_path}")
    except Exception as e:
        print(f"An error occurred: {e}")
        import traceback
        traceback.print_exc()


# --- Run the export ---
if __name__ == "__main__":
    export_firestore_subcollection_data(
        SERVICE_ACCOUNT_KEY_PATH,
        TOP_LEVEL_COLLECTION,
        SUBCOLLECTION_NAME,
        output_file_path, # Use the full path including the directory
        OUTPUT_FORMAT
    )
