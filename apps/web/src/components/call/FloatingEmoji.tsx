'use client';

import { useState, useEffect } from 'react';
import { useCallStore } from '@/stores/call-store';

const EMOJIS = ['❤️', '😂', '😔', '😊', '🔥'];

export function FloatingEmojiLayer() {
  const incomingEmoji = useCallStore((s) => s.incomingEmoji);
  const setIncomingEmoji = useCallStore((s) => s.setIncomingEmoji);
  const [activeEmojis, setActiveEmojis] = useState<{ id: number; symbol: string; left: number }[]>([]);

  useEffect(() => {
    if (incomingEmoji) {
      // Spawn 10-12 emojis
      const count = 10 + Math.floor(Math.random() * 3);
      const newBatch = Array.from({ length: count }).map((_, i) => ({
        id: Date.now() + i,
        symbol: incomingEmoji,
        left: Math.random() * 80 + 10, // 10% to 90% width
      }));

      setActiveEmojis((prev) => [...prev, ...newBatch]);
      setIncomingEmoji(null);

      // Cleanup batch after 2.5s
      setTimeout(() => {
        setActiveEmojis((prev) => prev.filter((e) => !newBatch.find((nb) => nb.id === e.id)));
      }, 2500);
    }
  }, [incomingEmoji, setIncomingEmoji]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
      {activeEmojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute bottom-0 text-4xl animate-float-up opacity-0"
          style={{
            left: `${emoji.left}%`,
            animationDelay: `${Math.random() * 0.5}s`,
          }}
        >
          {emoji.symbol}
        </div>
      ))}

      <style jsx global>{`
        @keyframes float-up {
          0% {
            transform: translateY(0) scale(0.5);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          80% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1.5);
            opacity: 0;
          }
        }
        .animate-float-up {
          animation: float-up 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export function EmojiToolbar() {
  const sendEmoji = useCallStore((s) => s.sendEmoji);

  return (
    <div className="flex gap-4 p-4 bg-black/20 backdrop-blur-md rounded-full border border-white/10">
      {EMOJIS.map((emoji) => (
        <button
          key={emoji}
          onClick={() => sendEmoji(emoji)}
          className="text-2xl hover:scale-125 transition-transform active:scale-95"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
