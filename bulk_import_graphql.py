import json
import requests
import os
import sys

# Configuration
API_KEY = "239b9ff4c3f68200e9df7d7f47f6f904"
BASE_URL = "http://35.246.89.127"
ENDPOINT = f"{BASE_URL}/pimcore-graphql-webservices/bsava?apikey={API_KEY}"

IMPORT_DIR = "data/import"
CLASSES = ["Book", "Ebook", "Event", "Course", "MembershipTier"]

def run_query(query, variables):
    response = requests.post(ENDPOINT, json={'query': query, 'variables': variables})
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Query failed with code {response.status_code}: {response.text}")

def import_class(class_name):
    json_path = os.path.join(IMPORT_DIR, f"{class_name}_import.json")
    if not os.path.exists(json_path):
        print(f"Skipping {class_name}: file not found")
        return

    with open(json_path, 'r') as f:
        items = json.load(f)

    print(f"Importing {len(items)} items for {class_name}...")

    # Define the mutation
    # Note: PIMcore dynamic naming is usually 'create<ClassName>'
    mutation_name = f"create{class_name}"
    input_type = f"DataObject{class_name}Input"
    
    # We'll use a generic mutation string and adjust placeholders if needed
    # However, for simplicity, we'll build the mutation string per item to ensure field matching
    
    success_count = 0
    fail_count = 0

    for item in items:
        # Prepare valid key (PIMcore requires a URL-safe key)
        key_source = item.get('title') or item.get('name') or "unnamed"
        # Simple key cleaning
        key = "".join([c if c.isalnum() else "-" for c in key_source.lower()]).strip("-")[:100]
        
        # Build the variables
        # Remove empty fields that might cause issues with types
        clean_item = {k: v for k, v in item.items() if v not in [None, ""]}
        
        # PIMcore GraphQL input structure usually requires 'key' and 'parentId' or similar
        # But Datahub mutations often have a wrapper or specific fields.
        # Based on PIMcore docs, it's often:
        # mutation { createBook(key: "...", parentId: 1, input: { ... }) { id } }
        
        # We'll assume the user has configured the root folder or we use a fixed one.
        # Let's find the root folder ID for BSAVA if possible, or just skip if it works without it.
        # Actually, let's try to pass 'parentId' if known. We know /BSAVA exists.
        
        # For now, let's just try the mutation based on what's likely enabled.
        # We'll use a safer approach: one item at a time.
        
        # Field mapping adjustments
        # Ensure prices are floats
        for price_field in ['memberPrice', 'nonMemberPrice', 'annualFee']:
            if price_field in clean_item:
                try:
                    clean_item[price_field] = float(clean_item[price_field])
                except:
                    clean_item[price_field] = 0.0

        # Create query
        # We need to know the parentId. Let's assume folder /BSAVA/<ClassName>s exists.
        # I'll use a trick: query the folder first.
        
        query = f"""
        mutation {{
          {mutation_name}(
            key: "{key}",
            parentId: 1,
            input: {{
              {", ".join([f'{k}: {json.dumps(v)}' for k, v in clean_item.items()])}
            }}
          ) {{
            success
            message
          }}
        }}
        """
        
        # Actually, the 'success' and 'message' fields are common in Datahub mutations.
        # Let's try this format.
        
        try:
            result = run_query(query, {})
            if result.get('errors'):
                print(f" Error for {key}: {result['errors'][0]['message']}")
                fail_count += 1
            else:
                success_count += 1
        except Exception as e:
            print(f" Request error for {key}: {str(e)}")
            fail_count += 1

    print(f"Finished {class_name}: {success_count} success, {fail_count} failed.")

if __name__ == "__main__":
    for cls in CLASSES:
        import_class(cls)
