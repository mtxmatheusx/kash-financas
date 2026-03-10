import React, { useState, useRef, useEffect } from 'react';
import { Paperclip, Link, Code, Mic, Send, Info, Bot, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingAiAssistantProps {
  onSend?: (message: string) => void;
  isLoading?: boolean;
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  headerBadges?: { label: string; variant: 'primary' | 'accent' }[];
  showAttachments?: boolean;
  placeholder?: string;
}

const FloatingAiAssistant = ({
  onSend,
  isLoading = false,
  children,
  title = "AI Assistant",
  subtitle,
  headerBadges = [{ label: "IA", variant: "primary" }],
  showAttachments = false,
  placeholder = "Ask anything...",
}: FloatingAiAssistantProps) => {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [charCount, setCharCount] = useState(0);
  const maxChars = 2000;
  const chatRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxChars) {
      setMessage(value);
      setCharCount(value.length);
    }
  };

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSend?.(message.trim());
      setMessage('');
      setCharCount(0);
    }
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

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {/* Floating 3D Glowing AI Logo */}
      <button
        className="floating-ai-button relative w-14 h-14 rounded-full cursor-pointer transition-all duration-500 flex items-center justify-center group"
        onClick={() => setIsChatOpen(!isChatOpen)}
        style={{
          background: 'linear-gradient(135deg, hsl(var(--primary) / 0.9) 0%, hsl(258 60% 52% / 0.9) 100%)',
          boxShadow: '0 0 20px hsl(var(--primary) / 0.7), 0 0 40px hsl(var(--primary) / 0.5), 0 0 60px hsl(var(--primary) / 0.3)',
          border: '2px solid hsl(var(--primary-foreground) / 0.2)',
        }}
      >
        {/* 3D effect layers */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <div
          className="absolute inset-1 rounded-full"
          style={{
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, transparent 50%)',
          }}
        />

        {/* Icon */}
        <span className="relative z-10 text-primary-foreground transition-transform duration-300 group-hover:scale-110">
          {isChatOpen ? <X className="w-6 h-6" /> : <Bot className="w-6 h-6" />}
        </span>

        {/* Pulse ring */}
        <div
          className="absolute inset-0 rounded-full animate-ping opacity-20"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)',
            animationDuration: '3s',
          }}
        />
      </button>

      {/* Chat Interface */}
      {isChatOpen && (
        <div className="absolute bottom-20 right-0" ref={chatRef}>
          <div
            className="relative w-[400px] max-h-[560px] rounded-3xl overflow-hidden flex flex-col"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 25px 60px -12px rgba(0, 0, 0, 0.5), 0 0 30px hsl(var(--primary) / 0.1)',
              animation: 'popIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)',
                  }}
                >
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-semibold text-foreground">{title}</span>
              </div>
              <div className="flex items-center gap-2">
                {headerBadges.map((badge, i) => (
                  <span
                    key={i}
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-semibold",
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
                  className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto min-h-[280px] max-h-[320px]">
              {children}
            </div>

            {/* Input Section */}
            <div className="px-4 pt-3">
              <div className="relative">
                <textarea
                  value={message}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={placeholder}
                  rows={3}
                  className="w-full bg-muted/50 border border-border/50 rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 resize-none outline-none focus:border-primary/50 transition-colors"
                />
              </div>
            </div>

            {/* Controls Section */}
            <div className="px-4 pb-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {showAttachments && (
                    <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-xl border border-border/50">
                      <ToolButton icon={<Paperclip className="w-4 h-4" />} tooltip="Upload files" />
                      <ToolButton icon={<Link className="w-4 h-4" />} tooltip="Web link" />
                      <ToolButton icon={<Code className="w-4 h-4" />} tooltip="Code" />
                    </div>
                  )}
                  <ToolButton icon={<Mic className="w-4 h-4" />} tooltip="Voice input" className="border border-border/30" />
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-xs font-medium text-muted-foreground">
                    <span>{charCount}</span>/<span className="text-muted-foreground/70">{maxChars}</span>
                  </div>
                  <button
                    onClick={handleSend}
                    disabled={!message.trim() || isLoading}
                    className="group relative p-3 rounded-xl text-primary-foreground transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                    style={{
                      background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(258 60% 52%) 100%)',
                      boxShadow: message.trim() ? '0 4px 15px hsl(var(--primary) / 0.4)' : 'none',
                    }}
                  >
                    <Send className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:rotate-12" />
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground">
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

            {/* Subtle overlay gradient */}
            <div
              className="absolute inset-0 rounded-3xl pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--primary) / 0.03), transparent, hsl(258 60% 52% / 0.03))',
              }}
            />
          </div>
        </div>
      )}

      {/* Keyframe animation */}
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

function ToolButton({ icon, tooltip, className }: { icon: React.ReactNode; tooltip: string; className?: string }) {
  return (
    <button
      className={cn(
        "group relative p-2.5 rounded-lg transition-all duration-300 text-muted-foreground hover:text-foreground hover:bg-muted hover:scale-105",
        className
      )}
    >
      {icon}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover text-popover-foreground text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg border border-border">
        {tooltip}
      </div>
    </button>
  );
}

export { FloatingAiAssistant };
