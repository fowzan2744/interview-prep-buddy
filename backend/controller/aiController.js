const { GoogleGenerativeAI } = require('@google/generative-ai');
const { conceptExplainPrompt, questionAnswerPrompt } = require('../utils/prompts');
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.generateInterviewQuestion = async (req, res) => {
  try {
    const { role, experience, topicsToFocus, numberOfQuestions } = req.body;
    
    if (!role || !experience || !topicsToFocus || !numberOfQuestions) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all the required fields'
      });
    }

    const prompt = questionAnswerPrompt(role, experience, topicsToFocus, numberOfQuestions);
    const model = ai.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log("Raw Text from Gemini:", rawText);

    // Try multiple parsing strategies
    let data;
    
    // Strategy 1: Try to find JSON block first
    const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
    if (jsonMatch) {
      try {
        data = JSON.parse(jsonMatch[1]);
      } catch (parseError) {
        console.log("Failed to parse JSON block, trying cleanup...");
        // Strategy 2: Clean up common issues
        const cleanedJson = cleanupJsonString(jsonMatch[1]);
        data = JSON.parse(cleanedJson);
      }
    } else {
      // Strategy 3: Try to find JSON array directly
      const arrayMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) {
        const cleanedJson = cleanupJsonString(arrayMatch[0]);
        data = JSON.parse(cleanedJson);
      } else {
        throw new Error("Could not locate valid JSON in the response.");
      }
    }

    // Validate the structure
    if (!Array.isArray(data)) {
      throw new Error("Response is not a valid array");
    }

    // Validate each question object
    for (let i = 0; i < data.length; i++) {
      if (!data[i].question || !data[i].answer) {
        throw new Error(`Question ${i + 1} is missing required fields (question or answer)`);
      }
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error parsing Gemini output:", error);
    console.error("Error details:", error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error generating interview question',
      error: error.message
    });
  }
};

// Enhanced helper function to clean up JSON strings with code blocks
function cleanupJsonString(jsonStr) {
  try {
    // First, let's fix the structure by properly escaping newlines within string values
    let cleaned = jsonStr;
    
    // Step 1: Fix common field name issues (like "Answer" vs "answer")
    cleaned = cleaned.replace(/"Answer"(\s*:)/g, '"answer"$1');
    
    // Step 2: Handle newlines within JSON string values
    // This regex finds strings that contain unescaped newlines and fixes them
    cleaned = cleaned.replace(/"([^"]*(?:\\.[^"]*)*)"(\s*[:,\]}])/g, (match, content, suffix) => {
      // Only process if this looks like a JSON value (has : or closing bracket after)
      if (suffix.includes(':') || suffix.includes('}') || suffix.includes(']')) {
        // Escape newlines, tabs, and other special characters within the string
        const escapedContent = content
          .replace(/\\/g, '\\\\')  // Escape backslashes first
          .replace(/\n/g, '\\n')   // Escape newlines
          .replace(/\r/g, '\\r')   // Escape carriage returns
          .replace(/\t/g, '\\t')   // Escape tabs
          .replace(/"/g, '\\"');   // Escape quotes
        
        return `"${escapedContent}"${suffix}`;
      }
      return match;
    });
    
    // Step 3: Remove trailing commas
    cleaned = cleaned.replace(/,(\s*[}\]])/g, '$1');
    
    // Step 4: Ensure proper spacing
    cleaned = cleaned.trim();
    
    return cleaned;
  } catch (error) {
    console.error('Error in cleanup function:', error);
    // Fallback: try a more aggressive approach
    return jsonStr
      .replace(/"Answer"(\s*:)/g, '"answer"$1')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/,(\s*[}\]])/g, '$1')
      .trim();
  }
}


exports.generateInterviewExplanation = async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({
        success: false,
        message: 'Please provide the question'
      });
    }

    const prompt = conceptExplainPrompt(question);
    const model = ai.getGenerativeModel({ model: "models/gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    console.log("Raw Text from Gemini:", rawText);

    const data = parseGeminiResponse(rawText);

    // Validate the structure
    if (!data || typeof data !== 'object') {
      throw new Error("Response is not a valid object");
    }

    // Validate required fields
    if (!data.title || !data.explanation) {
      throw new Error("Explanation object is missing required fields (title or explanation)");
    }

    res.status(200).json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error("Error parsing Gemini explanation output:", error);
    console.error("Error details:", error.message);
    
    res.status(500).json({
      success: false,
      message: 'Error generating interview explanation',
      error: error.message
    });
  }
};

function parseGeminiResponse(rawText) {
  const strategies = [
    // Strategy 1: Parse JSON block
    () => {
      const jsonMatch = rawText.match(/```json\s*([\s\S]*?)\s*```/i);
      if (jsonMatch) {
        console.log("Found JSON block, attempting to parse...");
        return JSON.parse(jsonMatch[1]);
      }
      throw new Error("No JSON block found");
    },

    // Strategy 2: Parse direct JSON object
    () => {
      console.log("Trying to find JSON object directly...");
      const trimmed = rawText.trim();
      if (trimmed.startsWith('{') && trimmed.includes('"title"') && trimmed.includes('"explanation"')) {
        return JSON.parse(trimmed);
      }
      throw new Error("No direct JSON object found");
    },

    // Strategy 3: Extract using robust pattern matching
    () => {
      console.log("Using pattern matching extraction...");
      return extractUsingPatterns(rawText);
    },

    // Strategy 4: Manual field extraction (most robust)
    () => {
      console.log("Using manual field extraction...");
      return extractFieldsManually(rawText);
    }
  ];

  let lastError;
  for (const strategy of strategies) {
    try {
      const result = strategy();
      console.log("Successfully parsed with strategy");
      return result;
    } catch (error) {
      lastError = error;
      console.log(`Strategy failed: ${error.message}`);
    }
  }

  // If all strategies fail, throw the last error
  throw lastError || new Error("All parsing strategies failed");
}

function extractUsingPatterns(text) {
  // Find title using multiple possible patterns
  const titlePatterns = [
    /"title"\s*:\s*"([^"]*(?:\\.[^"]*)*)"/,
    /'title'\s*:\s*'([^']*(?:\\.[^']*)*)'/,
    /title\s*:\s*"([^"]*(?:\\.[^"]*)*)"/i
  ];

  let title = "Explanation";
  for (const pattern of titlePatterns) {
    const match = text.match(pattern);
    if (match) {
      title = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
      break;
    }
  }

  // Find explanation using multiple possible patterns
  const explanationPatterns = [
    /"explanation"\s*:\s*"([\s\S]*?)"\s*[,}]/,
    /'explanation'\s*:\s*'([\s\S]*?)'\s*[,}]/,
    /explanation\s*:\s*"([\s\S]*?)"\s*[,}]/i
  ];

  let explanation = "Unable to parse explanation content.";
  for (const pattern of explanationPatterns) {
    const match = text.match(pattern);
    if (match) {
      explanation = match[1]
        .replace(/\\"/g, '"')
        .replace(/\\n/g, '\n')
        .replace(/\\\\/g, '\\')
        .replace(/\\r/g, '\r')
        .replace(/\\t/g, '\t');
      break;
    }
  }

  return { title, explanation };
}

function extractFieldsManually(text) {
  // Clean up the text first
  let cleaned = text.trim();
  
  // Remove code block markers if present
  cleaned = cleaned.replace(/```json\s*/i, '').replace(/```\s*$/, '');
  
  // Find title
  let title = "Explanation";
  const titleStart = cleaned.toLowerCase().indexOf('"title"');
  if (titleStart !== -1) {
    const colonIndex = cleaned.indexOf(':', titleStart);
    if (colonIndex !== -1) {
      const quoteStart = cleaned.indexOf('"', colonIndex);
      if (quoteStart !== -1) {
        const quoteEnd = findClosingQuote(cleaned, quoteStart + 1);
        if (quoteEnd !== -1) {
          title = cleaned.substring(quoteStart + 1, quoteEnd);
        }
      }
    }
  }

  // Find explanation
  let explanation = "Unable to parse explanation content.";
  const explanationStart = cleaned.toLowerCase().indexOf('"explanation"');
  if (explanationStart !== -1) {
    const colonIndex = cleaned.indexOf(':', explanationStart);
    if (colonIndex !== -1) {
      const quoteStart = cleaned.indexOf('"', colonIndex);
      if (quoteStart !== -1) {
        // For explanation, we need to be more careful about finding the end
        // because it might contain escaped quotes
        const content = extractQuotedContent(cleaned, quoteStart);
        if (content) {
          explanation = content;
        }
      }
    }
  }

  return { title, explanation };
}

function findClosingQuote(str, startIndex) {
  for (let i = startIndex; i < str.length; i++) {
    if (str[i] === '"' && str[i - 1] !== '\\') {
      return i;
    }
  }
  return -1;
}

function extractQuotedContent(str, quoteStart) {
  let content = '';
  let i = quoteStart + 1;
  let escapeNext = false;

  while (i < str.length) {
    const char = str[i];
    
    if (escapeNext) {
      // Handle escaped characters
      switch (char) {
        case 'n': content += '\n'; break;
        case 'r': content += '\r'; break;
        case 't': content += '\t'; break;
        case '\\': content += '\\'; break;
        case '"': content += '"'; break;
        default: content += char; break;
      }
      escapeNext = false;
    } else if (char === '\\') {
      escapeNext = true;
    } else if (char === '"') {
      // Found the closing quote
      return content;
    } else {
      content += char;
    }
    
    i++;
  }
 
  return content;
}