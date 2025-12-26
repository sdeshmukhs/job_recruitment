
import frappe

@frappe.whitelist(allow_guest=True)
def get_designation_questions(job_opening):
    frappe.logger().info(f"Fetching questions for job opening: {job_opening}")
    if not job_opening:
        return []
        
    # Validating if Job Opening exists
    if not frappe.db.exists("Job Opening", job_opening):
        return []

    opening_designation = frappe.db.get_value("Job Opening", job_opening, "designation")
    if not opening_designation:
        return []

    # Fetching questions from Designation
    questions = frappe.get_all("Designation Questionnaire", 
                               filters={"parent": opening_designation}, 
                               fields=["question", "question_type", "mandatory"],
                               order_by="idx asc")
            
    return questions
