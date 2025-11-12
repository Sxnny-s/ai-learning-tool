import type { SupabaseClient } from '@supabase/supabase-js';
import { createDatabaseError } from '../middleware/error-handler';

/**
 * Llama 3.1 Chat Message Format
 * Each message has a role ('system', 'user', 'assistant') and content
 */
export interface LlamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/**
 * Conversation Summary Interface
 */
export interface ConversationSummary {
  id: string;
  session_id: string;
  summary_text: string;
  created_at: string;
}

/**
 * Options for build_prompt function
 */
export interface BuildPromptOptions {
  /** Number of recent conversation turns to include (default: 10) */
  k?: number;
  /** Maximum number of summaries to include (default: 10) */
  maxSummaries?: number;
  /** Optional session ID - if not provided, uses most recent active session */
  sessionId?: string;
  /** System prompt to prepend to messages */
  systemPrompt?: string;
}

/**
 * Builds a chat prompt with memory (conversation history + summaries)
 * formatted for Llama 3.1 chat template
 * 
 * @param supabase - Supabase client instance
 * @param userId - User ID to fetch conversation history for
 * @param userMsg - Current user message to append
 * @param options - Configuration options
 * @returns Array of messages formatted for Llama 3.1
 */
export async function build_prompt(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>,
  userId: string,
  userMsg: string,
  options: BuildPromptOptions = {}
): Promise<LlamaMessage[]> {
  const {
    k = 10,
    maxSummaries = 10,
    sessionId,
    systemPrompt = `You are an AI tutor for Resilient Coders students learning full-stack JavaScript development. 
      
      Your role is to:
      - Provide clear, helpful explanations about JavaScript, React, TypeScript, HTML, CSS, and web development concepts
      - Break down complex topics into digestible parts
      - Give practical examples and code snippets when helpful
      - Encourage learning and problem-solving
      - Adapt your explanations to the student's level of understanding
      - Ask follow-up questions to ensure comprehension
      
      Keep your responses focused on web development topics and maintain an encouraging, supportive tone.`
  } = options;

  const messages: LlamaMessage[] = [];

  // 1. Add system prompt
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }

  // 2. Get or determine session ID
  let activeSessionId = sessionId;
  
  if (!activeSessionId) {
    // Get the most recent active session for the user
    const { data: sessions, error: sessionError } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('last_activity_at', { ascending: false })
      .limit(1)
      .single();

    if (sessionError || !sessions) {
      // If no active session exists, we'll just use the summaries and current message
      // This is fine for new conversations
    } else {
      activeSessionId = sessions.id;
    }
  }

  // 3. Pull last k conversation turns (or whole chat history if k is large)
  if (activeSessionId) {
    const { data: chatMessages, error: messagesError } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', activeSessionId)
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(k * 2); // Get k turns (each turn = user + assistant, so k*2 messages)

    if (messagesError) {
      throw createDatabaseError('Failed to fetch conversation history', { 
        originalError: messagesError 
      });
    }

    if (chatMessages && chatMessages.length > 0) {
      // Take the last k turns (last k*2 messages, or all if less)
      const recentMessages = chatMessages.slice(-k * 2);
      
      // Convert to Llama format
      for (const msg of recentMessages) {
        messages.push({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content
        });
      }
    }
  }

  // 4. Pull all summaries (m ≤ maxSummaries)
  const summaries: ConversationSummary[] = [];
  
  try {
    // Check if conversation_summaries table exists
    // If it doesn't exist yet, this will gracefully handle the error
    const { data: summariesData, error: summariesError } = await supabase
      .from('conversation_summaries')
      .select('id, session_id, summary_text, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(maxSummaries);

    if (!summariesError && summariesData) {
      summaries.push(...summariesData.map(s => ({
        id: s.id,
        session_id: s.session_id,
        summary_text: s.summary_text,
        created_at: s.created_at
      })));
    }
    // If table doesn't exist, we silently continue (summaries will be empty)
  } catch {
    // Table might not exist yet - that's okay, we'll just skip summaries
    // In production, you might want to log this
  }

  // 5. Add summaries as context (if any exist)
  if (summaries.length > 0) {
    const summariesText = summaries
      .map(s => `[Previous conversation summary from ${new Date(s.created_at).toLocaleDateString()}]: ${s.summary_text}`)
      .join('\n\n');
    
    // Insert summaries after system prompt but before conversation history
    // We'll add it as a system message for context
    if (messages.length > 0 && messages[0].role === 'system') {
      // Append to existing system prompt
      messages[0].content += `\n\n## Previous Conversation Context:\n${summariesText}`;
    } else {
      // Insert as a new system message
      messages.unshift({
        role: 'system',
        content: `## Previous Conversation Context:\n${summariesText}`
      });
    }
  }

  // 6. Add current user message
  messages.push({
    role: 'user',
    content: userMsg
  });

  return messages;
}

