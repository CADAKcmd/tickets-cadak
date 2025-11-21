'use client';

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { verifyAndCheckInFS } from '@/lib/firestore';
import { useAuth } from '@/providers/AuthProvider';
import { usePathname } from 'next/navigation';

type ScanStatus = 'idle' | 'valid' | 'already_used' | 'invalid';

export default function Scanner({
  timeoutMs = 20000,
  autoStart = false,
}: {
  timeoutMs?: number;
  autoStart?: boolean;
}) {
  const { user } = useAuth();
  const pathname = usePathname();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const lastDetectRef = useRef<number>(Date.now());
  const lastTextRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const [scanning, setScanning] = useState(autoStart);
  const [status, setStatus] = useState<ScanStatus>('idle');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  function killStream() {
    try {
      controlsRef.current?.stop();
    } catch {}
    const stream = videoRef.current?.srcObject as MediaStream | null;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      try {
        videoRef.current.pause();
      } catch {}
    }
    controlsRef.current = null;
    readerRef.current = null;
  }

  async function start() {
    setError(null);
    setStarting(true);
    setStatus('idle');
    setDetails('');
    lastDetectRef.current = Date.now();
    lastTextRef.current = null;

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current!,
        async (result, _err, controls) => {
          setStarting(false);
          if (controls && !controlsRef.current) controlsRef.current = controls;

          if (!result || !user) return;

          // get text from ZXing result across versions
          const text: string | undefined =
            (result as any)?.text ?? (result as any)?.getText?.();

          if (!text) return;

          // Debounce duplicate reads
          if (text === lastTextRef.current || inFlightRef.current) return;
          lastTextRef.current = text;
          inFlightRef.current = true;

          try {
            // Parse ticket id from JSON or accept raw text
            let ticketId: string | undefined;
            try {
              const parsed = JSON.parse(text);
              ticketId = (parsed?.t || parsed?.ticket || parsed?.id) as string | undefined;
            } catch {
              ticketId = text;
            }
            if (!ticketId) throw new Error('invalid');

            const out = await verifyAndCheckInFS(ticketId, user.uid);
            setStatus(out.result as ScanStatus);
            setDetails(out.ticket ? `${out.ticket.eventTitle} — ${out.ticket.typeName}` : '');
            lastDetectRef.current = Date.now();
          } catch (e: any) {
            if (e?.message === 'not-authorized') setError('Not allowed to scan for this event.');
            setStatus('invalid');
            setDetails('');
          } finally {
            setTimeout(() => {
              inFlightRef.current = false;
            }, 600);
          }
        }
      );
    } catch (e: any) {
      setStarting(false);
      setError(e?.message || 'Could not start camera. Check permissions.');
      setScanning(false);
      killStream();
    }
  }

  function stop() {
    killStream();
    setScanning(false);
    setStarting(false);
    setStatus('idle');
    setDetails('');
  }

  // Start/stop when toggling
  useEffect(() => {
    if (scanning && videoRef.current) start();
    else killStream();
    return () => killStream();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  // Auto stop after inactivity
  useEffect(() => {
    if (!scanning) return;
    const id = setInterval(() => {
      if (!scanning) return;
      if (Date.now() - lastDetectRef.current > timeoutMs) {
        stop();
        setError('No QR detected for a while. Stopped to save battery.');
      }
    }, 1000);
    return () => clearInterval(id);
  }, [scanning, timeoutMs]);

  // Stop when page hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden && scanning) stop();
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [scanning]);

  // Kill stream on route change
  useEffect(() => () => killStream(), [pathname]);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <div className="flex items-center gap-2">
        {!scanning ? (
          <button className="btn btn-primary" onClick={() => setScanning(true)}>
            {starting ? 'Starting…' : 'Start scanning'}
          </button>
        ) : (
          <button className="btn btn-ghost" onClick={stop}>
            Stop scanning
          </button>
        )}
        {error && <span className="text-sm text-red-500">{error}</span>}
      </div>

      <div className="card p-3">
        <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', borderRadius: 8 }} />
        {!scanning && (
          <div className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
            Scanner is off. Click “Start scanning” to turn on the camera.
          </div>
        )}
      </div>

      <div className="card p-4">
        <div className="text-sm text-[hsl(var(--muted-foreground))]">Scan status</div>
        <div className="mt-1 text-lg font-semibold">
          {status === 'idle' && 'Waiting for QR…'}
          {status === 'valid' && <span className="text-green-600">Valid — checked in ✔</span>}
          {status === 'already_used' && <span className="text-orange-600">Already used ⚠</span>}
          {status === 'invalid' && <span className="text-red-600">Invalid ❌</span>}
        </div>
        {details && <div className="mt-1 text-sm">{details}</div>}
      </div>
    </div>
  );
}