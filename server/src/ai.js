
const categories = [
  'Roads and Infrastructure',
  'Healthcare',
  'Education',
  'Water Supply',
  'Electricity',
  'Sanitation',
  'Public Services',
  'Other'
];

const departmentMap = {
  'Roads and Infrastructure': 'Public Works Department',
  'Healthcare': 'Health and Family Welfare',
  'Education': 'General Education',
  'Water Supply': 'Water Resources',
  'Electricity': 'Power Department',
  'Sanitation': 'Local Self Government',
  'Public Services': 'Revenue Department',
  'Other': 'Local Self Government'
};

export async function analyseGrievance(description) {
  const key = process.env.GEMINI_API_KEY?.trim();

  // 1. Try Gemini AI first
  if (key) {
    try {
      const response = await fetch(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': key
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Analyse the following citizen grievance.

Return ONLY valid JSON with these four keys:
category, department, priority, summary.

Allowed categories:
${categories.join(', ')}

Department mapping:
${JSON.stringify(departmentMap)}

Priority must be one of:
LOW, MEDIUM, HIGH.

Instructions:
- Select the most appropriate category.
- Select the corresponding department from the department mapping.
- HIGH: Immediate danger, emergency, serious public safety or health risk.
- MEDIUM: Repeated complaints, prolonged disruption or significant inconvenience.
- LOW: Routine complaints without immediate risk.
- Write a short and clear summary.
- Do not invent facts.
- Do not make official decisions.

Complaint:
${description}`
                  }
                ]
              }
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          })
        }
      );

      const responseText = await response.text();

      if (!response.ok) {
        console.error(
          'Gemini API HTTP error:',
          response.status,
          responseText
        );

        throw new Error(`Gemini API returned HTTP ${response.status}`);
      }

      const data = JSON.parse(responseText);

      const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!raw) {
        console.error('Gemini returned no text:', responseText);
        throw new Error('Gemini returned an empty response');
      }

      const parsed = JSON.parse(raw);

      // Validate Gemini's response
      if (
        !categories.includes(parsed.category) ||
        !['LOW', 'MEDIUM', 'HIGH'].includes(parsed.priority) ||
        typeof parsed.summary !== 'string' ||
        !parsed.summary.trim()
      ) {
        throw new Error('Gemini returned an invalid analysis format');
      }

      // Use our department mapping to ensure consistency
      return {
        category: parsed.category,
        department: departmentMap[parsed.category],
        priority: parsed.priority,
        summary: parsed.summary.trim(),
        source: 'Gemini AI',
        fallback: false
      };

    } catch (error) {
      console.error('Gemini AI error:', error.message);
    }
  } else {
    console.error('GEMINI_API_KEY is missing from server environment');
  }

  // 2. Local keyword fallback if Gemini is unavailable
  // This is rule-based classification, NOT AI.

  const text = description.toLowerCase();

  const rules = [
    [
      'Roads and Infrastructure',
      ['road', 'pothole', 'bridge', 'street', 'footpath']
    ],
    [
      'Healthcare',
      ['hospital', 'doctor', 'medicine', 'clinic', 'health']
    ],
    [
      'Education',
      ['school', 'teacher', 'classroom', 'education']
    ],
    [
      'Water Supply',
      ['water', 'pipeline', 'drinking']
    ],
    [
      'Electricity',
      ['electricity', 'power cut', 'streetlight', 'transformer']
    ],
    [
      'Sanitation',
      ['garbage', 'waste', 'drain', 'sewage']
    ],
    [
      'Public Services',
      ['revenue', 'land record', 'certificate', 'tax', 'pension']
    ]
  ];

  const match = rules.find(([, words]) =>
    words.some(word => text.includes(word))
  );

  const category = match?.[0] || 'Other';

  const priority =
    /danger|accident|emergency|collapsed|no drinking water|life threatening/.test(text)
      ? 'HIGH'
      : /weeks|month|repeated|days/.test(text)
        ? 'MEDIUM'
        : 'LOW';

  return {
    category,
    department: departmentMap[category],
    priority,
    summary: description.trim().slice(0, 180),
    source: 'Local keyword fallback (not AI)',
    fallback: true
  };
}
