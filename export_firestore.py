import firebase_admin
from firebase_admin import credentials, db
import csv, os, traceback

# --- Configuration ---
SERVICE_ACCOUNT_KEY_PATH = '/home/lea/Insync/naszhu@gmail.com/Google Drive/shulai@iu.edu 2022-09-04 14:28/IUB/ctx-e3-0c2d428f6ca9.json'

DATA_SOURCES = [
    {
        "path": "participants",
        "array_key": "trials",
        "output": "participants_trials.csv"
    },
    {
        "path": "participants_finished",
        "array_key": "all_trials",
        "output": "participants_finished_trials.csv"
    }
]
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), 'data')

# Init RTDB
cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com'
})
root = db.reference()

def export_array(src):
    node = root.child(src["path"]).get()
    if not isinstance(node, dict):
        print(f"No data at {src['path']}")
        return

    records = []
    for pid, pdata in node.items():
        arr = pdata.get(src["array_key"], {}).get("trials", []) if src["path"] == "participants" else pdata.get(src["array_key"], [])
        # for participants, .get("trials", []), for finished .get("all_trials", []) directly
        # unify: if dict with key "trials", use it, else if list, use it
        if isinstance(arr, dict):
            arr = arr.get("trials", [])
        if not isinstance(arr, list):
            continue

        for idx, entry in enumerate(arr):
            if not isinstance(entry, dict):
                continue
            rec = dict(entry)
            rec['parent_document_id'] = pid
            rec['document_id']        = str(idx)
            records.append(rec)

        # include summary/final if it exists
        summary = pdata.get('summary', {}).get('final', {})
        if isinstance(summary, dict) and summary:
            rec = dict(summary)
            rec['parent_document_id'] = pid
            rec['document_id']        = 'final'
            records.append(rec)

    if not records:
        print(f"No records for {src['path']}")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    outpath = os.path.join(OUTPUT_DIR, src["output"])

    # Build headers
    headers = set().union(*(r.keys() for r in records))
    ordered = []
    for k in ('parent_document_id','document_id'):
        if k in headers:
            ordered.append(k)
            headers.remove(k)
    ordered.extend(sorted(headers))

    # Write CSV
    with open(outpath, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=ordered, extrasaction='ignore')
        writer.writeheader()
        writer.writerows(records)

    print(f"Exported {len(records)} rows to {outpath}")

if __name__ == "__main__":
    for src in DATA_SOURCES:
        export_array(src)
    print("All exports complete.")
