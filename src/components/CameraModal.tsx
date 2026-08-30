import React, { useRef, useState, useEffect } from 'react';
import { Camera, X, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      return;
    }

    startCamera(facingMode);

    return () => {
      stopCamera();
    };
  }, [isOpen, facingMode]);

  const startCamera = async (mode: 'environment' | 'user') => {
    setError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

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
    } catch (err: any) {
      console.error('Camera access error:', err);
      setError('無法取用相機，請確認瀏覽器相機權限已開啟或設備支援相機。');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleTakeSnapshot = () => {
    if (!videoRef.current) return;

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
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#fcfbf9] dark:bg-[#231c19] border border-[#e8e4db] dark:border-[#382f29] rounded-3xl max-w-2xl w-full overflow-hidden shadow-xl flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between bg-[#f5f3ef]/80 dark:bg-[#1a1513]/80">
          <div className="flex items-center gap-2.5">
            <Camera className="w-5 h-5 text-[#748c69] dark:text-[#e5a86c]" />
            <h3 className="text-base font-bold text-[#4a3b32] dark:text-[#e8e4db]">隨身相機即時拍照辨識</h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video View */}
        <div className="relative bg-black min-h-[360px] flex items-center justify-center">
          {error ? (
            <div className="p-8 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-[#c84d31] mx-auto mb-3" />
              <p className="text-sm text-[#e8e4db] mb-4">{error}</p>

              <button
                onClick={() => startCamera(facingMode)}
                className="px-4 py-2 bg-[#8da384] dark:bg-[#d48c46] text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
              >
                重新嘗試啟動相機
              </button>
            </div>
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[60vh] object-contain"
            />
          )}

          {/* Guidelines framing box */}
          {!error && (
            <div className="absolute inset-8 border-2 border-dashed border-[#8da384]/80 dark:border-[#d48c46]/80 rounded-2xl pointer-events-none flex items-center justify-center">
              <span className="bg-black/70 text-white text-xs px-3.5 py-1.5 rounded-full backdrop-blur-xs font-bold">
                請將菜單、告示牌或包裝文字對準此區域
              </span>
            </div>
          )}
        </div>

        {/* Footer controls */}
        <div className="p-4 bg-[#f5f3ef] dark:bg-[#1a1513] border-t border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between gap-4">
          <button
            onClick={() => setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'))}
            className="flex items-center gap-2 px-3.5 py-2 bg-white dark:bg-[#28211d] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] text-xs font-bold rounded-xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>切換鏡頭 ({facingMode === 'environment' ? '後置' : '前置'})</span>
          </button>

          <button
            onClick={handleTakeSnapshot}
            disabled={!!error}
            className="flex items-center gap-2 px-6 py-3 bg-[#8da384] dark:bg-[#d48c46] hover:bg-[#798e71] dark:hover:bg-[#c27d3b] text-white font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 text-sm"
          >
            <CheckCircle className="w-5 h-5" />
            <span>拍照並開始 OCR 翻譯</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-[#8a7f76] dark:text-[#9c938c] hover:text-[#4a3b32] dark:hover:text-[#e8e4db] text-xs font-bold"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
};

