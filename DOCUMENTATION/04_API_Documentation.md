# 04 – API Documentation

Base URL local: `http://localhost:5000/api`. Protected routes require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/health` | Public | API health |
| GET | `/departments` | Public | List departments |
| POST | `/auth/register` | Public | Register citizen (`name,email,mobile,password`) |
| POST | `/auth/login` | Public | Login (`email,password`) |
| GET | `/auth/me` | Authenticated | Current user |
| POST | `/ai/analyse` | Authenticated | Analyse `description` and return advisory suggestions |
| POST | `/grievances` | Citizen | Multipart submit: `district,category,subject,description,priority,attachments[]` |
| GET | `/grievances/mine` | Citizen | Citizen's own grievances |
| GET | `/grievances/track/:referenceNo` | Public | Track by reference number |
| GET | `/grievances` | Authenticated | Role-scoped list; optional district/category/status/priority filters |
| PATCH | `/grievances/:id/assign` | CMO admin | Assign `departmentId`, optional `priority,remarks` |
| PATCH | `/grievances/:id/status` | CMO/officer | Update `status,remarks,actionReport` |
| POST | `/grievances/:id/feedback` | Citizen | Submit `rating` (1–5) and optional comments for own resolved grievance |
| GET | `/cmo/stats` | CMO admin | Totals and district/department group counts |
| POST | `/contact` | Public | Save contact enquiry (`name,email,subject,message`) |

## Example login
Request: `POST /auth/login`
```json
{"email":"admin@cmkerala.demo","password":"Demo@12345"}
```
Response: `{ "token": "<JWT>", "user": { "id": "...", "name": "CMO Demo Admin", "role": "CMO_ADMIN" } }`

## Example status update
`PATCH /grievances/:id/status`
```json
{"status":"IN_PROGRESS","remarks":"Inspection scheduled with field team."}
```

## Example AI response
```json
{"category":"Roads and Infrastructure","department":"Public Works Department","priority":"MEDIUM","summary":"Road damage reported near the junction.","source":"Gemini AI","fallback":false}
```

Errors use JSON `{ "error": "message" }` with standard HTTP status codes. File uploads accept JPG, PNG and PDF, max 5 MB each, up to three files.
