
import frappe

def run():
    print("Starting cleanup...")
    
    # 1. Clear script in Web Form itself (The main issue)
    try:
        if frappe.db.exists('Web Form', 'job-application'):
            wf = frappe.get_doc('Web Form', 'job-application')
            # Check if it has content
            if wf.client_script:
                print(f"Found client_script (len={len(wf.client_script)}). Clearing it.")
                wf.client_script = ""
                wf.save(ignore_permissions=True)
            else:
                print("Web Form client_script is already empty.")
        else:
            print("Web Form 'job-application' not found!")
    except Exception as e:
        print(f"Error updating Web Form: {e}")

    # 2. Check for Client Script DocType (The other place scripts live)
    try:
        # Check if there is a 'Client Script' doc for this generic form
        scripts = frappe.get_all('Client Script', filters={'dt': 'Web Form', 'view': 'Form'}, fields=['name', 'module'])
        for s in scripts:
            print(f"Note: Found generic Client Script for Web Form: {s.name} (Module: {s.module})")
            # We don't delete these blindly as they might be for other forms
    except Exception as e:
        print(f"Error checking Client Scripts: {e}")

    frappe.db.commit()
    print("Database Cleanup Complete")

if __name__ == "__main__":
    run()
