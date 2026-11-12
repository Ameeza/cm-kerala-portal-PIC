# 06 – Setup and Testing

## Local setup
See root `README.md`. Requires Node.js 20+, npm and PostgreSQL. Copy `server/.env.example`? The supplied template is the root `.env.example`; copy it to `server/.env` and set values.

## Environment variables
- `PORT`: API listen port (default 5000)
- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: long random signing secret
- `CLIENT_ORIGIN`: allowed frontend origin
- `GEMINI_API_KEY`: optional Gemini API key
- `VITE_API_URL`: frontend API base URL, e.g. `http://localhost:5000/api`

## Manual test cases
1. Open public home/about/how/departments/FAQ pages.
2. Register a new citizen; verify login and logout.
3. Submit a grievance with all required fields and a JPG/PDF attachment; verify reference ID.
4. Track the reference in a signed-out browser; verify status and history.
5. Sign in as CMO admin; filter records, inspect grievance and assign Public Works department.
6. Sign in as department officer; verify only assigned department queue is shown; add remarks and action report; change status.
7. Sign in as CMO; review officer update and mark resolved.
8. Verify citizen sees latest status/history; test feedback endpoint for a resolved grievance.
9. Submit contact enquiry and verify success response/database record.
10. Test AI with a valid Gemini key and without a key; verify source/fallback label.
11. Test invalid login, unauthorized role access, unsupported file type and file larger than 5 MB.
12. Run `npm run build --prefix client` and check browser console/API logs.

## Known demo limitations
Local file storage is not durable on ephemeral hosting. Public reference tracking returns status history; review privacy exposure before production. Overdue/SLA policy, email/SMS notifications, password reset, OTP, antivirus scanning and full audit/retention policies are not implemented in this assessment MVP.
