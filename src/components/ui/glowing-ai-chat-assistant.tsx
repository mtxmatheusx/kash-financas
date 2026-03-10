import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Paperclip, Send, Info, Bot, X, FileText, Image as ImageIcon, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Attachment {
  file: File;
  preview?: string;
}

interface FloatingAiAssistantProps {
  onSend?: (message: string, attachments?: Attachment[]) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerBadges?: { label: string; variant: 'primary' | 'accent' }[];
  placeholder?: string;
}

const FloatingAiAssistant = ({
  onSend,
  isLoading = false,
  children,
  title = "AI Assistant",
  subtitle,
  headerBadges = [{ label: "IA", variant: "primary" }],
  placeholder = "Ask anything...",
}: FloatingAiAssistantProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const processFiles = (files: FileList) => {
    const newAttachments: Attachment[] = [];
    Array.from(files).forEach((file) => {
      const att: Attachment = { file };
      if (file.type.startsWith('image/')) {
        att.preview = URL.createObjectURL(file);
      }
      newAttachments.push(att);
    });
    setAttachments((prev) => [...prev, ...newAttachments].slice(0, 5));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
    e.target.value = '';
  };

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => {
      const removed = prev[idx];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const handleSend = () => {
    if ((!message.trim() && attachments.length === 0) || isLoading) return;
    const textToSend = attachments.length > 0
      ? `${message.trim()}\n\n[Anexos: ${attachments.map(a => a.file.name).join(', ')}]`
      : message.trim();
    onSend?.(textToSend, attachments);
    setMessage('');
    setCharCount(0);
    setAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        if (!(event.target as Element)?.closest('.floating-ai-button')) {
          setIsChatOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    return () => {
      attachments.forEach((a) => { if (a.preview) URL.revokeObjectURL(a.preview); });
    };
  }, []);

  const hasContent = message.trim() || attachments.length > 0;

  return (
    <div className="fixed bottom-[76px] right-3 sm:bottom-5 sm:right-5 z-30 flex flex-col items-end gap-3">
      {/* Floating Button */}
      <button
        className="floating-ai-button relative w-12 h-12 sm:w-14 sm:h-14 rounded-full cursor-pointer transition-all duration-500 flex items-center justify-center group"
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(258 60% 52% / 0.9) 100%)',
          boxShadow: '0 0 20px hsl(var(--primary) / 0.7), 0 0 40px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)',
          border: '2px solid hsl(var(--primary-foreground) / 0.2)',
        }}
      >
        <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)' }} />
        <div className="absolute inset-1 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 50%)' }} />
        <span className="relative z-10 text-primary-foreground transition-transform duration-300 group-hover:scale-110">
          {isChatOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bot className="w-5 h-5 sm:w-6 sm:h-6" />}
        </span>
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)', animationDuration: '3s' }}
        />
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div
          className="fixed inset-0 sm:absolute sm:inset-auto sm:bottom-20 sm:right-0 z-50 sm:z-auto"
          ref={chatRef}
        >
          <div
            className="relative w-full h-full sm:w-[400px] sm:max-h-[560px] sm:h-auto sm:rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 30px hsl(var(--primary) / 0.1)',
              animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border/50 shrink-0">
              <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <div
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)' }}
                >
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground truncate">{title}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {headerBadges.map((badge, i) => (
                  <span
                    key={i}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold hidden sm:inline-flex",
                      badge.variant === "primary"
                        ? "bg-primary/15 text-primary"
                        : "bg-fin-investment/15 text-fin-investment"
                    )}
                  >
                    {badge.label}
                  </span>
                ))}
                <button
                  onClick={() => setIsChatOpen(false)}
                  className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronDown className="w-5 h-5 sm:hidden" />
                  <X className="w-4 h-4 hidden sm:block" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto min-h-0">
              {children}
            </div>

            {/* Attachments preview */}
            {attachments.length > 0 && (
              <div className="px-3 sm:px-4 pt-2 flex gap-2 flex-wrap shrink-0">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative group/att flex items-center gap-1.5 bg-muted/60 border border-border/50 rounded-lg px-2 py-1.5 text-xs text-foreground max-w-[120px] sm:max-w-[140px]">
                    {att.preview ? (
                      <img src={att.preview} alt="" className="w-6 h-6 rounded object-cover shrink-0" />
                    ) : (
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="truncate text-[11px]">{att.file.name}</span>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center transition-opacity"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Section */}
            <div className="px-3 sm:px-4 pt-2 sm:pt-3 shrink-0">
              <textarea
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={2}
                className="w-full bg-muted/50 border border-border/50 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none focus:border-primary/50 transition-colors"
              />
            </div>

            {/* Controls */}
            <div className="px-3 sm:px-4 pb-3 sm:pb-4 pt-2 shrink-0 safe-area-bottom">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex items-center gap-0.5 p-0.5 bg-muted/40 rounded-xl border border-border/50">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 sm:p-2.5 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95"
                      aria-label="Anexar arquivo"
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => imageInputRef.current?.click()}
                      className="p-2 sm:p-2.5 rounded-lg transition-all text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95"
                      aria-label="Enviar imagem"
                    >
                      <ImageIcon className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept=".pdf,.csv,.xlsx,.xls,.txt,.doc,.docx"
                    onChange={handleFileChange}
                  />
                  <input
                    ref={imageInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground tabular-nums">
                    {charCount}/{maxChars}
                  </span>
                  <button
                    onClick={handleSend}
                    disabled={!hasContent || isLoading}
                    className="p-2.5 sm:p-3 rounded-xl text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)',
                      boxShadow: hasContent ? '0 4px 15px hsl(var(--primary) / 0.4)' : 'none',
                    }}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Footer - desktop only */}
              <div className="hidden sm:flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Info className="w-3 h-3" />
                  <span>
                    <kbd className="px-1 py-0.5 bg-muted border border-border rounded text-[10px] font-mono">Shift+Enter</kbd> nova linha
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-fin-income rounded-full" />
                  <span>Online</span>
                </div>
              </div>
            </div>

            {/* Subtle overlay */}
            <div
              className="absolute inset-0 sm:rounded-3xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.03), transparent, hsl(258 60% 52% / 0.03))' }}
            />
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0% { opacity: 0; transform: scale(0.8) translateY(20px); }
          100% { opacity: 1; transform: scale(1) translateY(0); }
        }
        .floating-ai-button:hover {
          transform: scale(1.1) rotate(5deg);
          box-shadow: 0 0 30px hsl(var(--primary) / 0.9), 0 0 50px hsl(var(--primary) / 0.7), 0 0 70px hsl(var(--primary) / 0.5) !important;
        }
      `}</style>
    </div>
  );
};

export { FloatingAiAssistant };
export type { Attachment };
