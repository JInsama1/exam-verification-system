# Exam Verification System - Database Design (V1)

## Users

Fields:
- id
- name
- email
- password_hash
- role
- created_at
- updated_at

Roles:
- master_admin
- admin
- operator

## Operators

Fields:
- id
- user_id
- operator_code
- phone
- status
- created_at

## Devices

Fields:
- id
- device_code
- serial_number
- assigned_center_id
- assigned_operator_id
- app_version
- last_sync_at
- status

## Exams

Fields:
- id
- name
- exam_code
- exam_date
- status
- created_at

## Centers

Fields:
- id
- center_code
- center_name
- address
- city
- state
- created_at

## Shifts

Fields:
- id
- exam_id
- shift_name
- reporting_time
- start_time
- end_time

## Candidates

Fields:
- id
- roll_number
- registration_number
- name
- father_name
- dob
- photo_url
- exam_id
- center_id
- shift_id
- created_at

## Attendance Records

Fields:
- id
- candidate_id
- operator_id
- device_id
- attendance_status
- face_photo_url
- fingerprint_verified
- iris_verified
- face_verified
- manual_override
- sync_status
- captured_at
- synced_at

Attendance Status Values:
- present
- absent

## CSR Uploads

Fields:
- id
- exam_id
- center_id
- uploaded_by
- file_url
- uploaded_at

## Audit Logs

Fields:
- id
- user_id
- action
- entity_type
- entity_id
- ip_address
- created_at

## Planned Tables

- users
- operators
- devices
- exams
- centers
- shifts
- candidates
- attendance_records
- csr_uploads
- audit_logs
