
import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def run():
    print("Creating Custom Fields...")
    custom_fields = {
        'Job Applicant': [
            {
                'fieldname': 'screening_responses_json',
                'label': 'Screening Responses JSON',
                'fieldtype': 'Text',
                'hidden': 1,
                'insert_after': 'source', # Insert after a standard field
                'owner': 'Administrator'
            }
        ]
    }
    
    # Check if field already exists to avoid error or duplicate logic
    if not frappe.db.exists('Custom Field', {'dt': 'Job Applicant', 'fieldname': 'screening_responses_json'}):
         create_custom_fields(custom_fields)
         print("Created 'screening_responses_json' as a Custom Field on 'Job Applicant'")
    else:
         print("Custom Field 'screening_responses_json' already exists.")

    frappe.db.commit()

if __name__ == "__main__":
    run()
