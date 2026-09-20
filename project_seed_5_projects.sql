-- Smart Construction Site
-- Project seed/reference query for the 5 project records currently used
-- by the multi-project website.
--
-- This file is intended for documentation/replay. It updates only the
-- project fields used by the website and does not overwrite date fields.

INSERT INTO projects (
    id,
    project_name,
    location,
    status,
    overall_progress
)
VALUES
    (
        3,
        'Smart Construction Site',
        'chennai',
        'Active',
        70
    ),
    (
        4,
        'Chennai Airport Expansion',
        'Chennai',
        'in progress',
        72
    ),
    (
        5,
        'Chennai Metro Rail Project',
        'Chennai',
        'in progress',
        54
    ),
    (
        6,
        'Highway Development Project',
        'Tamil Nadu',
        'in progress',
        61
    ),
    (
        7,
        'Commercial Building Project',
        'Chennai',
        'in progress',
        83
    )
ON CONFLICT (id)
DO UPDATE SET
    project_name = EXCLUDED.project_name,
    location = EXCLUDED.location,
    status = EXCLUDED.status,
    overall_progress = EXCLUDED.overall_progress;


-- Verification query
SELECT
    id,
    project_name,
    location,
    status,
    overall_progress
FROM projects
WHERE id IN (3, 4, 5, 6, 7)
ORDER BY id;
