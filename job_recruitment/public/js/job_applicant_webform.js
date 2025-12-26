
// Logic for dynamic screening questions in Job Application Web Form
(function () {
    console.log("Job Recruitment: JS Initialized - Version 5.0 Force Visible");

    function render_questions(questions) {
        window.current_screening_questions = questions;
        $('.custom-screening-section').remove();

        if (!questions.length) {
            console.log("Job Recruitment: No questions");
            return;
        }

        console.log("Job Recruitment: Rendering " + questions.length + " questions");

        // Use a very obvious style to ensure visibility 
        // and using 'important' to override any hidden containers
        const $section = $(`<div class="custom-screening-section" style="
            display: block !important; 
            border: 2px solid #007bff; 
            background: #e9ecef;
            padding: 20px; 
            margin: 20px 0;
            border-radius: 8px;
            width: 100%;
            clear: both;
        "></div>`);

        $section.append('<h4 style="color: #007bff; margin-bottom: 20px;">Screening Questions (Required)</h4>');

        questions.forEach((q, idx) => {
            let input_html = q.question_type == 'Attachment'
                ? `<input type="file" class="form-control screening-input" data-idx="${idx}" style="display: block !important;">`
                : `<textarea class="form-control screening-input" rows="3" data-idx="${idx}" style="display: block !important;"></textarea>`;

            $section.append(`
                <div class="form-group mb-4" style="margin-bottom: 20px;">
                    <label style="font-weight: bold; display: block; margin-bottom: 5px;">${q.question} ${q.mandatory ? '<span style="color:red;">*</span>' : ''}</label>
                    ${input_html}
                </div>
            `);
        });

        // BRUTE FORCE INSERTION:
        // Try multiple locations
        let inserted = false;

        // 1. Frappe Web Form Standard Body
        if ($('.form-body').length) {
            $('.form-body').append($section);
            console.log("Inserted into .form-body");
            inserted = true;
        }

        // 2. Web Form Container (fallback)
        if (!inserted && $('.web-form-container').length) {
            $('.web-form-container').append($section);
            console.log("Inserted into .web-form-container");
            inserted = true;
        }

        // 3. Last Resort: After the last known field
        if (!inserted) {
            $('form').append($section);
            console.log("Inserted into form tag");
        }
    }

    frappe.ready(function () {
        console.log("Job Recruitment: frappe.ready");

        // Helper to get job title safely from URL or Field
        const get_job_title = () => {
            // Priority 1: URL Param (most reliable for direct links)
            const params = new URLSearchParams(window.location.search);
            const from_url = params.get('job_title');
            if (from_url) return from_url;

            // Priority 2: Field Value
            try {
                return frappe.web_form.get_value('job_title');
            } catch (e) { return null; }
        };

        const job_title = get_job_title();
        if (job_title) {
            console.log("Job Recruitment: Job Title Found ->", job_title);
            frappe.call({
                method: "job_recruitment.job_recruitment.api.get_designation_questions",
                args: { job_opening: job_title },
                callback: function (r) {
                    render_questions(r.message || []);
                }
            });
        } else {
            console.log("Job Recruitment: Job Title NOT found in URL or Field");
        }

        // --- SUBMISSION HANDLER ---
        frappe.web_form.validate = () => {
            let valid = true;
            let responses = [];
            let questions = window.current_screening_questions || [];

            $('.screening-input').each(function () {
                const $el = $(this);
                const q = questions[$el.data('idx')];
                if (!q) return;

                let val = $el.val();
                let has_val = q.question_type == 'Attachment' ? $el[0].files.length > 0 : !!val;

                if (q.mandatory && !has_val) {
                    valid = false;
                    $el.css('border', '2px solid red');
                } else {
                    $el.css('border', '');
                    let answer = val;
                    if (q.question_type == 'Attachment' && has_val) {
                        answer = "File: " + $el[0].files[0].name;
                    }
                    responses.push({ question: q.question, type: q.question_type, answer: answer });
                }
            });

            if (!valid) {
                frappe.msgprint("Please complete all mandatory screening questions.");
                return false;
            }

            // Save to JSON field
            if (responses.length) {
                frappe.web_form.doc.screening_responses_json = JSON.stringify(responses);
            }
            return true;
        };
    });
})();
