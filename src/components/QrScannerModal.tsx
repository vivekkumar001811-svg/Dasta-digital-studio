import jsQR from 'jsqr';
import {Camera, ImageUp, X} from 'lucide-react';
import React, {useEffect, useRef, useState} from 'react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCodeDetected: (code: string) => void;
}

function extractSixDigitCode(rawText: string): string | null {
  const trimmed = rawText.trim();
  if (/^\d{6}$/.test(trimmed)) return trimmed;
  try {
    const parsed = new URL(trimmed);
    const param = parsed.searchParams.get('code');
    if (param && /^\d{6}$/.test(param)) return param;
  } catch {
    // Not a URL, fall back to regex match
  }
  const match = trimmed.match(/\b(\d{6})\b/);
  return match ? match[1] : null;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onCodeDetected,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanMessage, setScanMessage] = useState<string>('Point camera at a Dasta Studio QR code');

  useEffect(() => {
    if (!isOpen) return;

    let stream: MediaStream | null = null;
    let animId = 0;
    let active = true;

    const startCamera = async () => {
      setCameraError(null);
      setScanMessage('Point camera at a Dasta Studio QR code');

      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraError('Camera access is not available in this browser. Upload a QR image below.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {facingMode: {ideal: 'environment'}},
          audio: false,
        });
        if (!active) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        tick();
      } catch {
        setCameraError('Camera permission was denied or unavailable. You can upload a QR photo instead.');
      }
    };

    const tick = () => {
      if (!active) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas && video.readyState === video.HAVE_ENOUGH_DATA) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        if (w > 0 && h > 0) {
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d', {willReadFrequently: true});
          if (ctx) {
            ctx.drawImage(video, 0, 0, w, h);
            const imgData = ctx.getImageData(0, 0, w, h);
            const qr = jsQR(imgData.data, w, h, {inversionAttempts: 'dontInvert'});
            if (qr?.data) {
              const code = extractSixDigitCode(qr.data);
              if (code) {
                onCodeDetected(code);
                onClose();
                return;
              } else {
                setScanMessage('QR detected, but no 6-digit event code found.');
              }
            }
          }
        }
      }
      animId = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      active = false;
      if (animId) cancelAnimationFrame(animId);
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, onClose, onCodeDetected]);

  const handleUploadQrImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, img.width, img.height);
        const qr = jsQR(imageData.data, img.width, img.height, {inversionAttempts: 'attemptBoth'});
        if (qr?.data) {
          const code = extractSixDigitCode(qr.data);
          if (code) {
            onCodeDetected(code);
            onClose();
            return;
          }
        }
        setCameraError('No valid 6-digit Dasta Studio QR code was found in that image.');
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-scanner-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[#2C2A26] bg-[#141413] text-[#FAF9F6] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <Camera className="h-5 w-5 text-[#D4A84B]" />
            <h3 id="qr-scanner-title" className="font-display text-xl font-semibold">
              Scan Event QR Code
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close QR scanner"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#D8D3C8] hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {!cameraError ? (
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-black">
              <video
                ref={videoRef}
                playsInline
                muted
                className="h-full w-full object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />
              {/* Scanner reticle overlay */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center p-10">
                <div className="relative h-full w-full rounded-2xl border border-white/25">
                  <span className="absolute -left-0.5 -top-0.5 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-[#D4A84B]" />
                  <span className="absolute -right-0.5 -top-0.5 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-[#D4A84B]" />
                  <span className="absolute -bottom-0.5 -left-0.5 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-[#D4A84B]" />
                  <span className="absolute -bottom-0.5 -right-0.5 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-[#D4A84B]" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col items-center justify-center rounded-2xl border border-white/10 bg-[#1D1C1A] p-6 text-center">
              <Camera className="h-9 w-9 text-[#D4A84B]" />
              <p className="mt-3 text-sm text-[#D8D3C8]">{cameraError}</p>
            </div>
          )}

          <p className="mt-3 text-center text-xs text-[#B5AEA0]">{scanMessage}</p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleUploadQrImage}
            className="hidden"
          />

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-[#FAF9F6] transition-colors hover:bg-white/15"
            >
              <ImageUp className="h-4 w-4 text-[#D4A84B]" />
              <span>Upload QR Image</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-[#D4A84B] px-5 py-2.5 text-sm font-semibold text-[#141413] transition-colors hover:bg-[#E2BA63]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
