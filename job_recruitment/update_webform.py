
import frappe

def run():
    js_code = """
frappe.web_form.on('load', () => {
    let current_questions = [];

    frappe.web_form.on('job_title', (field, value) => {
        if (value) {
            fetch_questions(value);
        } else {
            $('.custom-screening-section').remove();
        }
    });

    // Initial load check with retries
    let attempts = 0;
    const interval = setInterval(() => {
        let initial_val = frappe.web_form.get_value('job_title');
        if (initial_val) {
            fetch_questions(initial_val);
            clearInterval(interval);
        }
        if (attempts++ > 10) clearInterval(interval);
    }, 500);

    function fetch_questions(job_opening) {
        frappe.call({
            method: "job_recruitment.job_recruitment.api.get_designation_questions",
            args: { job_opening: job_opening },
            callback: function(r) {
                render_questions(r.message || []);
            }
        });
    }

    function render_questions(questions) {
        current_questions = questions;
        $('.custom-screening-section').remove();
        if (!questions.length) return;

        const $section = $('<div class="custom-screening-section mt-4 mb-4" style="border-top: 1px solid #d1d8dd; padding-top: 20px;"></div>');
        $section.append('<h4 class="mb-4">Screening Questions</h4>');

        questions.forEach((q, idx) => {
            let input_html = q.question_type == 'Attachment' 
                ? `<input type="file" class="form-control screening-input" data-idx="${idx}">`
                : `<textarea class="form-control screening-input" rows="2" data-idx="${idx}"></textarea>`;

            $section.append(`
                <div class="form-group mb-4" style="margin-bottom: 2rem !important;">
                    <label class="control-label" style="font-weight: bold; margin-bottom: 0.5rem; display: block;">${q.question} ${q.mandatory ? '<span class="text-danger">*</span>' : ''}</label>
                    ${input_html}
                    <div class="help-block text-danger small screening-error" style="display:none; margin-top: 5px;">This field is required</div>
                </div>
            `);
        });

        // Robust insertion logic
        let $ref = $('[data-fieldname="resume_link"], [data-fieldname="cover_letter"]').last();
        if ($ref.length) {
            $section.insertAfter($ref.closest('.form-group'));
        } else {
            $('.form-body, .web-form-container').last().append($section);
        }
        
        console.log("Rendered " + questions.length + " screening questions");
    }

    const original_validate = frappe.web_form.validate;
    frappe.web_form.validate = () => {
        let valid = true;
        let responses = [];

        $('.screening-input').each(function() {
            const $el = $(this);
            const q = current_questions[$el.data('idx')];
            let val = $el.val();
            let has_val = q.question_type == 'Attachment' ? $el[0].files.length > 0 : !!val;

            if (q.mandatory && !has_val) {
                valid = false;
                $el.css('border-color', 'red').siblings('.screening-error').show();
            } else {
                $el.css('border-color', '').siblings('.screening-error').hide();
                let answer = val;
                if (q.question_type == 'Attachment' && has_val) {
                    answer = "File: " + $el[0].files[0].name;
                }
                responses.push({ question: q.question, type: q.question_type, answer: answer });
            }
        });

        if (!valid) {
            frappe.msgprint(__('Please answer all mandatory screening questions.'));
            return false;
        }

        frappe.web_form.set_value('screening_responses_json', JSON.stringify(responses));
        
        if (original_validate) {
            return original_validate();
        }
        return true;
    };
});
"""
    wf = frappe.get_doc('Web Form', 'job-application')
    wf.client_script = js_code
    
    if not any(f.fieldname == 'screening_responses_json' for f in wf.web_form_fields):
        wf.append('web_form_fields', {
            'fieldname': 'screening_responses_json',
            'label': 'Screening Responses JSON',
            'fieldtype': 'Text',
            'hidden': 1
        })
    
    wf.save()
    frappe.db.commit()
    print("Web Form Updated with improved selectors and retry logic")

if __name__ == "__main__":
    run()
