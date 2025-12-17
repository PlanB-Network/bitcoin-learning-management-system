import { Button, cn } from '@blms/ui';
import { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { BiCollapse, BiExpand, BiRefresh, BiX } from 'react-icons/bi';
import { BsRobot } from 'react-icons/bs';
import { IoSend } from 'react-icons/io5';

import { AuthModalState } from '#src/components/AuthModals/props.js';
import { useAuthModal } from '#src/providers/auth.js';
import { AppContext } from '#src/providers/context.js';
import { isTestnetOrDevelopmentEnvironment } from '#src/utils/misc.js';

interface MentorChatProps {
  chapterId?: string;
  language?: string;
}

interface Message {
  id: string;
  type: 'user' | 'mentor';
  content: string;
  sources?: Array<{ title: string; link: string }>;
  isStreaming?: boolean;
}

export const MentorChat = ({ chapterId, language }: MentorChatProps) => {
  const { t } = useTranslation();
  const { session } = useContext(AppContext);
  const { openAuthModal } = useAuthModal();
  const isLoggedIn = !!session?.user;
  const isEnabled = isTestnetOrDevelopmentEnvironment();

  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Build session key
  const sessionKey = chapterId
    ? `chapter:${chapterId}:${language || 'en'}`
    : `general:${language || 'en'}`;

  // Load conversation history when opening chat
  useEffect(() => {
    if (isOpen && !historyLoaded) {
      loadHistory();
    }
  }, [isOpen, historyLoaded, sessionKey]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadHistory = async () => {
    try {
      const response = await fetch(
        `/api/mentor/history?sessionKey=${encodeURIComponent(sessionKey)}`,
      );
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(
            data.messages.map((msg: any) => ({
              id: msg.id,
              type: msg.type === 'assistant' ? 'mentor' : msg.type,
              content: msg.content,
            })),
          );
        }
      }
    } catch (err) {
      console.error('[MentorChat] Failed to load history:', err);
    } finally {
      setHistoryLoaded(true);
    }
  };

  const handleReset = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/mentor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: 'RESET',
          language: language || 'en',
          chapterId,
        }),
      });

      if (response.ok) {
        // Clear local messages
        setMessages([]);
        setError(null);
      }
    } catch (err) {
      console.error('[MentorChat] Reset error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    const userQuestion = question.trim();
    setQuestion('');
    setError(null);

    // Add user message
    const userMessageId = `user-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: userMessageId, type: 'user', content: userQuestion },
    ]);

    // Add placeholder for mentor response
    const mentorMessageId = `mentor-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      { id: mentorMessageId, type: 'mentor', content: '', isStreaming: true },
    ]);

    setIsLoading(true);

    // Cancel any previous request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/mentor/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userQuestion,
          language: language || 'en',
          chapterId,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Check if it's a non-streaming JSON response
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const data = await response.json();
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === mentorMessageId
              ? {
                  ...msg,
                  content: data.answer,
                  sources: data.sources,
                  isStreaming: false,
                }
              : msg,
          ),
        );
        setIsLoading(false);
        return;
      }

      // Process SSE stream
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response stream');

      const decoder = new TextDecoder();
      let buffer = '';
      let sources: Array<{ title: string; link: string }> = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));

            if (data.type === 'sources') {
              sources = data.sources;
            } else if (data.type === 'token') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === mentorMessageId
                    ? { ...msg, content: msg.content + data.content }
                    : msg,
                ),
              );
            } else if (data.type === 'done') {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === mentorMessageId
                    ? {
                        ...msg,
                        // Remove source citation from displayed content
                        content: msg.content
                          .replace(/\[Sources?:\s*[\d,\s]+\]/gi, '')
                          .trim(),
                        sources,
                        isStreaming: false,
                      }
                    : msg,
                ),
              );
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch {
            // Skip malformed JSON lines
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;

      console.error('[MentorChat] Error:', err);
      setError(t('mentor.error'));

      // Remove the empty mentor message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== mentorMessageId));
    } finally {
      setIsLoading(false);
    }
  };

  // Only show on testnet or development environment
  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-28 right-10 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-lg transition-all hover:bg-orange-600 hover:scale-110"
          aria-label={t('mentor.openChat')}
        >
          <BsRobot size={24} />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col rounded-lg border border-gray-200 bg-white shadow-2xl transition-all duration-300',
            isExpanded
              ? 'bottom-4 right-4 left-4 top-4 md:bottom-10 md:right-10 md:left-auto md:top-auto md:h-[80vh] md:w-[600px]'
              : 'bottom-28 right-10 h-[500px] w-[380px]',
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 bg-orange-500 px-4 py-3 text-white rounded-t-lg">
            <div className="flex items-center gap-2">
              <BsRobot size={20} />
              <h3 className="font-semibold">{t('mentor.title')}</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleReset}
                disabled={isLoading || messages.length === 0}
                className="hover:bg-orange-600 rounded p-1 transition-colors disabled:opacity-50"
                aria-label={t('mentor.reset')}
                title={t('mentor.reset')}
              >
                <BiRefresh size={20} />
              </button>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hover:bg-orange-600 rounded p-1 transition-colors"
                aria-label={
                  isExpanded ? t('mentor.collapse') : t('mentor.expand')
                }
              >
                {isExpanded ? <BiCollapse size={20} /> : <BiExpand size={20} />}
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="hover:bg-orange-600 rounded p-1 transition-colors"
                aria-label={t('mentor.close')}
              >
                <BiX size={24} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {!isLoggedIn && (
              <div className="text-center text-gray-500 mt-8">
                <BsRobot size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm mb-4">{t('mentor.loginRequired')}</p>
                <button
                  type="button"
                  onClick={() => openAuthModal(AuthModalState.Register)}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  {t('auth.signIn')}
                </button>
              </div>
            )}

            {isLoggedIn && messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <BsRobot size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-sm">{t('mentor.welcome')}</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.type === 'user' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-4 py-2',
                    message.type === 'user'
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-900',
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">
                    {message.content}
                    {message.isStreaming && (
                      <span className="inline-block w-2 h-4 ml-1 bg-gray-400 animate-pulse" />
                    )}
                  </p>

                  {message.sources &&
                    message.sources.length > 0 &&
                    !message.isStreaming && (
                      <div className="mt-2 pt-2 border-t border-gray-300">
                        <p className="text-xs font-semibold mb-1">
                          {t('mentor.sources')}
                        </p>
                        {message.sources.map((source) => (
                          <a
                            key={source.link}
                            href={source.link}
                            className="block text-xs text-blue-600 hover:underline mb-1"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    )}
                </div>
              </div>
            ))}

            {error && (
              <div className="flex justify-start">
                <div className="bg-red-100 rounded-lg px-4 py-2 max-w-[80%]">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="border-t border-gray-200 p-4"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={t('mentor.placeholder')}
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                maxLength={500}
                disabled={isLoading || !isLoggedIn}
              />
              <Button
                type="submit"
                disabled={!question.trim() || isLoading || !isLoggedIn}
                className="bg-orange-500 hover:bg-orange-600 text-white px-4"
              >
                <IoSend size={18} />
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
