
import frappe

def run():
    openings = frappe.get_all('Job Opening', fields=['name', 'designation', 'status'], filters={'status': 'Open'})
    if not openings:
        print("No Open Job Openings found.")
        return
        
    for o in openings:
        questions = frappe.get_all('Designation Questionnaire', filters={'parent': o.designation}, fields=['question'])
        print(f'Opening: {o.name} | Designation: {o.designation} | Questions found: {len(questions)}')
        for q in questions:
            print(f'  - {q.question}')

if __name__ == "__main__":
    run()
