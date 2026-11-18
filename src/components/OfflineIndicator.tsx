import {WifiOff} from 'lucide-react';
import React from 'react';
import {useOnlineStatus} from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 z-50 flex items-center justify-center gap-2 rounded-xl border border-[#8C681A]/30 bg-[#141413] px-4 py-2.5 text-xs font-medium text-[#FAF9F6] shadow-lg"
    >
      <WifiOff className="h-3.5 w-3.5 text-[#D4A84B]" />
      <span>Offline Mode — Viewing cached studio content</span>
    </div>
  );
};
