# API Specification (V1)

Base URL:
/api/v1

## Authentication

POST /auth/login

Request:
- email
- password

Response:
- access_token
- role

## Exams

GET /exams
GET /exams/:id
POST /exams
PUT /exams/:id

## Centers

GET /centers
POST /centers
PUT /centers/:id

## Shifts

GET /shifts
POST /shifts

## Candidates

POST /candidates/import-csv
GET /candidates/search?rollNumber=
GET /candidates/search?qrCode=
GET /candidates/:id

## Attendance

POST /attendance/capture

Payload:
- candidate_id
- operator_id
- device_id
- face_photo_url
- attendance_status
- fingerprint_verified
- iris_verified
- face_verified

GET /attendance/sync-status

## CSR

POST /csr/upload
GET /csr/list

## Devices

GET /devices
POST /devices
PUT /devices/:id

## Reports

GET /reports/attendance-summary
GET /reports/center-summary

## Audit Logs

GET /audit-logs
