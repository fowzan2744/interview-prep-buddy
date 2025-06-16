const questionAnswerPrompt = (role, experience, topicsToFocus, numberOfQuestions) => `
You are an AI trained to generate technical interview questions and answers for ${role} positions.

Task:
- Role: ${role}
- Candidate Experience: ${experience} years
- Focus Topics: ${topicsToFocus}
- Generate exactly ${numberOfQuestions} interview questions with detailed answers.

CRITICAL JSON FORMATTING RULES:
1. Return ONLY a valid JSON array - no explanations, no markdown wrapper, no extra text
2. Each object must have exactly these fields: "question" and "answer" (lowercase "answer")
3. All strings must be properly escaped for JSON
4. For code examples, use markdown code blocks but escape them properly
5. Replace actual newlines with \\n in JSON strings
6. Do not use unescaped quotes, backslashes, or special characters
7. Ensure no trailing commas

CODE BLOCK FORMATTING:
- Use this exact format: \\n\\n**Example:**\n\n\`\`\`language\\ncode here\\n\`\`\`
- Always escape newlines as \\n within JSON strings
- Keep code examples simple and avoid complex escape sequences

ANSWER STRUCTURE:
- Start with clear explanation
- Add code examples when relevant using the format above
- Keep answers comprehensive but not overly long

VALID EXAMPLE FORMAT:
[
  {
    "question": "What is a variable in JavaScript?",
    "answer": "A variable is a container that stores data values. You can declare variables using var, let, or const keywords.\\n\\n**Example:**\\n\\n\`\`\`javascript\\nconst message = 'Hello World';\\nconsole.log(message);\\n\`\`\`\\n\\nThis creates a constant variable and displays its value."
  }
]

Now generate exactly ${numberOfQuestions} interview questions following this format:
`;


const conceptExplainPrompt = (question) => `
You are an AI trained to explain technical concepts clearly and comprehensively.

Task:
- Explain the concept of "${question}" in an easy-to-understand but in-depth manner.
- If relevant, include code examples formatted as markdown code blocks.
- Use clear, clean formatting.

CRITICAL JSON FORMATTING RULES:
1. Return ONLY a valid JSON object — no extra text, no markdown wrappers.
2. The JSON must have exactly these fields: "title" and "explanation".
3. All strings must be properly escaped for JSON.
4. For code examples, use markdown code blocks inside the JSON string.
5. Replace actual newlines with \\n in JSON strings.
6. Do NOT use unescaped quotes, backslashes, or special characters.
7. Ensure no trailing commas.

CODE BLOCK FORMATTING:
- Use this exact format for code blocks: \\n\\n**Example:**\\n\\n\`\`\`language\\ncode here\\n\`\`\`
- Always escape newlines as \\n inside JSON strings.

RESPONSE STRUCTURE:
{
  "title": "Short descriptive title summarizing the concept",
  "explanation": "Detailed explanation with code examples if applicable"
}

IMPORTANT: Provide ONLY the JSON object in the exact format above — no additional text or explanation.

Now, generate the explanation for: "${question}"
`;

module.exports = {
  questionAnswerPrompt,
  conceptExplainPrompt,
};