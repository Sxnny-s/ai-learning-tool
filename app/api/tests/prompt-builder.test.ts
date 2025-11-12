/**
 * Unit tests for build_prompt function
 */

import { build_prompt } from '@/lib/chat/prompt-builder';
import type { SupabaseClient } from '@supabase/supabase-js';

// Mock Supabase client
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createMockSupabaseClient = (): SupabaseClient<any> => {
  const mockClient = {
    from: jest.fn(),
    auth: {
      getUser: jest.fn(),
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as unknown as SupabaseClient<any>;

  return mockClient;
};

describe('build_prompt', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: SupabaseClient<any>;
  const userId = 'test-user-id';
  const userMsg = 'What is React?';

  beforeEach(() => {
    mockSupabase = createMockSupabaseClient();
    jest.clearAllMocks();
  });

  it('should return messages with system prompt and user message when no history exists', async () => {
    // Mock: No active session
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    });

    const messages = await build_prompt(mockSupabase, userId, userMsg);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('AI tutor');
    expect(messages[1].role).toBe('user');
    expect(messages[1].content).toBe(userMsg);
  });

  it('should include conversation history when session exists', async () => {
    const sessionId = 'test-session-id';
    const mockHistory = [
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'Hi there!' },
      { role: 'user', content: 'How are you?' },
      { role: 'assistant', content: 'I am doing well!' },
    ];

    // Mock: Active session exists
    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: sessionId },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'chat_messages') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: mockHistory,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'conversation_summaries') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const messages = await build_prompt(mockSupabase, userId, userMsg, {
      sessionId,
      k: 10,
    });

    expect(messages.length).toBeGreaterThan(2);
    expect(messages[0].role).toBe('system');
    expect(messages[messages.length - 1].role).toBe('user');
    expect(messages[messages.length - 1].content).toBe(userMsg);
    
    // Check that history is included
    const historyMessages = messages.slice(1, -1);
    expect(historyMessages.length).toBe(mockHistory.length);
  });

  it('should limit conversation history to k turns', async () => {
    const sessionId = 'test-session-id';
    const k = 3;
    // Create 10 turns (20 messages)
    const mockHistory = Array.from({ length: 20 }, (_, i) => ({
      role: i % 2 === 0 ? 'user' : 'assistant',
      content: `Message ${i}`,
    }));

    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: { id: sessionId },
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'chat_messages') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({
                    data: mockHistory,
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'conversation_summaries') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: [],
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const messages = await build_prompt(mockSupabase, userId, userMsg, {
      sessionId,
      k,
    });

    // Should have: system prompt + last k*2 messages + user message
    // Last k*2 = 6 messages, so total should be 1 (system) + 6 (history) + 1 (user) = 8
    const historyMessages = messages.slice(1, -1);
    expect(historyMessages.length).toBe(k * 2);
  });

  it('should include summaries when they exist', async () => {
    const mockSummaries = [
      {
        id: 'summary-1',
        session_id: 'session-1',
        summary_text: 'Previous conversation about React hooks',
        created_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'summary-2',
        session_id: 'session-2',
        summary_text: 'Discussion about TypeScript types',
        created_at: '2024-01-02T00:00:00Z',
      },
    ];

    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'conversation_summaries') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({
                  data: mockSummaries,
                  error: null,
                }),
              }),
            }),
          }),
        };
      }
      return {};
    });

    const messages = await build_prompt(mockSupabase, userId, userMsg);

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toContain('Previous Conversation Context');
    expect(messages[0].content).toContain('React hooks');
    expect(messages[0].content).toContain('TypeScript types');
  });

  it('should handle custom system prompt', async () => {
    const customPrompt = 'You are a helpful coding assistant.';

    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    });

    const messages = await build_prompt(mockSupabase, userId, userMsg, {
      systemPrompt: customPrompt,
    });

    expect(messages[0].role).toBe('system');
    expect(messages[0].content).toBe(customPrompt);
  });

  it('should gracefully handle missing conversation_summaries table', async () => {
    (mockSupabase.from as jest.Mock).mockImplementation((table: string) => {
      if (table === 'chat_sessions') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockReturnValue({
                    single: jest.fn().mockResolvedValue({
                      data: null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        };
      }
      if (table === 'conversation_summaries') {
        throw new Error('Table does not exist');
      }
      return {};
    });

    // Should not throw error
    const messages = await build_prompt(mockSupabase, userId, userMsg);

    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('system');
    expect(messages[1].role).toBe('user');
  });

  it('should return messages in Llama 3.1 format', async () => {
    (mockSupabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                single: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          }),
        }),
      }),
    });

    const messages = await build_prompt(mockSupabase, userId, userMsg);

    // Verify Llama 3.1 format
    messages.forEach((msg) => {
      expect(msg).toHaveProperty('role');
      expect(msg).toHaveProperty('content');
      expect(['system', 'user', 'assistant']).toContain(msg.role);
      expect(typeof msg.content).toBe('string');
    });
  });
});

