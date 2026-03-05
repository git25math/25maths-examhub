-- Assign existing users to classes 10B and 11B
-- School: ae7a1383-d54a-4394-89d0-ce04cb3941ff (AISL Harrow Haikou)
-- Teacher: 7a001a08-7133-442a-aa2b-309230aa2e4f (Nalo Zhu)

-- 1. Create classes
INSERT INTO public.classes (id, school_id, teacher_id, name, grade) VALUES
  ('c10b0000-0000-0000-0000-000000000001', 'ae7a1383-d54a-4394-89d0-ce04cb3941ff', '7a001a08-7133-442a-aa2b-309230aa2e4f', '10B', '25m-y10'),
  ('c11b0000-0000-0000-0000-000000000002', 'ae7a1383-d54a-4394-89d0-ce04cb3941ff', '7a001a08-7133-442a-aa2b-309230aa2e4f', '11B', '25m-y11');

-- 2. Insert class_students — 10B (Year 10)
INSERT INTO public.class_students (class_id, user_id, student_name) VALUES
  ('c10b0000-0000-0000-0000-000000000001', '1fd86bfe-e230-46a0-9ac8-89c2114358d5', 'Selenium347511'),
  ('c10b0000-0000-0000-0000-000000000001', '2e0efb0b-995e-49a3-9095-dbeb894502ea', 'Selina.wang'),
  ('c10b0000-0000-0000-0000-000000000001', '9df5d13f-fe7a-481b-b7b4-69c267410cec', 'mark.she'),
  ('c10b0000-0000-0000-0000-000000000001', '80a77bf2-d5b7-4a1f-8aca-8f43af59a2db', 'mark.she'),
  ('c10b0000-0000-0000-0000-000000000001', '377a334e-c1ad-4f00-b789-76472941389c', 'ooowen543'),
  ('c10b0000-0000-0000-0000-000000000001', '4eacb78b-7da9-4e3e-aed3-c9217a881ea3', 'rainier.zhang');

-- 3. Insert class_students — 11B (Year 11)
INSERT INTO public.class_students (class_id, user_id, student_name) VALUES
  ('c11b0000-0000-0000-0000-000000000002', '0a9a1656-58e3-44e5-8537-b8654061a2c4', 'alice.zhang'),
  ('c11b0000-0000-0000-0000-000000000002', '03caa282-d9cb-4681-84ef-76412b480afc', 'leona.li'),
  ('c11b0000-0000-0000-0000-000000000002', '64121344-4029-45e2-9a65-c29ab7356cfc', 'lucy.cai'),
  ('c11b0000-0000-0000-0000-000000000002', '7f5800f9-099a-4c28-9532-e285172de91f', 'caroline.cai'),
  ('c11b0000-0000-0000-0000-000000000002', '02d4aa4e-d632-4596-9d33-172acf7e9d7e', 'maxzhao2010716'),
  ('c11b0000-0000-0000-0000-000000000002', '2683bfc3-d766-4afa-bf1b-c6d4f83e1ba7', 'anna.xia');

-- 4. Update leaderboard — 10B
UPDATE public.leaderboard SET
  school_id = 'ae7a1383-d54a-4394-89d0-ce04cb3941ff',
  class_id = 'c10b0000-0000-0000-0000-000000000001',
  board = '25m-y10'
WHERE user_id IN (
  '1fd86bfe-e230-46a0-9ac8-89c2114358d5',
  '2e0efb0b-995e-49a3-9095-dbeb894502ea',
  '9df5d13f-fe7a-481b-b7b4-69c267410cec',
  '80a77bf2-d5b7-4a1f-8aca-8f43af59a2db',
  '377a334e-c1ad-4f00-b789-76472941389c',
  '4eacb78b-7da9-4e3e-aed3-c9217a881ea3'
);

-- 5. Update leaderboard — 11B
UPDATE public.leaderboard SET
  school_id = 'ae7a1383-d54a-4394-89d0-ce04cb3941ff',
  class_id = 'c11b0000-0000-0000-0000-000000000002',
  board = '25m-y11'
WHERE user_id IN (
  '0a9a1656-58e3-44e5-8537-b8654061a2c4',
  '03caa282-d9cb-4681-84ef-76412b480afc',
  '64121344-4029-45e2-9a65-c29ab7356cfc',
  '7f5800f9-099a-4c28-9532-e285172de91f',
  '02d4aa4e-d632-4596-9d33-172acf7e9d7e',
  '2683bfc3-d766-4afa-bf1b-c6d4f83e1ba7'
);

-- 6. Update auth user_metadata — 10B students
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'role', 'student',
  'board', '25m-y10',
  'class_id', 'c10b0000-0000-0000-0000-000000000001',
  'school_id', 'ae7a1383-d54a-4394-89d0-ce04cb3941ff'
) WHERE id IN (
  '1fd86bfe-e230-46a0-9ac8-89c2114358d5',
  '2e0efb0b-995e-49a3-9095-dbeb894502ea',
  '9df5d13f-fe7a-481b-b7b4-69c267410cec',
  '80a77bf2-d5b7-4a1f-8aca-8f43af59a2db',
  '377a334e-c1ad-4f00-b789-76472941389c',
  '4eacb78b-7da9-4e3e-aed3-c9217a881ea3'
);

-- 7. Update auth user_metadata — 11B students
UPDATE auth.users SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object(
  'role', 'student',
  'board', '25m-y11',
  'class_id', 'c11b0000-0000-0000-0000-000000000002',
  'school_id', 'ae7a1383-d54a-4394-89d0-ce04cb3941ff'
) WHERE id IN (
  '0a9a1656-58e3-44e5-8537-b8654061a2c4',
  '03caa282-d9cb-4681-84ef-76412b480afc',
  '64121344-4029-45e2-9a65-c29ab7356cfc',
  '7f5800f9-099a-4c28-9532-e285172de91f',
  '02d4aa4e-d632-4596-9d33-172acf7e9d7e',
  '2683bfc3-d766-4afa-bf1b-c6d4f83e1ba7'
);
