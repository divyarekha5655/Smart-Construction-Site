// ==========================================================
// SMART CONSTRUCTION SITE
// CONSTRUCTION SITE PROGRESS & SAFETY MANAGEMENT SYSTEM
// ==========================================================


// ==========================================================
// SUPABASE CONNECTION
// ==========================================================

const SUPABASE_URL =
    "https://jfkerdxnccomdyyziitz.supabase.co";

// Keep your existing publishable/anon key here.
// NEVER use a service-role/secret key in browser code.

const SUPABASE_KEY =
    "sb_publishable_Aq5Gjot6Mht1MUjYwNjfzg_pvvDq1eI";

const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================================
// GLOBAL SITE DATA
// ==========================================================

const siteData = {
    project: null,
    progress: [],
    activities: [],
    safetyIssues: [],
    workers: [],
    equipment: [],
    maintenance: [],
    dashboard: {},
    safetyDashboard: {}
};


// ==========================================================
// GENERAL HELPERS
// ==========================================================

function safeText(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// Compatibility helper.
// This prevents errors if any older HTML code uses safe().
function safe(value) {
    return safeText(value);
}


function setText(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent =
            value ?? "";
    }
}


function clampProgress(value) {
    return Math.min(
        Math.max(
            Number(value) || 0,
            0
        ),
        100
    );
}


// ==========================================================
// SECTION NAVIGATION
// ==========================================================

function scrollToSection(target) {

    if (!target) {
        return false;
    }

    const sectionId =
        String(target)
            .replace(/^#/, "")
            .trim();

    const element =
        document.getElementById(sectionId);

    if (!element) {
        console.warn(
            "Section not found:",
            sectionId
        );

        return false;
    }

    element.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    document
        .querySelectorAll("section")
        .forEach(section => {
            section.classList.remove(
                "active-section"
            );
        });

    element.classList.add(
        "active-section"
    );

    return true;
}

window.scrollToSection =
    scrollToSection;


// ==========================================================
// CHECK SITE STATUS
// ==========================================================

function showMessage() {

    const messageElement =
        document.getElementById("message");

    if (!messageElement) {

        console.warn(
            "Check Site Status: #message element not found."
        );

        return;
    }


    const dashboard =
        siteData.dashboard || {};

    const safety =
        siteData.safetyDashboard || {};


    const overallProgress =
        Number(
            dashboard.overallProgress
        ) || 0;


    const openSafety =
        Number(
            safety.openIssues
        ) || 0;


    const highSafety =
        Number(
            safety.highSeverityIssues
        ) || 0;


    const totalWorkers =
        Number(
            dashboard.totalWorkers
        ) || 0;


    const totalEquipment =
        Number(
            dashboard.totalEquipment
        ) || 0;


    // Count maintenance items due today
    // or already overdue.
    const maintenanceDue =
        (siteData.maintenance || [])
            .filter(item => {

                if (
                    !item.next_maintenance_date
                ) {
                    return false;
                }

                const maintenanceDate =
                    new Date(
                        item.next_maintenance_date +
                        "T00:00:00"
                    );

                const today =
                    new Date();

                today.setHours(
                    0,
                    0,
                    0,
                    0
                );

                return (
                    maintenanceDate <= today
                );
            })
            .length;


    let statusTitle;
    let statusText;


    // HIGH SAFETY ISSUE
    if (highSafety > 0) {

        statusTitle =
            "SITE STATUS: ATTENTION REQUIRED";

        statusText =
            `There ${
                highSafety === 1
                    ? "is"
                    : "are"
            } ${highSafety} high-severity safety issue${
                highSafety === 1
                    ? ""
                    : "s"
            } currently recorded on the site. ${
                openSafety
            } safety issue${
                openSafety === 1
                    ? ""
                    : "s"
            } remain open. Immediate safety review is recommended.`;
    }


    // OPEN SAFETY OR MAINTENANCE
    else if (
        openSafety > 0 ||
        maintenanceDue > 0
    ) {

        statusTitle =
            "SITE STATUS: MONITOR";

        statusText =
            `The project is currently ${overallProgress}% complete. ${
                openSafety === 1
                    ? "There is"
                    : `There are ${openSafety}`
            } ${
                openSafety === 1
                    ? "1 open safety issue."
                    : "open safety issues."
            } ${
                maintenanceDue
            } equipment item${
                maintenanceDue === 1
                    ? " is"
                    : "s are"
            } due for maintenance. The site should continue to be monitored.`;
    }


    // NORMAL
    else {

        statusTitle =
            "SITE STATUS: OPERATIONAL";

        statusText =
            `The project is currently ${overallProgress}% complete. No open safety issues or overdue maintenance items were detected. The site is operating normally.`;
    }


    messageElement.innerHTML = `

        <div class="site-status-result">

            <strong>
                ${safeText(statusTitle)}
            </strong>

            <p>
                ${safeText(statusText)}
            </p>

            <div class="site-status-details">

                <span>
                    Progress: ${overallProgress}%
                </span>

                <span>
                    Workers: ${totalWorkers}
                </span>

                <span>
                    Equipment: ${totalEquipment}
                </span>

                <span>
                    Open Safety Issues: ${openSafety}
                </span>

            </div>

        </div>

    `;


    messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });
}

window.showMessage =
    showMessage;


// ==========================================================
// PROJECT
// ==========================================================

async function loadProject() {

    const {
        data,
        error
    } = await supabaseClient
        .from("projects")
        .select("*")
        .order(
            "created_at",
            {
                ascending: false
            }
        )
        .limit(1)
        .single();


    if (error) {

        console.error(
            "Error loading project:",
            error
        );

        return;
    }


    siteData.project =
        data;


    setText(
        "projectName",
        data.project_name
    );


    setText(
        "projectLocation",
        data.location
    );


    setText(
        "projectStatus",
        data.status || "Active"
    );


    console.log(
        "Project loaded successfully:",
        data
    );
}


// ==========================================================
// CONSTRUCTION PROGRESS
// ==========================================================

async function loadProgress() {

    const {
        data,
        error
    } = await supabaseClient
        .from("activities")
        .select(`
            id,
            activity_name,
            progress,
            status,
            activity_date,
            location,
            workers_count,
            remarks
        `)
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading progress:",
            error
        );

        return;
    }


    siteData.progress =
        data || [];


    const progressList =
        document.getElementById(
            "progressList"
        );


    if (!progressList) {

        console.warn(
            "progressList not found"
        );

        return;
    }


    progressList.innerHTML = "";


    if (
        !data ||
        data.length === 0
    ) {

        progressList.innerHTML = `
            <div class="empty-state">
                No construction progress records available.
            </div>
        `;

        return;
    }


    data.forEach(activity => {

        const progress =
            clampProgress(
                activity.progress
            );


        const item =
            document.createElement(
                "div"
            );


        item.className =
            "progress-summary-card";


        item.innerHTML = `

            <div class="progress-summary-main">

                <div>

                    <span class="progress-label">
                        CONSTRUCTION ACTIVITY
                    </span>

                    <h3>
                        ${safeText(
                            activity.activity_name
                        )}
                    </h3>

                    <span class="progress-status">
                        ${safeText(
                            activity.status ||
                            "Not Updated"
                        )}
                    </span>

                </div>


                <div class="progress-summary-right">

                    <strong>
                        ${progress}%
                    </strong>

                    <button
                        type="button"
                        class="view-details-btn"
                    >
                        View Details
                    </button>

                </div>

            </div>

        `;


        const detailsButton =
            item.querySelector(
                ".view-details-btn"
            );


        detailsButton.addEventListener(
            "click",
            function(event) {

                event.stopPropagation();

                showProgressDetails(
                    activity
                );

            }
        );


        progressList.appendChild(
            item
        );

    });


    console.log(
        "Construction progress loaded successfully:",
        data
    );
}


// ==========================================================
// PROGRESS DETAILS
// ==========================================================

function showProgressDetails(
    activity
) {

    const progress =
        clampProgress(
            activity.progress
        );


    const oldModal =
        document.getElementById(
            "progressDetailsModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "progressDetailsModal";

    modal.className =
        "details-modal-overlay";


    modal.innerHTML = `

        <div class="details-modal">

            <button
                type="button"
                class="details-modal-close"
                aria-label="Close"
            >
                ×
            </button>


            <div class="details-modal-header">

                <span>
                    CONSTRUCTION ACTIVITY
                </span>

                <h2>
                    ${safeText(
                        activity.activity_name
                    )}
                </h2>

            </div>


            <div class="details-modal-grid">

                <div class="detail-item">
                    <small>PROGRESS</small>
                    <strong>
                        ${progress}%
                    </strong>
                </div>


                <div class="detail-item">
                    <small>STATUS</small>
                    <strong>
                        ${safeText(
                            activity.status ||
                            "Not Updated"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <small>DATE</small>
                    <strong>
                        ${safeText(
                            activity.activity_date ||
                            "Not available"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <small>LOCATION</small>
                    <strong>
                        ${safeText(
                            activity.location ||
                            "Not available"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <small>WORKERS</small>
                    <strong>
                        ${activity.workers_count ?? 0}
                    </strong>
                </div>

            </div>


            <div class="detail-progress-section">

                <div class="detail-progress-label">

                    <span>
                        Construction Progress
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>


                <div class="detail-progress-bar">

                    <div
                        style="width:${progress}%"
                    ></div>

                </div>

            </div>


            <div class="detail-remarks">

                <small>
                    REMARKS
                </small>

                <p>
                    ${safeText(
                        activity.remarks ||
                        "No remarks provided."
                    )}
                </p>

            </div>


            <button
                type="button"
                class="detail-ai-btn"
            >
                Ask AI Copilot About This Activity
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        modal.querySelector(
            ".details-modal-close"
        );


    closeButton.addEventListener(
        "click",
        function() {
            modal.remove();
        }
    );


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {
                modal.remove();
            }

        }
    );


    const aiButton =
        modal.querySelector(
            ".detail-ai-btn"
        );


    aiButton.addEventListener(
        "click",
        function() {

            modal.remove();

            openCopilot();


            setTimeout(
                function() {

                    askCopilot(
                        `Tell me about the construction activity "${activity.activity_name}". Current progress is ${progress}%. Status is "${activity.status || "not specified"}". Location is "${activity.location || "not specified"}". Workers assigned: ${activity.workers_count ?? 0}. Remarks: "${activity.remarks || "none"}".`
                    );

                },
                300
            );

        }
    );
}


// ==========================================================
// DAILY ACTIVITIES
// ==========================================================

async function loadDailyActivities() {

    const {
        data,
        error
    } = await supabaseClient
        .from("activities")
        .select(`
            id,
            activity_name,
            progress,
            status,
            activity_date,
            location,
            workers_count,
            remarks
        `)
        .order(
            "activity_date",
            {
                ascending: false
            }
        )
        .order(
            "id",
            {
                ascending: false
            }
        )
        .limit(3);


    if (error) {

        console.error(
            "Error loading daily activities:",
            error
        );

        return;
    }


    siteData.activities =
        data || [];


    const activitiesList =
        document.getElementById(
            "activitiesList"
        );


    if (!activitiesList) {

        console.warn(
            "activitiesList not found"
        );

        return;
    }


    activitiesList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        activitiesList.innerHTML = `
            <div class="empty-state">
                No daily activities available.
            </div>
        `;

        return;
    }


    data.forEach(activity => {

        const progress =
            clampProgress(
                activity.progress
            );


        const item =
            document.createElement(
                "div"
            );


        let statusClass =
            "activity-status";


        if (
            activity.status ===
            "Completed"
        ) {

            statusClass +=
                " completed";

        } else if (
            activity.status ===
            "In Progress"
        ) {

            statusClass +=
                " in-progress";
        }


        item.innerHTML = `

            <div class="daily-activity-card">

                <div class="daily-activity-header">

                    <div class="daily-activity-icon">
                        Construction
                    </div>


                    <div class="daily-activity-title">

                        <h3>
                            ${safeText(
                                activity.activity_name
                            )}
                        </h3>

                        <span class="${statusClass}">
                            ${safeText(
                                activity.status ||
                                "Not Updated"
                            )}
                        </span>

                    </div>


                    <div class="daily-activity-progress">
                        ${progress}%
                    </div>

                </div>


                <div class="daily-activity-action">

                    <button
                        type="button"
                        class="view-details-btn activity-details-btn"
                    >
                        View Details
                    </button>

                </div>

            </div>

        `;


        const detailsButton =
            item.querySelector(
                ".activity-details-btn"
            );


        detailsButton.addEventListener(
            "click",
            function() {

                showActivityDetails(
                    activity
                );

            }
        );


        activitiesList.appendChild(
            item
        );

    });


    console.log(
        "Daily activities loaded successfully:",
        data
    );
}


// ==========================================================
// DAILY ACTIVITY DETAILS
// ==========================================================

function showActivityDetails(
    activity
) {

    const progress =
        clampProgress(
            activity.progress
        );


    const oldModal =
        document.getElementById(
            "activityDetailsModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "activityDetailsModal";

    modal.className =
        "details-modal-overlay";


    modal.innerHTML = `

        <div class="details-modal">

            <button
                type="button"
                class="details-modal-close"
                aria-label="Close"
            >
                ×
            </button>


            <div class="details-modal-header">

                <span>
                    DAILY ACTIVITY
                </span>

                <h2>
                    ${safeText(
                        activity.activity_name
                    )}
                </h2>

            </div>


            <div class="details-modal-grid">

                <div class="detail-item">
                    <small>PROGRESS</small>
                    <strong>
                        ${progress}%
                    </strong>
                </div>


                <div class="detail-item">
                    <small>STATUS</small>
                    <strong>
                        ${safeText(
                            activity.status ||
                            "Not Updated"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <small>DATE</small>
                    <strong>
                        ${safeText(
                            activity.activity_date ||
                            "Not available"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <small>LOCATION</small>
                    <strong>
                        ${safeText(
                            activity.location ||
                            "Not available"
                        )}
                    </strong>
                </div>


                <div class="detail-item">
                    <small>WORKERS</small>
                    <strong>
                        ${activity.workers_count ?? 0}
                    </strong>
                </div>

            </div>


            <div class="detail-progress-section">

                <div class="detail-progress-label">

                    <span>
                        Activity Progress
                    </span>

                    <strong>
                        ${progress}%
                    </strong>

                </div>


                <div class="detail-progress-bar">

                    <div
                        style="width:${progress}%"
                    ></div>

                </div>

            </div>


            <div class="detail-remarks">

                <small>
                    REMARKS
                </small>

                <p>
                    ${safeText(
                        activity.remarks ||
                        "No remarks provided."
                    )}
                </p>

            </div>


            <button
                type="button"
                class="detail-ai-btn"
            >
                Ask AI Copilot About This Activity
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        modal.querySelector(
            ".details-modal-close"
        );


    closeButton.addEventListener(
        "click",
        function() {
            modal.remove();
        }
    );


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {
                modal.remove();
            }

        }
    );


    const aiButton =
        modal.querySelector(
            ".detail-ai-btn"
        );


    aiButton.addEventListener(
        "click",
        function() {

            modal.remove();

            openCopilot();


            setTimeout(
                function() {

                    askCopilot(
                        `Tell me about the daily construction activity "${activity.activity_name}". Its current progress is ${progress}%. Its status is "${activity.status || "not specified"}". It is located at "${activity.location || "not specified"}". Workers assigned: ${activity.workers_count ?? 0}. Remarks: "${activity.remarks || "none"}".`
                    );

                },
                300
            );

        }
    );
}


// ==========================================================
// SAFETY ISSUES
// ==========================================================

async function loadSafetyIssues() {

    console.log(
        "Loading safety issues..."
    );


    const safetyList =
        document.getElementById(
            "safetyList"
        );


    if (!safetyList) {

        console.error(
            "ERROR: safetyList was not found in HTML."
        );

        return;
    }


    safetyList.innerHTML = `
        <p class="loading-text">
            Loading safety issues...
        </p>
    `;


    const {
        data,
        error
    } = await supabaseClient
        .from("safety_issues")
        .select(`
            id,
            issue,
            location,
            severity,
            status,
            reported_by,
            reported_date,
            remarks
        `)
        .order(
            "reported_date",
            {
                ascending: false
            }
        )
        .order(
            "id",
            {
                ascending: false
            }
        );


    if (error) {

        console.error(
            "Error loading safety issues:",
            error
        );


        safetyList.innerHTML = `
            <div class="empty-state">
                Unable to load safety issues.
                <br>
                Please check the browser console.
            </div>
        `;

        return;
    }


    console.log(
        "Safety issues loaded:",
        data
    );


    siteData.safetyIssues =
        data || [];


    if (
        !data ||
        data.length === 0
    ) {

        safetyList.innerHTML = `
            <div class="empty-state">
                No safety issues recorded.
            </div>
        `;

        return;
    }


    safetyList.innerHTML =
        "";


    data.forEach(issue => {

        const item =
            document.createElement(
                "div"
            );


        let severityClass =
            "safety-severity";


        if (
            issue.severity ===
            "High"
        ) {

            severityClass +=
                " high";

        } else if (
            issue.severity ===
            "Medium"
        ) {

            severityClass +=
                " medium";

        } else if (
            issue.severity ===
            "Low"
        ) {

            severityClass +=
                " low";
        }


        let statusClass =
            "safety-status-badge";


        if (
            issue.status ===
            "Open"
        ) {

            statusClass +=
                " open";

        } else if (
            issue.status ===
            "Resolved"
        ) {

            statusClass +=
                " resolved";
        }


        item.innerHTML = `

            <div class="safety-alert-card">

                <div class="safety-alert-header">

                    <div class="safety-alert-icon">
                        SAFETY
                    </div>


                    <div class="safety-alert-title">

                        <h3>
                            ${safeText(
                                issue.issue
                            )}
                        </h3>


                        <div class="safety-badges">

                            <span
                                class="${severityClass}"
                            >
                                ${safeText(
                                    issue.severity
                                )}
                            </span>


                            <span
                                class="${statusClass}"
                            >
                                ${safeText(
                                    issue.status
                                )}
                            </span>

                        </div>

                    </div>

                </div>


                <div class="safety-summary">

                    <span>
                        ${safeText(
                            issue.severity
                        )} Severity
                    </span>

                    <span>
                        ${safeText(
                            issue.status
                        )}
                    </span>

                </div>


                <button
                    type="button"
                    class="view-details-btn safety-details-btn"
                >
                    View Details
                </button>

            </div>

        `;


        const detailsButton =
            item.querySelector(
                ".safety-details-btn"
            );


        detailsButton.addEventListener(
            "click",
            function() {

                showSafetyDetails(
                    issue
                );

            }
        );


        safetyList.appendChild(
            item
        );

    });


    console.log(
        "Safety issue cards displayed successfully."
    );
}


// ==========================================================
// SAFETY ISSUE DETAILS
// ==========================================================

function showSafetyDetails(
    issue
) {

    const oldModal =
        document.getElementById(
            "safetyDetailsModal"
        );


    if (oldModal) {
        oldModal.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "safetyDetailsModal";

    modal.className =
        "details-modal-overlay";


    modal.innerHTML = `

        <div class="details-modal">

            <button
                type="button"
                class="details-modal-close"
                aria-label="Close"
            >
                ×
            </button>


            <div class="details-modal-header">

                <span>
                    SAFETY ISSUE
                </span>

                <h2>
                    ${safeText(
                        issue.issue
                    )}
                </h2>

            </div>


            <div class="details-modal-grid">

                <div class="detail-item">

                    <small>
                        SEVERITY
                    </small>

                    <strong>
                        ${safeText(
                            issue.severity ||
                            "Not available"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        STATUS
                    </small>

                    <strong>
                        ${safeText(
                            issue.status ||
                            "Not available"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        LOCATION
                    </small>

                    <strong>
                        ${safeText(
                            issue.location ||
                            "Not available"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        REPORTED BY
                    </small>

                    <strong>
                        ${safeText(
                            issue.reported_by ||
                            "Not available"
                        )}
                    </strong>

                </div>


                <div class="detail-item">

                    <small>
                        DATE
                    </small>

                    <strong>
                        ${safeText(
                            issue.reported_date ||
                            "Not available"
                        )}
                    </strong>

                </div>

            </div>


            <div class="detail-remarks">

                <small>
                    REMARKS
                </small>

                <p>
                    ${safeText(
                        issue.remarks ||
                        "No remarks provided."
                    )}
                </p>

            </div>


            <button
                type="button"
                class="detail-ai-btn"
            >
                Ask AI Copilot About This Safety Issue
            </button>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const closeButton =
        modal.querySelector(
            ".details-modal-close"
        );


    closeButton.addEventListener(
        "click",
        function() {
            modal.remove();
        }
    );


    modal.addEventListener(
        "click",
        function(event) {

            if (
                event.target === modal
            ) {
                modal.remove();
            }

        }
    );


    const aiButton =
        modal.querySelector(
            ".detail-ai-btn"
        );


    aiButton.addEventListener(
        "click",
        function() {

            modal.remove();

            openCopilot();


            setTimeout(
                function() {

                    askCopilot(
                        `Explain this construction site safety issue: "${issue.issue}". Severity: "${issue.severity || "not specified"}". Status: "${issue.status || "not specified"}". Location: "${issue.location || "not specified"}". Reported by: "${issue.reported_by || "not specified"}". Remarks: "${issue.remarks || "none"}". Give practical safety guidance.`
                    );

                },
                300
            );

        }
    );
}


// ==========================================================
// WORKERS
// ==========================================================

async function loadWorkers() {

    const {
        data,
        error
    } = await supabaseClient
        .from("workers")
        .select("*")
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading workers:",
            error
        );

        return;
    }


    siteData.workers =
        data || [];


    const workersList =
        document.getElementById(
            "workersList"
        );


    if (!workersList) {

        console.warn(
            "workersList not found"
        );

        return;
    }


    workersList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        workersList.innerHTML = `
            <div class="empty-state">
                No workers available.
            </div>
        `;

        return;
    }


    data.forEach(worker => {

        const workerName =
            worker.name ||
            worker.worker_name ||
            "Unknown Worker";


        const workerRole =
            worker.role ||
            "Not specified";


        const department =
            worker.department ||
            "General";


        const status =
            worker.status ||
            "Unknown";


        const item =
            document.createElement(
                "div"
            );


        item.innerHTML = `

            <div class="worker-card">

                <div class="worker-icon">
                    Workforce
                </div>


                <div class="worker-info">

                    <h3>
                        ${safeText(
                            workerName
                        )}
                    </h3>

                    <p>
                        ${safeText(
                            workerRole
                        )}
                    </p>

                    <span>
                        ${safeText(
                            department
                        )}
                    </span>

                </div>


                <div class="worker-status">
                    ${safeText(
                        status
                    )}
                </div>

            </div>

        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            function() {

                openCopilot();


                setTimeout(
                    function() {

                        askCopilot(
                            `Tell me about the worker "${workerName}", whose role is "${workerRole}" in the "${department}" department, and explain their role in construction site operations.`
                        );

                    },
                    300
                );

            }
        );


        workersList.appendChild(
            item
        );

    });


    console.log(
        "Workers loaded successfully:",
        data
    );
}


// ==========================================================
// EQUIPMENT
// ==========================================================

async function loadEquipment() {

    const {
        data,
        error
    } = await supabaseClient
        .from("equipment")
        .select(`
            id,
            equipment_name,
            equipment_type,
            status,
            location,
            last_maintenance_date,
            next_maintenance_date,
            remarks
        `)
        .order(
            "id",
            {
                ascending: true
            }
        );


    if (error) {

        console.error(
            "Error loading equipment:",
            error
        );

        return;
    }


    siteData.equipment =
        data || [];


    const equipmentList =
        document.getElementById(
            "equipmentList"
        );


    if (!equipmentList) {

        console.warn(
            "equipmentList not found"
        );

        return;
    }


    equipmentList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        equipmentList.innerHTML = `
            <div class="empty-state">
                No equipment records available.
            </div>
        `;

        return;
    }


    data.forEach(equipment => {

        const item =
            document.createElement(
                "div"
            );


        item.innerHTML = `

            <div class="equipment-card">

                <div class="equipment-icon">
                    Equipment
                </div>


                <div class="equipment-info">

                    <h3>
                        ${safeText(
                            equipment.equipment_name
                        )}
                    </h3>

                    <p>
                        ${safeText(
                            equipment.equipment_type
                        )}
                    </p>

                    <p>
                        Location:
                        ${safeText(
                            equipment.location ||
                            "Main Site"
                        )}
                    </p>

                </div>


                <div class="equipment-status">
                    ${safeText(
                        equipment.status
                    )}
                </div>

            </div>

        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            function() {

                openCopilot();


                setTimeout(
                    function() {

                        askCopilot(
                            `Give me the current operational and maintenance information for ${equipment.equipment_name}. Its type is ${equipment.equipment_type}, its status is ${equipment.status}, its location is ${equipment.location || "the main site"}, and its next maintenance date is ${equipment.next_maintenance_date || "not specified"}.`
                        );

                    },
                    300
                );

            }
        );


        equipmentList.appendChild(
            item
        );

    });


    console.log(
        "Equipment loaded successfully:",
        data
    );
}


// ==========================================================
// MAINTENANCE
// ==========================================================

async function loadMaintenanceAlerts() {

    const {
        data,
        error
    } = await supabaseClient
        .from("equipment")
        .select(`
            equipment_name,
            next_maintenance_date
        `);


    if (error) {

        console.error(
            "Error loading maintenance alerts:",
            error
        );

        return;
    }


    siteData.maintenance =
        data || [];


    const maintenanceList =
        document.getElementById(
            "maintenanceList"
        );


    if (!maintenanceList) {

        console.warn(
            "maintenanceList not found"
        );

        return;
    }


    maintenanceList.innerHTML =
        "";


    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );


    data.forEach(equipment => {

        if (
            !equipment.next_maintenance_date
        ) {
            return;
        }


        const maintenanceDate =
            new Date(
                equipment.next_maintenance_date +
                "T00:00:00"
            );


        const difference =
            Math.ceil(
                (
                    maintenanceDate -
                    today
                ) /
                (
                    1000 *
                    60 *
                    60 *
                    24
                )
            );


        let message;
        let statusClass;


        if (difference < 0) {

            message =
                "Maintenance Due";

            statusClass =
                "maintenance-due";

        }


        else if (
            difference <= 7
        ) {

            message =
                "Maintenance Due Soon";

            statusClass =
                "maintenance-soon";

        }


        else {

            message =
                "Maintenance OK";

            statusClass =
                "maintenance-ok";
        }


        const item =
            document.createElement(
                "div"
            );


        item.innerHTML = `

            <div class="maintenance-card">

                <div class="maintenance-icon">
                    Maintenance
                </div>


                <div class="maintenance-info">

                    <strong>
                        ${safeText(
                            equipment.equipment_name
                        )}
                    </strong>

                    <span
                        class="${statusClass}"
                    >
                        ${safeText(
                            message
                        )}
                    </span>

                    <small>
                        Next Maintenance:
                        ${safeText(
                            equipment.next_maintenance_date
                        )}
                    </small>

                </div>

            </div>

        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            function() {

                openCopilot();


                setTimeout(
                    function() {

                        askCopilot(
                            `What should be checked before the next maintenance of ${equipment.equipment_name}? The scheduled maintenance date is ${equipment.next_maintenance_date}.`
                        );

                    },
                    300
                );

            }
        );


        maintenanceList.appendChild(
            item
        );

    });


    console.log(
        "Maintenance alerts loaded successfully:",
        data
    );
}


// ==========================================================
// DASHBOARD STATISTICS
// ==========================================================

async function loadDashboard() {

    const [
        projectResult,
        workersResult,
        equipmentResult,
        safetyResult
    ] = await Promise.all([

        supabaseClient
            .from("projects")
            .select(
                "id, overall_progress"
            )
            .limit(1)
            .single(),


        supabaseClient
            .from("workers")
            .select("id"),


        supabaseClient
            .from("equipment")
            .select("id"),


        supabaseClient
            .from("safety_issues")
            .select(
                "id, status"
            )

    ]);


    const totalWorkers =
        workersResult.data
            ? workersResult.data.length
            : 0;


    const totalEquipment =
        equipmentResult.data
            ? equipmentResult.data.length
            : 0;


    const openSafetyIssues =
        safetyResult.data
            ? safetyResult.data.filter(
                issue =>
                    issue.status ===
                    "Open"
            ).length
            : 0;


    const overallProgress =
        projectResult.data
            ? Number(
                projectResult.data.overall_progress
            ) || 0
            : 0;


    siteData.dashboard = {

        overallProgress,

        totalWorkers,

        totalEquipment,

        openSafetyIssues

    };


    setText(
        "progressValue",
        overallProgress + "%"
    );


    setText(
        "workersValue",
        totalWorkers
    );


    setText(
        "equipmentValue",
        totalEquipment
    );


    setText(
        "safetyValue",
        openSafetyIssues
    );


    const progressFill =
        document.getElementById(
            "dashboardProgressFill"
        );


    if (progressFill) {

        progressFill.style.width =
            clampProgress(
                overallProgress
            ) + "%";
    }


    const systemStatus =
        document.getElementById(
            "systemStatus"
        );


    if (systemStatus) {

        systemStatus.textContent =
            "Connected";
    }


    console.log(
        "Dashboard loaded successfully:",
        siteData.dashboard
    );
}


// ==========================================================
// SAFETY DASHBOARD
// ==========================================================

async function loadSafetyDashboard() {

    const {
        data,
        error
    } = await supabaseClient
        .from("safety_issues")
        .select(
            "status, severity"
        );


    if (error) {

        console.error(
            "Error loading safety dashboard:",
            error
        );

        return;
    }


    const totalIssues =
        data.length;


    const openIssues =
        data.filter(
            issue =>
                issue.status ===
                "Open"
        ).length;


    const resolvedIssues =
        data.filter(
            issue =>
                issue.status ===
                "Resolved"
        ).length;


    const highSeverityIssues =
        data.filter(
            issue =>
                issue.severity ===
                "High"
        ).length;


    siteData.safetyDashboard = {

        totalIssues,

        openIssues,

        resolvedIssues,

        highSeverityIssues

    };


    setText(
        "totalSafetyValue",
        totalIssues
    );


    setText(
        "openSafetyValue",
        openIssues
    );


    setText(
        "resolvedSafetyValue",
        resolvedIssues
    );


    setText(
        "highSafetyValue",
        highSeverityIssues
    );


    console.log(
        "Safety dashboard loaded successfully:",
        siteData.safetyDashboard
    );
}


// ==========================================================
// AI COPILOT
// ==========================================================

let chatHistory = [];


// ==========================================================
// OPEN COPILOT
// ==========================================================

function openCopilot() {

    const overlay =
        document.getElementById(
            "copilotOverlay"
        );


    if (!overlay) {

        console.warn(
            "copilotOverlay not found"
        );

        return;
    }


    overlay.classList.add(
        "active"
    );


    overlay.style.display =
        "flex";


    setTimeout(
        function() {

            const input =
                document.getElementById(
                    "copilotInput"
                ) ||
                document.getElementById(
                    "chatInput"
                );


            if (input) {
                input.focus();
            }

        },
        150
    );
}

window.openCopilot =
    openCopilot;


// ==========================================================
// CLOSE COPILOT
// ==========================================================

function closeCopilot() {

    const overlay =
        document.getElementById(
            "copilotOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.classList.remove(
        "active"
    );


    overlay.style.display =
        "none";
}

window.closeCopilot =
    closeCopilot;


// ==========================================================
// ADD CHAT MESSAGE
// ==========================================================

function addChatMessage(
    message,
    sender = "bot"
) {

    const chatMessages =
        document.getElementById(
            "chatMessages"
        );


    if (!chatMessages) {

        console.warn(
            "chatMessages not found"
        );

        return;
    }


    const messageElement =
        document.createElement(
            "div"
        );


    messageElement.className =
        sender === "user"
            ? "chat-message user-message"
            : "chat-message bot-message";


    const messageContent =
        document.createElement(
            "div"
        );


    messageContent.className =
        "chat-message-content";


    if (
        sender === "bot"
    ) {

        messageContent.innerHTML =
            safeText(message)
                .replace(
                    /\n/g,
                    "<br>"
                );

    } else {

        messageContent.textContent =
            message;
    }


    messageElement.appendChild(
        messageContent
    );


    chatMessages.appendChild(
        messageElement
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


// ==========================================================
// TYPING INDICATOR
// ==========================================================

function showTyping() {

    const chatMessages =
        document.getElementById(
            "chatMessages"
        );


    if (!chatMessages) {
        return;
    }


    hideTyping();


    const typing =
        document.createElement(
            "div"
        );


    typing.id =
        "copilotTyping";


    typing.className =
        "chat-message bot-message";


    typing.innerHTML = `
        <div class="chat-message-content">
            AI Copilot is thinking...
        </div>
    `;


    chatMessages.appendChild(
        typing
    );


    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


function hideTyping() {

    const typing =
        document.getElementById(
            "copilotTyping"
        );


    if (typing) {
        typing.remove();
    }
}


// ==========================================================
// LOCAL FALLBACK
// ==========================================================

function localCopilotAnswer(
    question
) {

    const q =
        String(question)
            .toLowerCase()
            .trim();


    // PROJECT
    if (
        q.includes("project") ||
        q.includes("site name") ||
        q.includes("location")
    ) {

        if (siteData.project) {

            return `
The current project is "${siteData.project.project_name}".

Location:
${siteData.project.location || "Not specified"}.

Project status:
${siteData.project.status || "Active"}.

Overall progress:
${siteData.dashboard.overallProgress || 0}%.
            `.trim();
        }
    }


    // OVERALL PROGRESS
    if (
        q.includes("progress") ||
        q.includes("completion") ||
        q.includes("percentage")
    ) {

        return `
The current overall construction progress is ${siteData.dashboard.overallProgress || 0}%.

The individual construction activities can be viewed in the Progress section.
        `.trim();
    }


    // SAFETY
    if (
        q.includes("safety") ||
        q.includes("hazard") ||
        q.includes("accident")
    ) {

        const safety =
            siteData.safetyDashboard ||
            {};


        return `
The site currently has ${safety.totalIssues || 0} recorded safety issues.

Open issues:
${safety.openIssues || 0}

Resolved issues:
${safety.resolvedIssues || 0}

High-severity issues:
${safety.highSeverityIssues || 0}.
        `.trim();
    }


    // WORKFORCE
    if (
        q.includes("worker") ||
        q.includes("workforce") ||
        q.includes("staff")
    ) {

        return `
There are currently ${siteData.dashboard.totalWorkers || 0} workers recorded in the construction management system.
        `.trim();
    }


    // EQUIPMENT
    if (
        q.includes("equipment") ||
        q.includes("machine") ||
        q.includes("crane") ||
        q.includes("excavator") ||
        q.includes("mixer") ||
        q.includes("generator")
    ) {

        const equipment =
            siteData.equipment ||
            [];


        const details =
            equipment
                .map(
                    item =>
                        `${item.equipment_name}: ${item.status}, location ${item.location || "not specified"}`
                )
                .join("\n");


        return `
There are ${equipment.length} equipment records.

${details}
        `.trim();
    }


    // MAINTENANCE
    if (
        q.includes("maintenance") ||
        q.includes("service")
    ) {

        const maintenance =
            siteData.maintenance ||
            [];


        const details =
            maintenance
                .map(
                    item =>
                        `${item.equipment_name}: next maintenance ${item.next_maintenance_date || "not specified"}`
                )
                .join("\n");


        return `
Current equipment maintenance information:

${details}
        `.trim();
    }


    // CONCRETE
    if (
        q.includes("concrete") ||
        q.includes("cement")
    ) {

        return `
Concrete quality depends on the approved mix design, batching, placement, compaction and curing.

On the actual construction site, always follow the approved method statement, project specifications and quality-control requirements.
        `.trim();
    }


    // FOUNDATION
    if (
        q.includes("foundation")
    ) {

        return `
A foundation transfers structural loads safely to the ground.

Common foundation types include isolated footings, combined footings, raft foundations and pile foundations.

The correct foundation depends on structural requirements and site soil conditions.
        `.trim();
    }


    // HELMET
    if (
        q.includes("helmet") ||
        q.includes("ppe")
    ) {

        return `
Safety helmets are important PPE on construction sites because they help protect workers from impact and falling-object hazards.

Workers should follow the approved site PPE requirements at all times.
        `.trim();
    }


    // SCAFFOLDING
    if (
        q.includes("scaffold") ||
        q.includes("scaffolding")
    ) {

        return `
Scaffolding should be erected, inspected and used according to the approved method and applicable safety requirements.

Important checks include stability, safe access, guardrails, platforms and load capacity.
        `.trim();
    }


    return `
I can help with the Smart Construction Site project.

You can ask me:

• What is the current project progress?
• What safety issues are open?
• How many workers are on site?
• What equipment is available?
• Which equipment needs maintenance?
• What activities are currently in progress?
• Tell me about the concrete pouring activity.
• What is the status of the excavator?
    `.trim();
}


// ==========================================================
// ASK COPILOT
// ==========================================================

async function askCopilot(
    question
) {

    if (!question) {
        return;
    }


    const input =
        document.getElementById(
            "copilotInput"
        ) ||
        document.getElementById(
            "chatInput"
        );


    if (input) {
        input.value = "";
    }


    addChatMessage(
        question,
        "user"
    );


    chatHistory.push({
        role: "user",
        content: question
    });


    showTyping();


    try {

        const response =
            await supabaseClient
                .functions
                .invoke(
                    "construction-copilot",
                    {
                        body: {

                            message:
                                question,

                            history:
                                chatHistory.slice(
                                    -10
                                ),

                            siteData: {

                                project:
                                    siteData.project,

                                progress:
                                    siteData.progress,

                                activities:
                                    siteData.activities,

                                safetyIssues:
                                    siteData.safetyIssues,

                                workers:
                                    siteData.workers,

                                equipment:
                                    siteData.equipment,

                                maintenance:
                                    siteData.maintenance,

                                dashboard:
                                    siteData.dashboard,

                                safetyDashboard:
                                    siteData.safetyDashboard

                            }

                        }
                    }
                );


        hideTyping();


        if (
            response.error ||
            !response.data
        ) {

            console.warn(
                "AI Edge Function unavailable. Using local fallback.",
                response.error
            );


            const fallback =
                localCopilotAnswer(
                    question
                );


            addChatMessage(
                fallback,
                "bot"
            );


            chatHistory.push({
                role: "assistant",
                content: fallback
            });


            return;
        }


        const answer =
            response.data.answer ||
            response.data.message ||
            localCopilotAnswer(
                question
            );


        addChatMessage(
            answer,
            "bot"
        );


        chatHistory.push({
            role: "assistant",
            content: answer
        });

    }


    catch (error) {

        console.error(
            "Copilot error:",
            error
        );


        hideTyping();


        const fallback =
            localCopilotAnswer(
                question
            );


        addChatMessage(
            fallback,
            "bot"
        );


        chatHistory.push({
            role: "assistant",
            content: fallback
        });
    }
}

window.askCopilot =
    askCopilot;


// ==========================================================
// CHAT FORM
// ==========================================================

function setupChat() {

    const chatForm =
        document.getElementById(
            "copilotChatForm"
        ) ||
        document.getElementById(
            "chatForm"
        );


    const chatInput =
        document.getElementById(
            "copilotInput"
        ) ||
        document.getElementById(
            "chatInput"
        );


    if (!chatForm) {

        console.warn(
            "Copilot chat form not found."
        );

        return;
    }


    if (!chatInput) {

        console.warn(
            "Copilot input not found."
        );

        return;
    }


    // Prevent duplicate listeners
    if (
        chatForm.dataset.chatReady ===
        "true"
    ) {

        return;
    }


    chatForm.dataset.chatReady =
        "true";


    chatForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const question =
                chatInput.value.trim();


            if (!question) {
                return;
            }


            await askCopilot(
                question
            );

        }
    );
}


// ==========================================================
// COPILOT OVERLAY
// ==========================================================

function setupCopilotOverlay() {

    const overlay =
        document.getElementById(
            "copilotOverlay"
        );


    if (!overlay) {
        return;
    }


    overlay.addEventListener(
        "click",
        function(event) {

            if (
                event.target === overlay
            ) {

                closeCopilot();

            }

        }
    );
}


// ==========================================================
// NAVIGATION
// ==========================================================

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            "[data-section]"
        );


    navLinks.forEach(
        link => {

            link.addEventListener(
                "click",
                function(event) {

                    const section =
                        link.getAttribute(
                            "data-section"
                        );


                    if (section) {

                        event.preventDefault();


                        scrollToSection(
                            section
                        );

                    }

                }
            );

        }
    );
}


// ==========================================================
// DASHBOARD ACTIONS
// ==========================================================

function setupDashboardActions() {

    // Explore Dashboard
    const exploreButtons =
        document.querySelectorAll(
            ".explore-dashboard, [data-action='dashboard']"
        );


    exploreButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    scrollToSection(
                        "dashboard"
                    );

                }
            );

        }
    );


    // AI Copilot
    const aiButtons =
        document.querySelectorAll(
            ".ask-ai-copilot, [data-action='copilot']"
        );


    aiButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    openCopilot();

                }
            );

        }
    );


    // Check Site Status
    const statusButtons =
        document.querySelectorAll(
            ".check-site-status, [data-action='site-status']"
        );


    statusButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    showMessage();

                }
            );

        }
    );
}


// ==========================================================
// INITIALIZE SITE
// ==========================================================

async function initializeSite() {

    console.log(
        "Initializing Smart Construction Site..."
    );


    setupChat();

    setupCopilotOverlay();

    setupNavigation();

    setupDashboardActions();


    await Promise.all([

        loadProject(),

        loadProgress(),

        loadDailyActivities(),

        loadSafetyIssues(),

        loadWorkers(),

        loadEquipment(),

        loadMaintenanceAlerts(),

        loadDashboard(),

        loadSafetyDashboard()

    ]);


    console.log(
        "Smart Construction Site loaded successfully."
    );
}


// ==========================================================
// START APPLICATION
// ==========================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeSite
    );

}

else {

    initializeSite();

}


console.log(
    "SCRIPT.JS IS RUNNING"
);