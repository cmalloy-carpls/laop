-- LSC Case Service Report Problem Code Taxonomy
-- Source: Legal Services Corporation CSR reporting requirements
-- Top-level categories (is_leaf = false, parent_id = null)
-- Subcategories (is_leaf = true, parent_id = parent lsc_code)
-- Run after initial schema migration.

INSERT INTO problems (id, lsc_code, lsc_subcode, label, description, parent_id, is_leaf, is_active, sort_order) VALUES

-- ── CONSUMER (01) ───────────────────────────────────────────────────────────
('prob_01',     '01', NULL,   'Consumer',                        NULL, NULL,      false, true,  10),
('prob_0100',   '01', '0100', 'Consumer - General',              NULL, 'prob_01', true,  true,  1),
('prob_0110',   '01', '0110', 'Bankruptcy',                      NULL, 'prob_01', true,  true,  2),
('prob_0120',   '01', '0120', 'Collection Issues',               NULL, 'prob_01', true,  true,  3),
('prob_0130',   '01', '0130', 'Contracts',                       NULL, 'prob_01', true,  true,  4),
('prob_0140',   '01', '0140', 'Credit/Financial Issues',         NULL, 'prob_01', true,  true,  5),
('prob_0150',   '01', '0150', 'Predatory Lending',               NULL, 'prob_01', true,  true,  6),
('prob_0160',   '01', '0160', 'Mortgage/Home Equity Issues',     NULL, 'prob_01', true,  true,  7),
('prob_0170',   '01', '0170', 'Utilities',                       NULL, 'prob_01', true,  true,  8),
('prob_0180',   '01', '0180', 'Insurance',                       NULL, 'prob_01', true,  true,  9),
('prob_0190',   '01', '0190', 'Small Claims',                    NULL, 'prob_01', true,  true,  10),

-- ── EDUCATION (02) ──────────────────────────────────────────────────────────
('prob_02',     '02', NULL,   'Education',                       NULL, NULL,      false, true,  20),
('prob_0200',   '02', '0200', 'Education - General',             NULL, 'prob_02', true,  true,  1),
('prob_0210',   '02', '0210', 'School Discipline/Expulsion',     NULL, 'prob_02', true,  true,  2),
('prob_0220',   '02', '0220', 'Special Education (IDEA/504)',    NULL, 'prob_02', true,  true,  3),
('prob_0230',   '02', '0230', 'Student Loans',                   NULL, 'prob_02', true,  true,  4),
('prob_0240',   '02', '0240', 'School Enrollment/Access',        NULL, 'prob_02', true,  true,  5),

-- ── EMPLOYMENT (03) ─────────────────────────────────────────────────────────
('prob_03',     '03', NULL,   'Employment',                      NULL, NULL,      false, true,  30),
('prob_0300',   '03', '0300', 'Employment - General',            NULL, 'prob_03', true,  true,  1),
('prob_0310',   '03', '0310', 'Discrimination',                  NULL, 'prob_03', true,  true,  2),
('prob_0320',   '03', '0320', 'FMLA / Leave',                    NULL, 'prob_03', true,  true,  3),
('prob_0330',   '03', '0330', 'Unemployment Compensation',       NULL, 'prob_03', true,  true,  4),
('prob_0340',   '03', '0340', 'Wage and Hour',                   NULL, 'prob_03', true,  true,  5),
('prob_0350',   '03', '0350', 'Workers Compensation',            NULL, 'prob_03', true,  true,  6),
('prob_0360',   '03', '0360', 'Wrongful Termination',            NULL, 'prob_03', true,  true,  7),

-- ── FAMILY (04) ─────────────────────────────────────────────────────────────
('prob_04',     '04', NULL,   'Family',                          NULL, NULL,      false, true,  40),
('prob_0400',   '04', '0400', 'Family - General',                NULL, 'prob_04', true,  true,  1),
('prob_0410',   '04', '0410', 'Divorce / Separation',            NULL, 'prob_04', true,  true,  2),
('prob_0420',   '04', '0420', 'Custody / Visitation',            NULL, 'prob_04', true,  true,  3),
('prob_0430',   '04', '0430', 'Child Support',                   NULL, 'prob_04', true,  true,  4),
('prob_0440',   '04', '0440', 'Adoption / Guardianship',         NULL, 'prob_04', true,  true,  5),
('prob_0450',   '04', '0450', 'Domestic Violence / DVPO',        NULL, 'prob_04', true,  true,  6),
('prob_0460',   '04', '0460', 'Elder Abuse',                     NULL, 'prob_04', true,  true,  7),
('prob_0470',   '04', '0470', 'Name Change',                     NULL, 'prob_04', true,  true,  8),
('prob_0480',   '04', '0480', 'Paternity',                       NULL, 'prob_04', true,  true,  9),
('prob_0490',   '04', '0490', 'Juvenile / Delinquency',          NULL, 'prob_04', true,  true,  10),

-- ── HOUSING (05) ────────────────────────────────────────────────────────────
('prob_05',     '05', NULL,   'Housing',                         NULL, NULL,      false, true,  50),
('prob_0500',   '05', '0500', 'Housing - General',               NULL, 'prob_05', true,  true,  1),
('prob_0510',   '05', '0510', 'Mortgage Foreclosure',            NULL, 'prob_05', true,  true,  2),
('prob_0520',   '05', '0520', 'Eviction / Unlawful Detainer',    NULL, 'prob_05', true,  true,  3),
('prob_0530',   '05', '0530', 'Habitability / Repairs',          NULL, 'prob_05', true,  true,  4),
('prob_0540',   '05', '0540', 'Subsidized / Public Housing',     NULL, 'prob_05', true,  true,  5),
('prob_0550',   '05', '0550', 'Security Deposits',               NULL, 'prob_05', true,  true,  6),
('prob_0560',   '05', '0560', 'Housing Discrimination',          NULL, 'prob_05', true,  true,  7),
('prob_0570',   '05', '0570', 'Homeownership / Title',           NULL, 'prob_05', true,  true,  8),
('prob_0580',   '05', '0580', 'Homelessness / Shelter',          NULL, 'prob_05', true,  true,  9),
('prob_0590',   '05', '0590', 'Mobile Home / Landlord-Tenant',   NULL, 'prob_05', true,  true,  10),

-- ── HEALTH (06) ─────────────────────────────────────────────────────────────
('prob_06',     '06', NULL,   'Health',                          NULL, NULL,      false, true,  60),
('prob_0600',   '06', '0600', 'Health - General',                NULL, 'prob_06', true,  true,  1),
('prob_0610',   '06', '0610', 'Medicaid / CHIP',                 NULL, 'prob_06', true,  true,  2),
('prob_0620',   '06', '0620', 'Medicare',                        NULL, 'prob_06', true,  true,  3),
('prob_0630',   '06', '0630', 'Mental Health',                   NULL, 'prob_06', true,  true,  4),
('prob_0640',   '06', '0640', 'Disability Rights / ADA',         NULL, 'prob_06', true,  true,  5),
('prob_0650',   '06', '0650', 'Long-Term Care',                  NULL, 'prob_06', true,  true,  6),
('prob_0660',   '06', '0660', 'Health Insurance Disputes',       NULL, 'prob_06', true,  true,  7),

-- ── IMMIGRATION (07) ────────────────────────────────────────────────────────
('prob_07',     '07', NULL,   'Immigration',                     NULL, NULL,      false, true,  70),
('prob_0700',   '07', '0700', 'Immigration - General',           NULL, 'prob_07', true,  true,  1),
('prob_0710',   '07', '0710', 'Asylum / Refugee',                NULL, 'prob_07', true,  true,  2),
('prob_0720',   '07', '0720', 'Naturalization / Citizenship',    NULL, 'prob_07', true,  true,  3),
('prob_0730',   '07', '0730', 'Removal Defense / Deportation',   NULL, 'prob_07', true,  true,  4),
('prob_0740',   '07', '0740', 'DACA / Immigration Status',       NULL, 'prob_07', true,  true,  5),
('prob_0750',   '07', '0750', 'Family Petitions (USCIS)',        NULL, 'prob_07', true,  true,  6),
('prob_0760',   '07', '0760', 'Work Authorization',              NULL, 'prob_07', true,  true,  7),
('prob_0770',   '07', '0770', 'VAWA / U-Visa / T-Visa',         NULL, 'prob_07', true,  true,  8),
('prob_0780',   '07', '0780', 'Special Immigrant Juvenile',      NULL, 'prob_07', true,  true,  9),

-- ── INCOME MAINTENANCE (08) ─────────────────────────────────────────────────
('prob_08',     '08', NULL,   'Income Maintenance',              NULL, NULL,      false, true,  80),
('prob_0800',   '08', '0800', 'Income Maintenance - General',    NULL, 'prob_08', true,  true,  1),
('prob_0810',   '08', '0810', 'SNAP / Food Stamps',              NULL, 'prob_08', true,  true,  2),
('prob_0820',   '08', '0820', 'TANF / Public Assistance',        NULL, 'prob_08', true,  true,  3),
('prob_0830',   '08', '0830', 'Social Security / SSI / SSDI',   NULL, 'prob_08', true,  true,  4),
('prob_0840',   '08', '0840', 'Unemployment Compensation',       NULL, 'prob_08', true,  true,  5),
('prob_0850',   '08', '0850', 'Veterans Benefits',               NULL, 'prob_08', true,  true,  6),
('prob_0860',   '08', '0860', 'Energy Assistance (LIHEAP)',      NULL, 'prob_08', true,  true,  7),
('prob_0870',   '08', '0870', 'Child Care Assistance',           NULL, 'prob_08', true,  true,  8),
('prob_0880',   '08', '0880', 'WIC',                             NULL, 'prob_08', true,  true,  9),

-- ── INDIVIDUAL RIGHTS (09) ──────────────────────────────────────────────────
('prob_09',     '09', NULL,   'Individual Rights',               NULL, NULL,      false, true,  90),
('prob_0900',   '09', '0900', 'Individual Rights - General',     NULL, 'prob_09', true,  true,  1),
('prob_0910',   '09', '0910', 'Civil Rights / Discrimination',   NULL, 'prob_09', true,  true,  2),
('prob_0920',   '09', '0920', 'Criminal Record / Expungement',   NULL, 'prob_09', true,  true,  3),
('prob_0930',   '09', '0930', 'Post-Conviction Relief',          NULL, 'prob_09', true,  true,  4),
('prob_0940',   '09', '0940', 'Prisoner Rights',                 NULL, 'prob_09', true,  true,  5),
('prob_0950',   '09', '0950', 'Privacy / Identity Theft',        NULL, 'prob_09', true,  true,  6),
('prob_0960',   '09', '0960', 'Voting Rights',                   NULL, 'prob_09', true,  true,  7),

-- ── JUVENILE (10) ───────────────────────────────────────────────────────────
('prob_10',     '10', NULL,   'Juvenile',                        NULL, NULL,      false, true,  100),
('prob_1000',   '10', '1000', 'Juvenile - General',              NULL, 'prob_10', true,  true,  1),
('prob_1010',   '10', '1010', 'Delinquency Defense',             NULL, 'prob_10', true,  true,  2),
('prob_1020',   '10', '1020', 'Status Offenses',                 NULL, 'prob_10', true,  true,  3),
('prob_1030',   '10', '1030', 'Child Welfare / DCFS',            NULL, 'prob_10', true,  true,  4),

-- ── OTHER (11) ──────────────────────────────────────────────────────────────
('prob_11',     '11', NULL,   'Other',                           NULL, NULL,      false, true,  110),
('prob_1100',   '11', '1100', 'Other - General',                 NULL, 'prob_11', true,  true,  1),
('prob_1110',   '11', '1110', 'Wills / Estates / Probate',       NULL, 'prob_11', true,  true,  2),
('prob_1120',   '11', '1120', 'Powers of Attorney / Advance Directives', NULL, 'prob_11', true, true, 3),
('prob_1130',   '11', '1130', 'Tax Issues',                      NULL, 'prob_11', true,  true,  4),
('prob_1140',   '11', '1140', 'Municipal / Code Violations',     NULL, 'prob_11', true,  true,  5),
('prob_1150',   '11', '1150', 'Sealing / Expungement',           NULL, 'prob_11', true,  true,  6),
('prob_1160',   '11', '1160', 'Torts / Personal Injury',         NULL, 'prob_11', true,  true,  7),
('prob_1170',   '11', '1170', 'Nonprofit / Small Business',      NULL, 'prob_11', true,  true,  8)

ON CONFLICT (id) DO NOTHING;
