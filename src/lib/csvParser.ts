export type MultipleChoiceQuestion = {
  question: string;
  answer_1: string;
  answer_2: string;
  answer_3: string;
  answer_4: string;
  correct_answer: string;
  type: 'multiple_choice';
};

export type TrueFalseQuestion = {
  question: string;
  answer: 'σωστό' | 'λάθος';
  type: 'true_false';
};

export type Question = MultipleChoiceQuestion | TrueFalseQuestion;

/**
 * Parses CSV text into an array of multiple choice questions
 */
export async function parseMultipleChoiceCSV(csvText: string): Promise<MultipleChoiceQuestion[]> {
  // Replace line breaks inside quoted fields with spaces to avoid misinterpretation
  let processedCsv = csvText.replace(/(?<=")(\r?\n|\r)(?!")/g, ' ');
  
  // Split the CSV text into lines and remove empty lines
  const lines = processedCsv.split('\n').filter(line => line.trim() !== '');
  
  // Check if we have data
  if (lines.length <= 1) {
    console.error('CSV file has no data rows or is improperly formatted');
    return [];
  }
  
  // Skip the header
  const dataLines = lines.slice(1);
  const questions: MultipleChoiceQuestion[] = [];
  
  for (const line of dataLines) {
    try {
      // Parse CSV line, respecting quotes
      const values = parseCSVLine(line);
      
      // Validate that we have all required fields
      if (values.length < 6) {
        console.warn('Skipping row with insufficient columns:', values);
        continue;
      }
      
      // Create question object
      const question: MultipleChoiceQuestion = {
        question: values[0],
        answer_1: values[1],
        answer_2: values[2],
        answer_3: values[3],
        answer_4: values[4],
        correct_answer: values[5],
        type: 'multiple_choice'
      };
      
      questions.push(question);
    } catch (error) {
      console.error('Error parsing CSV line:', line, error);
    }
  }
  
  return questions;
}

/**
 * Parses CSV text into an array of true/false questions
 */
export async function parseTrueFalseCSV(csvText: string): Promise<TrueFalseQuestion[]> {
  // Replace line breaks inside quoted fields with spaces to avoid misinterpretation
  let processedCsv = csvText.replace(/(?<=")(\r?\n|\r)(?!")/g, ' ');
  
  // Split the CSV text into lines and remove empty lines
  const lines = processedCsv.split('\n').filter(line => line.trim() !== '');
  
  // Check if we have data
  if (lines.length <= 1) {
    console.error('CSV file has no data rows or is improperly formatted');
    return [];
  }
  
  // Skip the header
  const dataLines = lines.slice(1);
  const questions: TrueFalseQuestion[] = [];
  
  for (const line of dataLines) {
    try {
      // Parse CSV line, respecting quotes
      const values = parseCSVLine(line);
      
      // Validate that we have all required fields
      if (values.length < 2) {
        console.warn('Skipping row with insufficient columns:', values);
        continue;
      }
      
      // Create question object
      const question: TrueFalseQuestion = {
        question: values[0],
        answer: values[1] as 'σωστό' | 'λάθος',
        type: 'true_false'
      };
      
      questions.push(question);
    } catch (error) {
      console.error('Error parsing CSV line:', line, error);
    }
  }
  
  return questions;
}

/**
 * Helper function to parse a single CSV line, respecting quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let currentValue = '';
  let inQuotes = false;
  
  // Extra cleaning of the line - normalize quotes
  // Replace smart/curly quotes with straight quotes
  line = line
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'");
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      // If we encounter an escaped quote (double quote inside quoted string)
      if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
        currentValue += '"';
        i++; // Skip the next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of field if not inside quotes
      result.push(currentValue);
      currentValue = '';
    } else {
      // Add character to current field
      currentValue += char;
    }
  }
  
  // Add the last field
  result.push(currentValue);
  
  // Clean up each value
  return result.map(value => {
    // Remove surrounding quotes if present
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    }
    
    // Remove double quotes used for escaping
    value = value.replace(/""/g, '"');
    
    return value.trim();
  });
}

/**
 * Loads multiple choice questions from a CSV file for a given subject and chapter
 */
export async function loadMultipleChoiceQuestions(
  subject: string,
  chapter: string
): Promise<MultipleChoiceQuestion[]> {
  try {
    // Validate inputs
    if (!subject || !chapter) {
      console.error('Invalid subject or chapter:', { subject, chapter });
      throw new Error('Subject and chapter must be provided');
    }
    
    // Adjust chapter format from "kefalaio_1" to just "1" for filename
    const chapterNumber = chapter.split('_')[1];
    
    if (!chapterNumber) {
      console.error('Invalid chapter format:', chapter);
      throw new Error(`Invalid chapter format: ${chapter}`);
    }
    
    // Build the URL to the CSV file based on subject
    let url = '';
    
    console.log('Loading questions for subject:', subject, 'chapter:', chapter);
    
    if (subject === 'MATH') {
      // MATH files follow pattern: math_1_multiple_choice.csv
      url = `/content/MATH/${chapter}/multiple_choice/math_${chapterNumber}_multiple_choice.csv`;
      console.log('Using MATH-specific path:', url);
    } else if (subject === 'AOTH') {
      // AOTH files follow pattern: aoth_1.csv
      url = `/content/AOTH/${chapter}/multiple_choice/aoth_${chapterNumber}.csv`;
      console.log('Using AOTH-specific path:', url);
    } else {
      console.error('Unknown subject:', subject);
      throw new Error(`Unknown subject: ${subject}`);
    }
    
    console.log('Attempting to load questions from URL:', url);
    
    // Fetch the CSV file
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}:`, response.status, response.statusText);
      throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
    }
    
    // Parse the CSV text
    const csvText = await response.text();
    
    if (!csvText || csvText.trim() === '') {
      console.error('Empty CSV content received');
      throw new Error('Empty CSV content received');
    }
    
    console.log('Successfully loaded CSV with length:', csvText.length);
    
    // Log a sample of the CSV to verify content
    console.log('CSV sample (first 100 chars):', csvText.substring(0, 100));
    
    // Debug: Log the first few lines to help diagnose format issues
    const firstFewLines = csvText.split('\n').slice(0, 3);
    console.log('First few CSV lines:', firstFewLines);
    
    const questions = await parseMultipleChoiceCSV(csvText);
    
    // Debug: Log the first parsed question to verify the structure
    if (questions.length > 0) {
      console.log('First parsed question:', {
        question: questions[0].question,
        answers: [
          questions[0].answer_1,
          questions[0].answer_2,
          questions[0].answer_3,
          questions[0].answer_4
        ],
        correct: questions[0].correct_answer
      });
    }
    
    return questions;
  } catch (error) {
    console.error('Error loading multiple choice questions:', error);
    return [];
  }
}

/**
 * Loads true/false questions from a CSV file for a given subject and chapter
 */
export async function loadTrueFalseQuestions(
  subject: string,
  chapter: string
): Promise<TrueFalseQuestion[]> {
  try {
    // Validate inputs
    if (!subject || !chapter) {
      console.error('Invalid subject or chapter:', { subject, chapter });
      throw new Error('Subject and chapter must be provided');
    }
    
    // Adjust chapter format from "kefalaio_1" to just "1" for filename
    const chapterNumber = chapter.split('_')[1];
    
    if (!chapterNumber) {
      console.error('Invalid chapter format:', chapter);
      throw new Error(`Invalid chapter format: ${chapter}`);
    }
    
    // Build the URL to the CSV file based on subject
    let url = '';
    
    console.log('Loading true/false questions for subject:', subject, 'chapter:', chapter);
    
    if (subject === 'MATH') {
      // MATH files follow pattern: math_1_true_false.csv
      url = `/content/MATH/${chapter}/true_false/math_${chapterNumber}_true_false.csv`;
      console.log('Using MATH-specific path:', url);
    } else if (subject === 'AOTH') {
      // AOTH files follow pattern: aoth_1_true_false.csv
      url = `/content/AOTH/${chapter}/true_false/aoth_${chapterNumber}_true_false.csv`;
      console.log('Using AOTH-specific path:', url);
    } else {
      console.error('Unknown subject:', subject);
      throw new Error(`Unknown subject: ${subject}`);
    }
    
    console.log('Attempting to load true/false questions from URL:', url);
    
    // Fetch the CSV file
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`Failed to fetch from ${url}:`, response.status, response.statusText);
      throw new Error(`Failed to load questions: ${response.status} ${response.statusText}`);
    }
    
    // Parse the CSV text
    const csvText = await response.text();
    
    if (!csvText || csvText.trim() === '') {
      console.error('Empty CSV content received');
      throw new Error('Empty CSV content received');
    }
    
    console.log('Successfully loaded CSV with length:', csvText.length);
    
    // Debug: Log the first few lines to help diagnose format issues
    const firstFewLines = csvText.split('\n').slice(0, 3);
    console.log('First few CSV lines:', firstFewLines);
    
    const questions = await parseTrueFalseCSV(csvText);
    
    // Debug: Log the first parsed question to verify the structure
    if (questions.length > 0) {
      console.log('First parsed true/false question:', {
        question: questions[0].question,
        answer: questions[0].answer,
        type: questions[0].type
      });
    }
    
    return questions;
  } catch (error) {
    console.error('Error loading true/false questions:', error);
    return [];
  }
}

/**
 * Lists all available chapters for a subject
 */
export function getAvailableChapters(subject: string): string[] {
  // This function would ideally fetch available chapters dynamically
  // For now, we'll hardcode the available chapters based on what we know
  if (subject === 'AOTH') {
    return [
      'kefalaio_1',
      'kefalaio_2',
      'kefalaio_3',
      'kefalaio_4',
      'kefalaio_5',
      'kefalaio_7',
      'kefalaio_9',
      'kefalaio_10'
    ];
  } else if (subject === 'MATH') {
    return [
      'kefalaio_1',
      'kefalaio_2',
      'kefalaio_3'
    ];
  }
  
  return [];
}

/**
 * Gets a friendly display name for a chapter
 */
export function getChapterDisplayName(chapter: string): string {
  const parts = chapter.split('_');
  if (parts.length === 2 && parts[0] === 'kefalaio') {
    // Format as "Κεφάλαιο X" with proper Greek capitalization
    return `Κεφάλαιο ${parts[1]}`;
  }
  return chapter;
} 