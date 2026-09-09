// ==========================================================
// SMART CONSTRUCTION SITE
// CONSTRUCTION SITE PROGRESS & SAFETY MANAGEMENT SYSTEM
// ==========================================================


// ==========================================================
// SUPABASE CONNECTION
// ==========================================================

const SUPABASE_URL =
    "https://jfkerdxnccomdyyziitz.supabase.co";

// IMPORTANT:
// Put your existing Supabase publishable/anon key here.
// Do NOT use a service-role/secret key.
const SUPABASE_KEY ="sb_publishable_Aq5Gjot6Mht1MUjYwNjfzg_pvvDq1eI";
    


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// ==========================================================
// GLOBAL SITE DATA
// Used by AI Copilot
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
// HELPER FUNCTIONS
// ==========================================================

function safeText(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


function setText(id, value) {

    const element =
        document.getElementById(id);

    if (element) {

        element.textContent =
            value ?? "";

    }

}


// ==========================================================
// INTERACTIVE SECTION NAVIGATION
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

            section.classList
                .remove("active-section");

        });

    element.classList
        .add("active-section");

    return true;

}


window.scrollToSection =
    scrollToSection;


// ==========================================================
// PROJECT
// ==========================================================

async function loadProject() {

    const {
        data,
        error
    } =
        await supabaseClient

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
        data.status
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
    } =
        await supabaseClient

            .from("activities")

            .select(
                "id, activity_name, progress, status, activity_date, location, workers_count, remarks"
            )

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
            Number(activity.progress) || 0;


        let statusClass =
            "progress-status";


        if (
            activity.status ===
            "Completed"
        ) {

            statusClass +=
                " completed";

        }

        else if (
            activity.status ===
            "In Progress"
        ) {

            statusClass +=
                " in-progress";

        }


        const item =
            document.createElement("div");


        item.innerHTML = `

            <div class="construction-progress-card">

                <div class="progress-card-header">

                    <div class="activity-icon">
                        🏗️
                    </div>

                    <div class="activity-info">

                        <h3>
                            ${safeText(
                                activity.activity_name
                            )}
                        </h3>

                        <span
                            class="${statusClass}"
                        >
                            ${safeText(
                                activity.status ||
                                "Not Updated"
                            )}
                        </span>

                    </div>

                    <div class="progress-percentage">
                        ${progress}%
                    </div>

                </div>


                <div class="progress-bar-container">

                    <div
                        class="construction-progress-fill"
                        style="
                            width:
                            ${Math.min(
                                Math.max(
                                    progress,
                                    0
                                ),
                                100
                            )}%;
                        "
                    ></div>

                </div>


                <div class="progress-footer">

                    <span>
                        Construction Progress
                    </span>

                    <strong>
                        ${progress}% Complete
                    </strong>

                </div>


                <div class="progress-extra-info">

                    ${
                        activity.location

                        ? `
                            <span>
                                📍
                                ${safeText(
                                    activity.location
                                )}
                            </span>
                          `

                        : ""
                    }


                    ${
                        activity.activity_date

                        ? `
                            <span>
                                📅
                                ${safeText(
                                    activity.activity_date
                                )}
                            </span>
                          `

                        : ""
                    }

                </div>

            </div>

        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            () => {

                openCopilot();


                setTimeout(
                    () => {

                        askCopilot(

                            `Tell me more about the construction activity "${activity.activity_name}" and its current progress of ${progress}%.`

                        );

                    },
                    300
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
// DAILY ACTIVITIES
// ==========================================================

async function loadDailyActivities() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("activities")

            .select(
                "id, activity_name, progress, status, activity_date, location, workers_count, remarks"
            )

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
            Number(activity.progress) || 0;


        let statusClass =
            "activity-status";


        if (
            activity.status ===
            "Completed"
        ) {

            statusClass +=
                " completed";

        }

        else if (
            activity.status ===
            "In Progress"
        ) {

            statusClass +=
                " in-progress";

        }


        const item =
            document.createElement("div");


        item.innerHTML = `

            <div class="daily-activity-card">

                <div class="daily-activity-header">

                    <div class="daily-activity-icon">
                        🏗️
                    </div>


                    <div class="daily-activity-title">

                        <h3>
                            ${safeText(
                                activity.activity_name
                            )}
                        </h3>

                        <span
                            class="${statusClass}"
                        >
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


                <div class="daily-activity-details">


                    <div class="activity-detail">

                        <span>📅</span>

                        <div>

                            <small>
                                DATE
                            </small>

                            <strong>

                                ${safeText(
                                    activity.activity_date ||
                                    "Not available"
                                )}

                            </strong>

                        </div>

                    </div>


                    <div class="activity-detail">

                        <span>📍</span>

                        <div>

                            <small>
                                LOCATION
                            </small>

                            <strong>

                                ${safeText(
                                    activity.location ||
                                    "Not available"
                                )}

                            </strong>

                        </div>

                    </div>


                    <div class="activity-detail">

                        <span>👷</span>

                        <div>

                            <small>
                                WORKERS
                            </small>

                            <strong>

                                ${activity.workers_count ?? 0}

                            </strong>

                        </div>

                    </div>


                </div>


                <div class="activity-progress-bar">

                    <div
                        style="
                            width:
                            ${Math.min(
                                Math.max(
                                    progress,
                                    0
                                ),
                                100
                            )}%;
                        "
                    ></div>

                </div>


                <div class="activity-remarks">

                    <strong>
                        Remarks:
                    </strong>

                    ${safeText(
                        activity.remarks ||
                        "No remarks provided"
                    )}

                </div>

            </div>

        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            () => {

                openCopilot();


                setTimeout(
                    () => {

                        askCopilot(

                            `Explain today's construction activity "${activity.activity_name}" at ${activity.location || "the site"}.`

                        );

                    },
                    300
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
// SAFETY ISSUES
// ==========================================================

async function loadSafetyIssues() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("safety_issues")

            .select(
                "id, issue, location, severity, status, reported_by, reported_date, remarks"
            )

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

        return;

    }


    siteData.safetyIssues =
        data || [];


    const safetyList =
        document.getElementById(
            "safetyList"
        );


    if (!safetyList) {

        console.warn(
            "safetyList not found"
        );

        return;

    }


    safetyList.innerHTML =
        "";


    if (
        !data ||
        data.length === 0
    ) {

        safetyList.innerHTML = `

            <div class="empty-state">

                No safety issues reported.

            </div>

        `;

        return;

    }


    data.forEach(issue => {

        let severityClass =
            "safety-severity";


        if (
            issue.severity ===
            "High"
        ) {

            severityClass +=
                " high";

        }

        else if (
            issue.severity ===
            "Medium"
        ) {

            severityClass +=
                " medium";

        }

        else if (
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

        }

        else if (
            issue.status ===
            "Resolved"
        ) {

            statusClass +=
                " resolved";

        }


        const item =
            document.createElement("div");


        item.innerHTML = `

            <div class="safety-alert-card">

                <div class="safety-alert-header">

                    <div class="safety-alert-icon">
                        ⚠️
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


                <div class="safety-details">


                    <div class="safety-detail">

                        <span>📍</span>

                        <div>

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

                    </div>


                    <div class="safety-detail">

                        <span>👷</span>

                        <div>

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

                    </div>


                    <div class="safety-detail">

                        <span>📅</span>

                        <div>

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


                </div>


                <div class="safety-remarks">

                    <strong>
                        Remarks:
                    </strong>

                    ${safeText(
                        issue.remarks ||
                        "No remarks provided"
                    )}

                </div>

            </div>

        `;


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            () => {

                openCopilot();


                setTimeout(
                    () => {

                        askCopilot(

                            `Explain the safety issue "${issue.issue}" at ${issue.location}. It has ${issue.severity} severity and is currently ${issue.status}. What should be done?`

                        );

                    },
                    300
                );

            }
        );


        safetyList.appendChild(
            item
        );

    });


    console.log(
        "Safety issues loaded successfully:",
        data
    );

}


// ==========================================================
// WORKERS
// ==========================================================

async function loadWorkers() {

    const {
        data,
        error
    } =
        await supabaseClient

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

        const item =
            document.createElement("div");


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


        item.innerHTML = `

            <div class="worker-card">

                <div class="worker-icon">
                    👷
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
            () => {

                openCopilot();


                setTimeout(
                    () => {

                        askCopilot(

                            `Tell me about the workforce role "${workerRole}" and its importance on a construction site.`

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
    } =
        await supabaseClient

            .from("equipment")

            .select(
                "id, equipment_name, equipment_type, status, location, last_maintenance_date, next_maintenance_date, remarks"
            )

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
            document.createElement("div");


        item.innerHTML = `

            <div class="equipment-card">

                <div class="equipment-icon">
                    ⚙️
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

                        📍
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
            () => {

                openCopilot();


                setTimeout(
                    () => {

                        askCopilot(

                            `Give me the maintenance and operational information for ${equipment.equipment_name}.`

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
// MAINTENANCE ALERTS
// ==========================================================

async function loadMaintenanceAlerts() {

    const {
        data,
        error
    } =
        await supabaseClient

            .from("equipment")

            .select(
                "equipment_name, next_maintenance_date"
            );


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

        let statusClass =
            "";


        if (
            difference < 0
        ) {

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
            document.createElement("div");


        item.innerHTML = `

            <div class="maintenance-card">

                <div class="maintenance-icon">
                    🔧
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

                        ${message}

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
            () => {

                openCopilot();


                setTimeout(
                    () => {

                        askCopilot(

                            `What should be checked before the next maintenance of ${equipment.equipment_name}?`

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


    if (
        projectResult.error
    ) {

        console.error(
            "Dashboard project error:",
            projectResult.error
        );

    }


    if (
        workersResult.error
    ) {

        console.error(
            "Dashboard workers error:",
            workersResult.error
        );

    }


    if (
        equipmentResult.error
    ) {

        console.error(
            "Dashboard equipment error:",
            equipmentResult.error
        );

    }


    if (
        safetyResult.error
    ) {

        console.error(
            "Dashboard safety error:",
            safetyResult.error
        );

    }


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

            ? (
                projectResult.data
                    .overall_progress ??
                0
            )

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
            Math.min(
                Math.max(
                    overallProgress,
                    0
                ),
                100
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
// SAFETY DASHBOARD STATISTICS
// ==========================================================

async function loadSafetyDashboard() {

    const { data, error } =
        await supabaseClient
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
                issue.status === "Open"
        ).length;


    const resolvedIssues =
        data.filter(
            issue =>
                issue.status === "Resolved"
        ).length;


    const highSeverityIssues =
        data.filter(
            issue =>
                issue.severity === "High"
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


    setTimeout(() => {

        const input =
            document.getElementById(
                "chatInput"
            );

        if (input) {

            input.focus();

        }

    }, 100);

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


    if (sender === "bot") {

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

            <span>
                AI Copilot is thinking...
            </span>

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
// LOCAL FALLBACK AI
// ==========================================================

function localCopilotAnswer(
    question
) {

    const q =
        question
            .toLowerCase()
            .trim();


    // PROJECT
    if (
        q.includes("project") ||
        q.includes("site name")
    ) {

        if (siteData.project) {

            return `

The current project is
${siteData.project.project_name},
located at
${siteData.project.location}.

The current project status is
${siteData.project.status || "not specified"}.

            `.trim();

        }

    }


    // PROGRESS
    if (
        q.includes("progress") ||
        q.includes("percentage") ||
        q.includes("completion")
    ) {

        const progress =
            siteData.dashboard
                .overallProgress;


        return `

The current overall construction progress is ${progress}%.

You can open the Progress Tracking section to view individual construction activities and their completion percentages.

        `.trim();

    }


    // SAFETY
    if (
        q.includes("safety") ||
        q.includes("hazard") ||
        q.includes("accident")
    ) {

        const safety =
            siteData.safetyDashboard;


        return `

The site currently has
${safety.totalIssues || 0}
recorded safety issues.

${safety.openIssues || 0}
are open and
${safety.resolvedIssues || 0}
are resolved.

There are
${safety.highSeverityIssues || 0}
high-severity issues.

        `.trim();

    }


    // WORKERS
    if (
        q.includes("worker") ||
        q.includes("workforce") ||
        q.includes("staff")
    ) {

        return `

There are currently
${siteData.dashboard.totalWorkers || 0}
workers recorded in the construction management system.

        `.trim();

    }


    // EQUIPMENT
    if (
        q.includes("equipment") ||
        q.includes("machine") ||
        q.includes("crane") ||
        q.includes("excavator")
    ) {

        return `

There are currently
${siteData.dashboard.totalEquipment || 0}
equipment records in the system.

Open the Equipment section for individual equipment details and maintenance information.

        `.trim();

    }


    // MAINTENANCE
    if (
        q.includes("maintenance") ||
        q.includes("service")
    ) {

        return `

The system tracks the next maintenance date for construction equipment.

Open the Maintenance Alerts section to see equipment requiring attention.

        `.trim();

    }


    // CONCRETE
    if (
        q.includes("concrete") ||
        q.includes("cement")
    ) {

        return `

Concrete quality depends on proper mix design, batching, placement, compaction and curing.

On an actual construction site, follow the approved mix design, method statement and project specifications.

        `.trim();

    }


    // FOUNDATION
    if (
        q.includes("foundation")
    ) {

        return `

A foundation transfers structural loads safely to the ground.

Common foundation types include isolated footings, combined footings, raft foundations and piles.

The correct type depends on structural requirements and soil conditions.

        `.trim();

    }


    // HELMET
    if (
        q.includes("safety helmet") ||
        q.includes("helmet")
    ) {

        return `

Safety helmets are essential PPE on construction sites because they help protect workers from falling objects and impact hazards.

Workers should follow the site's approved PPE requirements at all times.

        `.trim();

    }


    // SCAFFOLDING
    if (
        q.includes("scaffold") ||
        q.includes("scaffolding")
    ) {

        return `

Scaffolding should be erected, inspected and used according to the approved method and applicable safety requirements.

Important checks include stability, access, guardrails, platforms and load capacity.

        `.trim();

    }


    // DEFAULT
    return `

I can help with construction management, site progress, safety, workforce, equipment, maintenance and general construction questions.

For site-specific information, ask me things such as:

• What is the current project progress?
• What safety issues are open?
• How many workers are on site?
• Which equipment needs maintenance?
• What activities are currently in progress?

For general construction questions, you can ask about concrete, foundations, scaffolding, PPE, project management, construction safety and more.

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

        // ==================================================
        // SEND QUESTION TO SUPABASE EDGE FUNCTION
        // ==================================================

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
                "AI Edge Function unavailable. Using local fallback."
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


    } catch (error) {

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
            "chatForm"
        );


    const chatInput =
        document.getElementById(
            "chatInput"
        );


    if (!chatForm) {

        console.warn(
            "chatForm not found"
        );

        return;

    }


    chatForm.addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!chatInput) {

                return;

            }


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
// CLOSE COPILOT WHEN CLICKING OUTSIDE
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
                event.target ===
                overlay
            ) {

                closeCopilot();

            }

        }
    );

}


// ==========================================================
// NAVIGATION LINKS
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
// INITIALIZE EVERYTHING
// ==========================================================

async function initializeSite() {

    console.log(
        "Initializing Smart Construction Site..."
    );


    setupChat();

    setupCopilotOverlay();

    setupNavigation();


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

} else {

    initializeSite();

}
console.log("SCRIPT.JS IS RUNNING");
