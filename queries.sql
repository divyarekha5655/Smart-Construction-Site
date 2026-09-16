SELECT
    id,
    project_name,
    location,
    start_date,
    overall_progress
FROM projects
ORDER BY id;
-- 2. GET OVERALL PROJECT PROGRESS
 -- Used for: Dashboard / Project Progress
SELECT
    project_name,
    overall_progress
FROM projects
ORDER BY id;
 --3. GET ALL CONSTRUCTION ACTIVITIES
 --Used for: Construction Progress
SELECT
    id,
    project_id,
    activity_name,
    progress,
    status,
    activity_date,
    location,
    workers_count,
    remarks
FROM activities
ORDER BY activity_date DESC, id DESC;
 --4. GET DAILY ACTIVITIES
--Used for: Daily Activities section
SELECT
    activity_name,
    progress,
    status,
    activity_date,
    location,
    workers_count,
    remarks
FROM activities
ORDER BY activity_date DESC, id DESC;
-- 5. GET DETAILS OF A SPECIFIC ACTIVITY
-- Used for: View Details
SELECT
    activity_name,
    progress,
    status,
    activity_date,
    location,
    workers_count,
    remarks
FROM activities
WHERE id = 1;
-- 6. GET ALL WORKERS
-- Used for: Workforce section
SELECT
    id,
    name,
    role,
    department,
    status
FROM workers
ORDER BY id;
-- 7. GET TOTAL NUMBER OF WORKERS
-- Used for: Workforce count
SELECT
    COUNT(*) AS total_workers
FROM workers;
-- 8. GET ACTIVE WORKERS
-- Used for: Active workforce information
SELECT
    name,
    role,
    department,
    status
FROM workers
WHERE status = 'Active'
ORDER BY id;
-- 9. GET EQUIPMENT DETAILS
-- Used for: Equipment section
SELECT
    equipment_name,
    equipment_type,
    status,
    location,
    last_maintenance_date,
    next_maintenance_date,
    remarks
FROM equipment
ORDER BY id;
-- 10. GET EQUIPMENT REQUIRING MAINTENANCE
-- Used for: Maintenance section / AI Copilot
SELECT
    equipment_name,
    equipment_type,
    status,
    location,
    last_maintenance_date,
    next_maintenance_date,
    remarks
FROM equipment
WHERE status = 'Under Maintenance'
   OR next_maintenance_date <= CURRENT_DATE
ORDER BY next_maintenance_date;
-- 11. GET UPCOMING EQUIPMENT MAINTENANCE
-- Used for: Maintenance alerts
SELECT
    equipment_name,
    equipment_type,
    status,
    location,
    next_maintenance_date
FROM equipment
WHERE next_maintenance_date IS NOT NULL
ORDER BY next_maintenance_date;
-- 12. GET ALL SAFETY ISSUES
-- Used for: Safety section
SELECT
    id,
    issue,
    location,
    severity,
    status,
    reported_by,
    reported_date,
    remarks
FROM safety_issues
ORDER BY reported_date DESC, id DESC;
-- 13. GET OPEN SAFETY ISSUES
-- Used for: Safety dashboard / Site Status
    issue,
    location,
    severity,
    status,
    reported_by,
    reported_date,
    remarks
FROM safety_issues
WHERE status = 'Open'
ORDER BY reported_date DESC;
-- 14. GET HIGH-SEVERITY SAFETY ISSUES
-- Used for: Safety monitoring
SELECT
    issue,
    location,
    severity,
    status,
    reported_by,
    reported_date,
    remarks
FROM safety_issues
WHERE severity = 'High'
ORDER BY reported_date DESC;
-- 15. GET SAFETY ISSUE DETAILS
-- Used for: Safety View Details
SELECT
    issue,
    location,
    severity,
    status,
    reported_by,
    reported_date,
    remarks
FROM safety_issues
WHERE id = 1;
-- 16. SAFETY DASHBOARD SUMMARY
-- Used for: Safety KPI
SELECT
    COUNT(*) AS total_safety_issues,
    COUNT(*) FILTER (WHERE status = 'Open') AS open_issues,
    COUNT(*) FILTER (WHERE status = 'Resolved') AS resolved_issues,
    COUNT(*) FILTER (WHERE severity = 'High') AS high_severity_issues
FROM safety_issues;
-- 17. CONSTRUCTION PROGRESS SUMMARY
-- Used for: Progress overview
SELECT
    COUNT(*) AS total_activities,
    ROUND(AVG(progress), 2) AS average_activity_progress
FROM activities;
-- 18. SITE STATUS SUMMARY
-- Used for: Check Site Status
SELECT
    (SELECT overall_progress
     FROM projects
     ORDER BY id
     LIMIT 1) AS overall_progress,

    (SELECT COUNT(*)
     FROM workers) AS total_workers,

    (SELECT COUNT(*)
     FROM equipment) AS total_equipment,

    (SELECT COUNT(*)
     FROM safety_issues
     WHERE status = 'Open') AS open_safety_issues,

    (SELECT COUNT(*)
     FROM safety_issues
     WHERE severity = 'High'
       AND status = 'Open') AS high_severity_open_issues;
