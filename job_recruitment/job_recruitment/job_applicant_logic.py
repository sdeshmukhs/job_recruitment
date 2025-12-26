
import frappe
import json

def before_insert(doc, method):
    if doc.screening_responses_json:
        try:
            responses = json.loads(doc.screening_responses_json)
            for resp in responses:
                # resp struct: {question, type, answer}
                row = {
                    "question": resp.get("question")
                }
                
                val = resp.get("answer")
                
                if resp.get("type") == "Attachment":
                     row["attachment"] = val
                else:
                     row["answer"] = val
                
                doc.append("responses", row)
                
            # Clear the JSON field after processing to keep it clean (optional, but good)
            doc.screening_responses_json = ""
            
        except Exception as e:
            frappe.log_error(f"Error processing screening questions for {doc.name}: {str(e)}", "Job Applicant Screening")
