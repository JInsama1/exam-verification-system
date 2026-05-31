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
- sync_status
- captured_at
- synced_at

## Planned Tables

- users
- operators
- devices
- exams
- centers
- shifts
- candidates
- attendance_records
- audit_logs
