
import frappe

def run():
    frappe.db.set_value('Web Form', 'job-application', 'client_script', '')
    frappe.db.commit()
    print("Web Form client_script cleared from database.")

if __name__ == "__main__":
    run()
