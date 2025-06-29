/**
 * Slash Command Parser for Chat/Comments
 * Handles /poll, /quiz, and /rating commands
 */

export interface ParsedCommand {
  type: 'poll' | 'quiz' | 'rating';
  question: string;
  options: string[];
  correctAnswerIndex?: number; // For quiz, index of correct answer
  isValid: boolean;
  error?: string;
}

/**
 * Check if a message is a slash command
 */
export function isSlashCommand(message: string): boolean {
  return message.trim().startsWith('/');
}

/**
 * Parse a slash command message
 */
export function parseSlashCommand(message: string): ParsedCommand | null {
  const trimmed = message.trim();
  
  if (!isSlashCommand(trimmed)) {
    return null;
  }

  // Extract command type
  const parts = trimmed.split(' ');
  const command = parts[0].toLowerCase();
  const content = trimmed.substring(command.length).trim();

  switch (command) {
    case '/poll':
      return parsePollCommand(content);
    case '/quiz':
      return parseQuizCommand(content);
    case '/rating':
      return parseRatingCommand(content);
    default:
      return {
        type: 'poll',
        question: '',
        options: [],
        isValid: false,
        error: `Unknown command: ${command}. Available commands: /poll, /quiz, /rating`
      };
  }
}

/**
 * Parse /poll command
 * Format: /poll Question here? Option1, Option2, Option3, Option4
 */
function parsePollCommand(content: string): ParsedCommand {
  if (!content.includes('?')) {
    return {
      type: 'poll',
      question: '',
      options: [],
      isValid: false,
      error: 'Poll question must end with a question mark (?)'
    };
  }

  const [questionPart, optionsPart] = content.split('?', 2);
  const question = questionPart.trim();
  
  if (!question) {
    return {
      type: 'poll',
      question: '',
      options: [],
      isValid: false,
      error: 'Poll question cannot be empty'
    };
  }

  if (!optionsPart || !optionsPart.trim()) {
    return {
      type: 'poll',
      question,
      options: [],
      isValid: false,
      error: 'Poll options are required after the question'
    };
  }

  const options = optionsPart
    .split(',')
    .map(option => option.trim())
    .filter(option => option.length > 0);

  if (options.length < 2) {
    return {
      type: 'poll',
      question,
      options,
      isValid: false,
      error: 'Poll must have at least 2 options'
    };
  }

  if (options.length > 6) {
    return {
      type: 'poll',
      question,
      options: options.slice(0, 6),
      isValid: false,
      error: 'Poll can have maximum 6 options'
    };
  }

  return {
    type: 'poll',
    question,
    options,
    isValid: true
  };
}

/**
 * Parse /quiz command
 * Format: /quiz Question here? CorrectAnswer, WrongAnswer1, WrongAnswer2, WrongAnswer3
 */
function parseQuizCommand(content: string): ParsedCommand {
  if (!content.includes('?')) {
    return {
      type: 'quiz',
      question: '',
      options: [],
      isValid: false,
      error: 'Quiz question must end with a question mark (?)'
    };
  }

  const [questionPart, optionsPart] = content.split('?', 2);
  const question = questionPart.trim();
  
  if (!question) {
    return {
      type: 'quiz',
      question: '',
      options: [],
      isValid: false,
      error: 'Quiz question cannot be empty'
    };
  }

  if (!optionsPart || !optionsPart.trim()) {
    return {
      type: 'quiz',
      question,
      options: [],
      isValid: false,
      error: 'Quiz options are required after the question'
    };
  }

  const options = optionsPart
    .split(',')
    .map(option => option.trim())
    .filter(option => option.length > 0);

  if (options.length < 2) {
    return {
      type: 'quiz',
      question,
      options,
      isValid: false,
      error: 'Quiz must have at least 2 options'
    };
  }

  if (options.length > 6) {
    return {
      type: 'quiz',
      question,
      options: options.slice(0, 6),
      isValid: false,
      error: 'Quiz can have maximum 6 options'
    };
  }

  return {
    type: 'quiz',
    question,
    options,
    correctAnswerIndex: 0, // First option is correct
    isValid: true
  };
}

/**
 * Parse /rating command
 * Format: /rating Question or description here
 */
function parseRatingCommand(content: string): ParsedCommand {
  const question = content.trim();
  
  if (!question) {
    return {
      type: 'rating',
      question: '',
      options: [],
      isValid: false,
      error: 'Rating description cannot be empty'
    };
  }

  if (question.length > 200) {
    return {
      type: 'rating',
      question: question.substring(0, 200),
      options: [],
      isValid: false,
      error: 'Rating description must be 200 characters or less'
    };
  }

  return {
    type: 'rating',
    question,
    options: ['1', '2', '3', '4', '5'], // 5-star rating
    isValid: true
  };
}

/**
 * Get command suggestions as user types
 */
export function getCommandSuggestions(input: string): string[] {
  const commands = ['/poll', '/quiz', '/rating'];
  
  if (!input.startsWith('/')) {
    return [];
  }

  const partial = input.toLowerCase();
  return commands.filter(cmd => cmd.startsWith(partial));
}

/**
 * Validate if user has permission to use command
 */
export function canUseCommand(command: string, userRole?: string, isLive?: boolean): boolean {
  switch (command) {
    case '/poll':
      return true; // Available in both live and VOD for all users
    case '/quiz':
      if (isLive) {
        // In live streams, only admins/moderators can create quiz
        return userRole === 'admin' || userRole === 'moderator';
      }
      return true; // Available in VOD for all users
    case '/rating':
      return !isLive; // Only available in VOD for all users
    default:
      return false;
  }
}