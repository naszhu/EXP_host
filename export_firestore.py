import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore
import csv
import json
import os # Used for path manipulation and creating directories
import datetime # To get timestamp for filename
import traceback # For detailed error printing

# --- Configuration ---
# User confirmed path:
SERVICE_ACCOUNT_KEY_PATH = '/home/lea/Insync/naszhu@gmail.com/Google Drive/shulai@iu.edu 2022-09-04 14:28/IUB/ctx-e3-0c2d428f6ca9.json'

# --- Data Source Configurations ---
# Define configurations for each data source you want to export
DATA_SOURCES = [
    {
        "id": "backup", # Identifier for this source
        "top_level_collection": "participants",
        "subcollection_name": "trials_backup",
        "output_suffix": "backup" # Suffix for the output filename
    },
    {
        "id": "finished", # Identifier for this source
        "top_level_collection": "participants_finished",
        "subcollection_name": "final_trials",
        "output_suffix": "finished" # Suffix for the output filename
    }
]

# Choose output format: 'csv' or 'json'
OUTPUT_FORMAT = 'csv' # Recommend CSV for R

# --- Base Output Directory ---
script_dir = os.path.dirname(os.path.abspath(__file__))
output_dir = os.path.join(script_dir, 'data')
# --- End Configuration ---

# --- Reusable Export Function ---
def export_firestore_data(db, top_collection, sub_collection, output_path, format):
    """
    Fetches data from a specified subcollection structure and writes it to a file.
    Accepts an initialized Firestore db instance.
    """
    all_subcollection_data = []
    print(f"\n--- Starting export for: {top_collection}/{sub_collection} ---")
    print(f"Listing documents in '{top_collection}' collection...")

    try:
        # 1. Get references to all documents in the top collection explicitly
        parent_refs = db.collection(top_collection).list_documents()
        parent_ids_found = [ref.id for ref in parent_refs]

        print(f"Found parent document IDs: {parent_ids_found}")

        if not parent_ids_found:
            print(f"No documents found in the '{top_collection}' collection.")
            return # Nothing to export for this source

        parents_processed = 0
        for parent_id in parent_ids_found:
            parents_processed += 1
            print(f"  Processing parent document ID: {parent_id}")

            # 2. Get reference to the subcollection
            subcollection_ref = db.collection(top_collection).document(parent_id).collection(sub_collection)
            # 3. Stream documents from the subcollection
            sub_docs_stream = subcollection_ref.stream()

            doc_count_for_parent = 0
            for sub_doc in sub_docs_stream:
                try:
                    doc_data = sub_doc.to_dict()
                    if doc_data is None:
                        print(f"    Warning: Document {sub_doc.id} under {parent_id} has None data.")
                        continue

                    # Add parent ID (e.g., participantId) and the doc's own ID
                    if 'parent_document_id' not in doc_data: # Use a generic name
                         doc_data['parent_document_id'] = parent_id
                    doc_data['document_id'] = sub_doc.id # Use a generic name

                    all_subcollection_data.append(doc_data)
                    doc_count_for_parent += 1
                except Exception as doc_error:
                    print(f"    Error processing document {sub_doc.id} under {parent_id}: {doc_error}")

            print(f"    Found {doc_count_for_parent} documents in '{sub_collection}' subcollection.")

        print("-" * 20)
        print(f"Finished processing {top_collection}. Total parent documents processed: {parents_processed}")
        print(f"Retrieved a total of {len(all_subcollection_data)} documents from '{sub_collection}'.")
        print("-" * 20)

        if not all_subcollection_data:
            print(f"No data found in any '{sub_collection}' subcollections for '{top_collection}'.")
            return # Nothing to write

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
            for data in all_subcollection_data:
                if isinstance(data, dict):
                     headers.update(data.keys())
                else:
                     print(f"Warning: Encountered non-dictionary data item: {data}")

            # Ensure 'parent_document_id' and 'document_id' are first if they exist
            sorted_headers = []
            if 'parent_document_id' in headers:
                sorted_headers.append('parent_document_id')
                headers.remove('parent_document_id')
            if 'document_id' in headers:
                sorted_headers.append('document_id')
                headers.remove('document_id')
            sorted_headers.extend(sorted(list(headers))) # Add the rest alphabetically

            if not sorted_headers:
                 print("Error: No headers found, cannot write CSV.")
                 return

            with open(output_path, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=sorted_headers, extrasaction='ignore')
                writer.writeheader()
                dict_data_only = [d for d in all_subcollection_data if isinstance(d, dict)]
                writer.writerows(dict_data_only)

        elif format == 'json':
            with open(output_path, 'w', encoding='utf-8') as jsonfile:
                json.dump(all_subcollection_data, jsonfile, ensure_ascii=False, indent=4)
        else:
            print(f"Error: Invalid output format '{format}'. Choose 'csv' or 'json'.")
            return

        print(f"Successfully exported data to {output_path}")

    except Exception as e:
        print(f"An error occurred during export for {top_collection}/{sub_collection}: {e}")
        traceback.print_exc()

# --- Main Execution Block ---
if __name__ == "__main__":
    # --- Initialize Firebase ONCE ---
    final_key_path = SERVICE_ACCOUNT_KEY_PATH
    db_instance = None # Initialize db_instance to None
    if not os.path.exists(final_key_path):
        print(f"CRITICAL ERROR: Service account key file not found at {final_key_path}")
    else:
        try:
            print(f"Initializing Firebase using key: {final_key_path}")
            cred = credentials.Certificate(final_key_path)
            if not firebase_admin._apps:
                 firebase_admin.initialize_app(cred)
            else:
                 print("Firebase Admin SDK already initialized.")
            db_instance = firestore.client() # Get the db instance
            print(f"Successfully connected to Firestore.")
        except Exception as init_error:
            print(f"CRITICAL ERROR: Failed to initialize Firebase: {init_error}")
            traceback.print_exc()
    # --- End Initialization ---

    # --- Export each data source if initialization succeeded ---
    if db_instance: # Only proceed if db connection is valid
        timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")

        for source in DATA_SOURCES:
            # Construct the unique output filename for this source
            # output_file_name = f"{source['top_level_collection']}_{source['subcollection_name']}_{source['output_suffix']}_{timestamp_str}.{OUTPUT_FORMAT}"
            output_file_name = f"{source['top_level_collection']}_{source['subcollection_name']}_{source['output_suffix']}.{OUTPUT_FORMAT}"
            full_output_path = os.path.join(output_dir, output_file_name)

            # Call the export function for the current source
            export_firestore_data(
                db=db_instance, # Pass the initialized db instance
                top_collection=source['top_level_collection'],
                sub_collection=source['subcollection_name'],
                output_path=full_output_path,
                format=OUTPUT_FORMAT
            )
        print("\n--- All export tasks finished. ---")
    else:
        print("\n--- Export tasks skipped due to Firebase initialization failure. ---")

