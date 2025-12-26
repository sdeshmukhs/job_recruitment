
// Custom Employee UI Theme Logic (V12 - Fix Sidebar Targeting)
frappe.ui.form.on('Employee', {
    refresh: function (frm) {
        // CSS is now loaded via hooks, but require it just in case
        frappe.require("/assets/job_recruitment/css/employee_ui.css");
        setTimeout(() => setup_custom_employee_layout(frm), 100);
    }
});

function setup_custom_employee_layout(frm) {
    const $wrapper = $(frm.wrapper);
    let $pages = $wrapper.find('.form-page');

    if ($pages.length === 0) return;

    // 1. JS REMOVAL of Standard Sidebar
    // The sidebar is a Sibling of the Main Section
    const $main_section = $wrapper.closest('.layout-main-section');
    const $sidebar = $main_section.siblings('.layout-side-section');

    // Hide/Remove standard sidebar
    if ($sidebar.length) {
        $sidebar.hide();
        $sidebar.css('display', 'none !important');
        console.log("Standard Sidebar hidden via JS");
    }

    // Also hide internal form sidebar if present (sometimes inside form)
    $wrapper.find('.form-sidebar').hide();

    // Hide standard tabs
    $wrapper.find('.form-tabs-list').hide();
    $wrapper.closest('.page-body').find('.form-tabs-list').hide(); // sometimes higher up

    // Force Main Section Full Width
    $main_section.css({
        'width': '100%',
        'flex': '0 0 100%',
        'max-width': '100%',
        'padding-right': '15px' // Standard bootstrap padding
    });

    // 2. Setup Container for Custom Sidebar
    const $container = $pages.first().parent();

    // Ensure Flex Layout
    $container.css({
        'display': 'flex',
        'flex-direction': 'row',
        'gap': '0',
        'align-items': 'flex-start'
    });
    $container.addClass('employee-flex-container');

    // Remove existing custom sidebar if re-running
    $container.find('.employee-custom-sidebar').remove();

    render_unified_sidebar($container, frm);

    // 3. Adjust Form Pages
    // They act as the "Content" column
    const $all_pages = $container.find('.form-page');
    $all_pages.css({
        'flex-grow': '1',
        'width': 'auto', // Let flex handle width
        'display': 'none',
        'border': 'none', // Remove default borders if any
        'box-shadow': 'none' // We'll apply shadow to a wrapper or rely on custom css
    });

    // Show the first one (or active one)
    $all_pages.first().show().css('display', 'block');
}

function render_unified_sidebar($container, frm) {
    // 1. Get Profile Data
    const name = frm.doc.employee_name || frm.doc.first_name || "New Employee";
    const image = frm.doc.image || frappe.utils.get_initials(name);
    const designation = frm.doc.designation || "";
    const status = frm.doc.status || "Active";

    const is_image_path = image && image.indexOf('/') !== -1;
    const img_html = is_image_path
        ? `<img src="${image}" class="profile-img">`
        : `<div class="profile-placeholder">${image}</div>`;

    // 2. Navigation Items
    const nav_items = [
        { label: 'Overview', fieldname: 'naming_series' },
        { label: 'Joining', fieldname: 'scheduled_confirmation_date' },
        { label: 'Address & Contacts', fieldname: 'cell_number' },
        { label: 'Attendance & Leaves', fieldname: 'attendance_device_id' },
        { label: 'Salary', fieldname: 'salary_mode' },
        { label: 'Personal Details', fieldname: 'marital_status' },
        { label: 'Profile', fieldname: 'bio' },
        { label: 'Employee Exit', fieldname: 'resignation_letter_date' },
        { label: 'Connections', fieldname: 'connections_tab' }
    ];

    // 3. HTML Structure
    let sidebar_html = `
    <div class="employee-custom-sidebar unified-sidebar">
        <div class="sidebar-profile-section">
            <div class="profile-image-wrapper">${img_html}</div>
            <h3 class="profile-name">${name}</h3>
            ${designation ? `<p class="profile-designation">${designation}</p>` : ''}
            <span class="profile-status status-${status.toLowerCase()}">${status}</span>
        </div>
        <div class="employee-sidebar-menu">`;

    nav_items.forEach((item, index) => {
        sidebar_html += `
            <div class="employee-sidebar-item ${index === 0 ? 'active' : ''}" data-idx="${index}" data-fieldname="${item.fieldname}">
                <span class="sidebar-label">${item.label}</span>
            </div>`;
    });

    sidebar_html += `</div></div>`;

    $container.prepend(sidebar_html);

    // 4. Interaction Logic
    $container.find('.employee-sidebar-item').on('click', function () {
        $container.find('.employee-sidebar-item').removeClass('active');
        $(this).addClass('active');

        const fieldname = $(this).data('fieldname');
        const idx = $(this).data('idx');

        // Scroll to Field (Native)
        try { if (frm.fields_dict[fieldname]) frm.scroll_to_field(fieldname); } catch (e) { }

        // Visibility Toggle
        const $pages = $container.find('.form-page');
        $pages.hide();

        // Find wrapper of the field
        const $field_wrapper = frm.fields_dict[fieldname] ? $(frm.fields_dict[fieldname].wrapper) : null;
        if ($field_wrapper && $field_wrapper.closest('.form-page').length) {
            $field_wrapper.closest('.form-page').show().css('display', 'block');
        } else {
            // Fallback to index
            $pages.eq(idx).show().css('display', 'block');
        }
        window.scrollTo(0, 0);
    });
}
