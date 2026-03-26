'use client';

import React from "react";
import { usePresence } from '@/hooks/usePresence';

export function PresenceProvider({ children }: { children: React.ReactNode }) {
  usePresence('web');
  return <>{children}</>;
}
