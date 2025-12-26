
import frappe
from frappe.custom.doctype.custom_field.custom_field import create_custom_fields

def run():
    custom_fields = {
        "Designation": [
            {
                "fieldname": "questionnaire",
                "label": "Questionnaire",
                "fieldtype": "Table",
                "options": "Designation Questionnaire",
                "insert_after": "description" 
            }
        ],
        "Job Applicant": [
            {
                "fieldname": "responses",
                "label": "Responses",
                "fieldtype": "Table",
                "options": "Job Applicant Response",
                "insert_after": "cover_letter", 
                "read_only": 1
            },
            {
                "fieldname": "screening_responses_json",
                "label": "Screening Responses JSON",
                "fieldtype": "Long Text",
                "hidden": 1,
                "insert_after": "responses"
            }
        ]
    }
    
    create_custom_fields(custom_fields, ignore_validate=True)
    frappe.db.commit()
    print("Custom Fields Created Successfully")

if __name__ == "__main__":
    run()
