# 05 – AI Integration

## Provider and workflow
When `GEMINI_API_KEY` is present, the backend calls gemini-3.5-flash-lite (`generateContent`) and requests JSON containing category, department, priority and short summary. The prompt asks the model to select from the application's category list and return a suggested department.

## Human safeguards
- AI output is a suggestion only. CMO staff remain responsible for official priority and department assignment.
- Citizen can inspect suggestions before submission and selectively apply category/priority.
- API response labels the provider and whether fallback mode was used.
- API key is stored server-side in an environment variable, never committed.

## Fallback and limitation
Without a Gemini key, the application uses a deterministic keyword ruleset. The response is explicitly labelled `Local keyword fallback (not AI)` and `fallback: true`. This is not an LLM and must not be presented as completed AI integration. Network/API failures also fall back to the labelled ruleset. Configure a valid key and verify provider responses before demonstrating AI as live.

## Example prompt
Analyse this citizen grievance. Return only JSON with category, department, priority (LOW/MEDIUM/HIGH), summary. Categories are constrained to the application's list. Do not make official decisions. Complaint: [citizen text].
