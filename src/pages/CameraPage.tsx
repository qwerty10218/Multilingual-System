import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, AlertCircle, SwitchCamera } from 'lucide-react';

interface CameraPageProps {
  onCapture: (dataUrl: string) => void;
  onBack: () => void;
}

export const CameraPage: React.FC<CameraPageProps> = ({ onCapture, onBack }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isCapturing, setIsCapturing] = useState(false);

  useEffect(() => {
    startCamera(facingMode);
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode]);

  const startCamera = async (mode: 'environment' | 'user') => {
    setError(null);
    try {
      // Stop any existing stream first
      setStream((prev) => {
        prev?.getTracks().forEach((t) => t.stop());
        return null;
      });

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setError('無法取用相機，請確認瀏覽器已授予相機權限，或您的設備支援相機功能。');
    }
  };

  const stopCamera = () => {
    setStream((prev) => {
      prev?.getTracks().forEach((t) => t.stop());
      return null;
    });
  };

  const handleCapture = () => {
    if (!videoRef.current || isCapturing) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      stopCamera();
      onCapture(dataUrl);
    }
    setIsCapturing(false);
  };

  const handleFlipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  return (
    <div className="h-full flex flex-col bg-black relative overflow-hidden">
      {/* Video Feed */}
      <div className="flex-1 relative flex items-center justify-center">
        {error ? (
          <div className="p-8 text-center max-w-sm mx-auto">
            <AlertCircle className="w-14 h-14 text-[var(--accent-red)] mx-auto mb-4" />
            <p className="text-white text-sm leading-relaxed mb-6 font-mono">{error}</p>
            <button
              type="button"
              onClick={() => startCamera(facingMode)}
              className="inline-flex items-center gap-2 px-5 py-3 bg-[var(--accent-red)] text-white text-sm font-bold shadow-sm min-h-[44px]"
            >
              <RefreshCw className="w-4 h-4" />
              重新嘗試啟動相機
            </button>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}

        {/* Framing Guide */}
        {!error && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-[80%] h-[55%] border-2 border-dashed border-white/60 flex items-center justify-center">
              <span className="bg-black/60 text-white text-xs font-bold px-3.5 py-1.5 backdrop-blur-sm tracking-widest">
                將文字對準此取景框
              </span>
            </div>
          </div>
        )}

        {/* Top Bar Overlay */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-3 pb-2">
          <button
            type="button"
            onClick={onBack}
            aria-label="返回"
            className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70 rounded-none"
          >
            ✕
          </button>
          <span className="text-white text-[13px] font-bold bg-black/50 backdrop-blur-sm px-3 py-1.5 tracking-widest font-serif">
            即時拍照辨識
          </span>
          <div className="w-11" aria-hidden="true" />
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="shrink-0 bg-black/90 pb-safe flex items-center justify-around px-8 py-6">
        {/* Flip Camera */}
        <button
          type="button"
          onClick={handleFlipCamera}
          aria-label={`切換至${facingMode === 'environment' ? '前置' : '後置'}鏡頭`}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/25 transition-colors"
        >
          <SwitchCamera className="w-6 h-6" />
        </button>

        {/* Shutter Button */}
        <button
          type="button"
          onClick={handleCapture}
          disabled={!!error || isCapturing}
          aria-label="拍照"
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-transform ring-4 ring-white/30"
        >
          <div className="w-16 h-16 rounded-full bg-white border-4 border-black flex items-center justify-center">
            <Camera className="w-7 h-7 text-black" />
          </div>
        </button>

        {/* Placeholder to balance layout */}
        <div className="min-h-[44px] min-w-[44px]" aria-hidden="true" />
      </div>
    </div>
  );
};
