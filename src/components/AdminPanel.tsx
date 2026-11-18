import {
  Check,
  Copy,
  Download,
  ImagePlus,
  Lock,
  LogOut,
  Plus,
  QrCode,
  Trash2,
} from 'lucide-react';
import QRCode from 'qrcode';
import React, {useCallback, useEffect, useState} from 'react';
import type {PhotoCategory, StudioEvent} from '../types/studio';

interface AdminPanelProps {
  onSelectEventForPreview: (code: string) => void;
}

const TOKEN_STORAGE_KEY = 'dasta_admin_token';

export const AdminPanel: React.FC<AdminPanelProps> = ({onSelectEventForPreview}) => {
  const [token, setToken] = useState<string>(() => sessionStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [events, setEvents] = useState<StudioEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Create Event Form
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [eventDate, setEventDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [creating, setCreating] = useState(false);

  // QR Modal/Preview & Upload state
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [uploadCategory, setUploadCategory] = useState<PhotoCategory>('Ceremony');
  const [uploadingCode, setUploadingCode] = useState<string | null>(null);

  const fetchEvents = useCallback(async (activeToken: string) => {
    setLoadingEvents(true);
    try {
      const res = await fetch('/api/admin/events', {
        headers: {Authorization: `Bearer ${activeToken}`},
      });
      if (res.status === 401) {
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
        return;
      }
      const data = await res.json();
      if (Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch {
      setStatusMessage('Unable to load events while offline.');
    } finally {
      setLoadingEvents(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchEvents(token);
    }
  }, [token, fetchEvents]);

  useEffect(() => {
    let mounted = true;
    const generateAllQrs = async () => {
      const next: Record<string, string> = {};
      for (const ev of events) {
        const guestUrl = `${window.location.origin}/?tab=gallery&code=${ev.code}`;
        try {
          next[ev.code] = await QRCode.toDataURL(guestUrl, {
            width: 480,
            margin: 2,
            color: {dark: '#141413', light: '#FFFFFF'},
          });
        } catch {
          // ignore
        }
      }
      if (mounted) setQrMap(next);
    };
    if (events.length > 0) generateAllQrs();
    return () => {
      mounted = false;
    };
  }, [events]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({password}),
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed.');
        return;
      }
      sessionStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      setToken(data.token);
      setPassword('');
    } catch {
      setAuthError('Network error while signing in.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken('');
    setEvents([]);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setCreating(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          clientName,
          eventDate,
          location,
          code: customCode.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || 'Could not create event.');
        return;
      }
      setEvents((prev) => [data.event, ...prev]);
      setTitle('');
      setClientName('');
      setLocation('');
      setCustomCode('');
      setStatusMessage(`Created "${data.event.title}" with Event Code ${data.event.code}.`);
    } catch {
      setStatusMessage('Failed to create event.');
    } finally {
      setCreating(false);
    }
  };

  const handlePhotoUpload = async (code: string, files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingCode(code);
    setStatusMessage(null);
    try {
      const formData = new FormData();
      formData.append('category', uploadCategory);
      Array.from(files).forEach((file) => formData.append('photos', file));

      const res = await fetch(`/api/admin/events/${code}/photos`, {
        method: 'POST',
        headers: {Authorization: `Bearer ${token}`},
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setStatusMessage(data.error || 'Upload failed.');
        return;
      }
      setEvents((prev) => prev.map((ev) => (ev.code === code ? data.event : ev)));
      setStatusMessage(`Uploaded ${data.addedCount} photo(s) to Event ${code}.`);
    } catch {
      setStatusMessage('Photo upload failed.');
    } finally {
      setUploadingCode(null);
    }
  };

  const handleDeletePhoto = async (code: string, photoId: string) => {
    try {
      const res = await fetch(`/api/admin/events/${code}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {Authorization: `Bearer ${token}`},
      });
      const data = await res.json();
      if (res.ok && data.event) {
        setEvents((prev) => prev.map((ev) => (ev.code === code ? data.event : ev)));
      }
    } catch {
      setStatusMessage('Could not remove photo.');
    }
  };

  const handleDeleteEvent = async (code: string) => {
    try {
      const res = await fetch(`/api/admin/events/${code}`, {
        method: 'DELETE',
        headers: {Authorization: `Bearer ${token}`},
      });
      if (res.ok) {
        setEvents((prev) => prev.filter((ev) => ev.code !== code));
        setStatusMessage(`Deleted Event ${code}.`);
      }
    } catch {
      setStatusMessage('Could not delete event.');
    }
  };

  const handleCopyGuestLink = async (code: string) => {
    const url = `${window.location.origin}/?tab=gallery&code=${code}`;
    await navigator.clipboard.writeText(url);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDownloadQrStandee = async (ev: StudioEvent) => {
    const qrUrl = qrMap[ev.code];
    if (!qrUrl) return;

    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 1200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Warm ivory card background
    ctx.fillStyle = '#FAF9F6';
    ctx.fillRect(0, 0, 900, 1200);

    // Charcoal inner border
    ctx.strokeStyle = '#141413';
    ctx.lineWidth = 4;
    ctx.strokeRect(42, 42, 816, 1116);

    ctx.strokeStyle = '#C89B3C';
    ctx.lineWidth = 2;
    ctx.strokeRect(56, 56, 788, 1088);

    // Header
    ctx.fillStyle = '#8C681A';
    ctx.font = '600 22px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('DASTA DIGITAL PHOTO STUDIO', 450, 132);

    ctx.fillStyle = '#141413';
    ctx.font = '600 54px "Cormorant Garamond", Georgia, serif';
    ctx.fillText(ev.clientName.slice(0, 32), 450, 210);

    ctx.fillStyle = '#58544B';
    ctx.font = '400 24px "Plus Jakarta Sans", sans-serif';
    ctx.fillText(`${ev.eventDate}  ·  ${ev.location.slice(0, 36)}`, 450, 258);

    // QR Code image
    const qrImg = new Image();
    qrImg.onload = () => {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(210, 315, 480, 480);
      ctx.strokeStyle = '#E2DDD3';
      ctx.lineWidth = 2;
      ctx.strokeRect(210, 315, 480, 480);
      ctx.drawImage(qrImg, 230, 335, 440, 440);

      ctx.fillStyle = '#58544B';
      ctx.font = '500 22px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('SCAN QR OR ENTER 6-DIGIT EVENT CODE', 450, 865);

      // 6-digit code box
      ctx.fillStyle = '#141413';
      ctx.fillRect(270, 895, 360, 96);
      ctx.fillStyle = '#D4A84B';
      ctx.font = '600 52px "JetBrains Mono", monospace';
      ctx.fillText(ev.code.split('').join(' '), 450, 960);

      ctx.fillStyle = '#6B675E';
      ctx.font = '400 20px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('View & download high-resolution event photos instantly', 450, 1065);

      const link = document.createElement('a');
      link.download = `Dasta-QR-${ev.code}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    };
    qrImg.src = qrUrl;
  };

  if (!token) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-[#E6E1D6] bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#141413] text-[#D4A84B]">
          <Lock className="h-5 w-5" />
        </div>
        <h3 className="mt-4 font-display text-3xl font-semibold text-[#141413]">
          Studio Admin Panel
        </h3>
        <p className="mt-1.5 text-sm text-[#58544B]">
          Sign in to create wedding events, generate guest QR codes, and upload high-res photos.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label htmlFor="admin-password" className="block text-xs font-medium text-[#434039]">
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter studio password"
              className="mt-1.5 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-4 text-sm text-[#141413] outline-none focus:border-[#141413]"
            />
            <p className="mt-1.5 text-xs text-[#6B675E]">
              Default studio password: <span className="font-mono-tabular font-medium text-[#141413]">dasta2026</span>
            </p>
          </div>

          {authError && (
            <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={authLoading}
            className="w-full min-h-[44px] rounded-xl bg-[#141413] px-4 py-2.5 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#292826] disabled:opacity-60"
          >
            {authLoading ? 'Verifying...' : 'Unlock Admin Panel'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E6E1D6] bg-white px-5 py-4">
        <div>
          <p className="text-xs font-medium text-[#8C681A]">Authenticated Studio Console</p>
          <h3 className="font-display text-2xl font-semibold text-[#141413]">
            Manage Client Events &amp; QR Codes
          </h3>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-[#E2DDD3] px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#F3EFE6]"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>

      {statusMessage && (
        <div role="status" className="rounded-xl border border-[#D4A84B]/40 bg-[#FBF7EE] px-4 py-3 text-sm text-[#434039]">
          {statusMessage}
        </div>
      )}

      {/* Create New Event Form */}
      <form
        onSubmit={handleCreateEvent}
        className="rounded-2xl border border-[#E6E1D6] bg-white p-5 sm:p-6"
      >
        <div className="flex items-center gap-2">
          <Plus className="h-4 w-4 text-[#8C681A]" />
          <h4 className="text-base font-semibold text-[#141413]">Create New Event Gallery</h4>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label htmlFor="ev-title" className="block text-xs font-medium text-[#58544B]">
              Event Title
            </label>
            <input
              id="ev-title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Rohan & Priya Wedding"
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label htmlFor="ev-client" className="block text-xs font-medium text-[#58544B]">
              Couple / Client Name
            </label>
            <input
              id="ev-client"
              type="text"
              required
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="e.g. Rohan & Priya"
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label htmlFor="ev-date" className="block text-xs font-medium text-[#58544B]">
              Event Date
            </label>
            <input
              id="ev-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label htmlFor="ev-location" className="block text-xs font-medium text-[#58544B]">
              Venue / City
            </label>
            <input
              id="ev-location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Taj Rambagh, Jaipur"
              className="mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
            />
          </div>

          <div>
            <label htmlFor="ev-code" className="block text-xs font-medium text-[#58544B]">
              6-Digit Code (Optional)
            </label>
            <input
              id="ev-code"
              type="text"
              maxLength={6}
              inputMode="numeric"
              value={customCode}
              onChange={(e) => setCustomCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Auto-generate if empty"
              className="font-mono-tabular mt-1 w-full min-h-[44px] rounded-xl border border-[#DDD7CB] bg-[#FAF9F6] px-3.5 text-sm text-[#141413] outline-none focus:border-[#141413]"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={creating}
              className="w-full min-h-[44px] rounded-xl bg-[#141413] px-4 py-2.5 text-sm font-semibold text-[#FAF9F6] transition-colors hover:bg-[#292826] disabled:opacity-60"
            >
              {creating ? 'Creating Event...' : 'Create Event & QR'}
            </button>
          </div>
        </div>
      </form>

      {/* Events & QR Management List */}
      {loadingEvents ? (
        <div className="rounded-2xl border border-[#E6E1D6] bg-white p-8 text-center text-sm text-[#6B675E]">
          Loading studio events...
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {events.map((ev) => (
            <article
              key={ev.code}
              className="flex flex-col justify-between rounded-2xl border border-[#E6E1D6] bg-white p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-xs text-[#6B675E]">
                    <span className="font-mono-tabular font-semibold text-[#8C681A]">
                      Code {ev.code}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.eventDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{ev.photos.length} photos</span>
                  </div>
                  <h4 className="mt-1 font-display text-2xl font-semibold text-[#141413] truncate">
                    {ev.title}
                  </h4>
                  <p className="text-xs text-[#58544B]">{ev.location}</p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleDownloadQrStandee(ev)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-[#141413] px-3 py-1.5 text-xs font-semibold text-[#FAF9F6] hover:bg-[#292826]"
                    >
                      <Download className="h-3.5 w-3.5 text-[#D4A84B]" />
                      <span>Download QR Card</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleCopyGuestLink(ev.code)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2DDD3] px-3 py-1.5 text-xs font-medium text-[#141413] hover:bg-[#F3EFE6]"
                    >
                      {copiedCode === ev.code ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-700" />
                          <span>Link Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectEventForPreview(ev.code)}
                      className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-[#E2DDD3] px-3 py-1.5 text-xs font-medium text-[#141413] hover:bg-[#F3EFE6]"
                    >
                      <QrCode className="h-3.5 w-3.5" />
                      <span>Open Gallery</span>
                    </button>
                  </div>
                </div>

                {/* Live QR Code Thumbnail */}
                <div className="shrink-0 self-start rounded-xl border border-[#E6E1D6] bg-white p-2">
                  {qrMap[ev.code] ? (
                    <img
                      src={qrMap[ev.code]}
                      alt={`QR Code for Event ${ev.code}`}
                      className="h-24 w-24 object-contain"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center bg-[#FAF9F6] text-xs text-[#6B675E]">
                      QR...
                    </div>
                  )}
                </div>
              </div>

              {/* Photo Upload Controls */}
              <div className="mt-5 border-t border-[#EFECE4] pt-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor={`cat-${ev.code}`}
                      className="text-xs font-medium text-[#58544B]"
                    >
                      Upload Category:
                    </label>
                    <select
                      id={`cat-${ev.code}`}
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value as PhotoCategory)}
                      className="min-h-[36px] rounded-lg border border-[#DDD7CB] bg-[#FAF9F6] px-2.5 text-xs font-medium text-[#141413]"
                    >
                      <option value="Ceremony">Ceremony</option>
                      <option value="Portraits">Portraits</option>
                      <option value="Candid">Candid</option>
                      <option value="Aerial">Aerial</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex min-h-[40px] cursor-pointer items-center gap-1.5 rounded-lg bg-[#F5F1E8] px-3 py-1.5 text-xs font-semibold text-[#8C681A] hover:bg-[#EBE4D3]">
                      <ImagePlus className="h-3.5 w-3.5" />
                      <span>
                        {uploadingCode === ev.code ? 'Uploading...' : 'Add Photos'}
                      </span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        disabled={uploadingCode === ev.code}
                        onChange={(e) => {
                          handlePhotoUpload(ev.code, e.target.files);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleDeleteEvent(ev.code)}
                      aria-label={`Delete event ${ev.title}`}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#E6E1D6] text-[#6B675E] hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Mini photo strip */}
                {ev.photos.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {ev.photos.slice(0, 8).map((photo) => (
                      <div key={photo.id} className="group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-[#22201D]">
                        <img
                          src={photo.url}
                          alt={photo.title}
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(ev.code, photo.id)}
                          aria-label={`Remove ${photo.title}`}
                          className="absolute inset-0 flex items-center justify-center bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
