import React, { useRef } from 'react';
import { Upload, Camera, Sparkles, Image as ImageIcon, ArrowRight, Compass } from 'lucide-react';
import { SAMPLE_IMAGES } from '../data/samples';
import { SampleImage, TranslationScene, SCENE_OPTIONS } from '../types';

interface ImageDropzoneProps {
  onImageSelected: (dataUrl: string, preset?: SampleImage) => void;
  onOpenCamera: () => void;
  targetLanguage: string;
  selectedScene: TranslationScene;
  onSceneChange: (scene: TranslationScene) => void;
}

export const ImageDropzone: React.FC<ImageDropzoneProps> = ({
  onImageSelected,
  onOpenCamera,
  targetLanguage,
  selectedScene,
  onSceneChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        onImageSelected(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      if (evt.target?.result) {
        onImageSelected(evt.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col gap-10">
      {/* Hero Welcome Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#8da384]/15 dark:bg-[#d48c46]/20 border border-[#8da384]/30 dark:border-[#d48c46]/40 text-[#5a7051] dark:text-[#e5a86c] text-xs font-bold mb-4 shadow-xs">
          <Sparkles className="w-4 h-4 text-[#748c69] dark:text-[#e5a86c]" />
          <span>Gemini 3.6 Flash 多模態視覺翻譯系統</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-[#4a3b32] dark:text-[#e8e4db] tracking-tight leading-tight mb-4">
          照片區域 OCR 辨識與 AR 視覺翻譯
        </h2>
        <p className="text-sm sm:text-base text-[#8a7f76] dark:text-[#9c938c] leading-relaxed">
          拍攝或上傳國外菜單、商品成分標籤、站牌或告示牌，AI 將自動辨識視覺區域並翻譯為{' '}
          <span className="text-[#748c69] dark:text-[#e5a86c] font-extrabold">{targetLanguage}</span>。
        </p>
      </div>

      {/* Translation Scene Pre-Selection Chips */}
      <div className="bg-white/70 dark:bg-[#28211d]/90 border border-[#e8e4db] dark:border-[#382f29] rounded-2xl p-4 shadow-xs space-y-2.5 backdrop-blur-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#4a3b32] dark:text-[#e8e4db] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#748c69] dark:text-[#d48c46]" />
            <span>翻譯場景預選（指定場景提升 40% 領域詞彙精準度）：</span>
          </span>
          <span className="text-[11px] text-[#748c69] dark:text-[#e5a86c] font-bold hidden sm:inline">
            已套用：{SCENE_OPTIONS.find((s) => s.id === selectedScene)?.label}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {SCENE_OPTIONS.map((s) => {
            const isActive = selectedScene === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSceneChange(s.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#8da384] dark:bg-[#d48c46] text-white border-[#8da384] dark:border-[#d48c46] shadow-xs scale-[1.02]'
                    : 'bg-white/80 dark:bg-[#241e1b] hover:bg-white dark:hover:bg-[#322a25] text-[#8a7f76] dark:text-[#9c938c] border-[#e8e4db] dark:border-[#382f29]'
                }`}
                title={s.desc}
              >
                <span>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Primary Dropzone Container */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="group relative border-2 border-dashed border-[#d8d2c6] dark:border-[#423730] hover:border-[#8da384] dark:hover:border-[#d48c46] bg-white/70 dark:bg-[#28211d]/70 hover:bg-white dark:hover:bg-[#28211d] rounded-3xl p-8 sm:p-14 text-center cursor-pointer transition-all shadow-xs backdrop-blur-xs"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-[#8da384]/15 dark:bg-[#d48c46]/20 border border-[#8da384]/30 dark:border-[#d48c46]/40 text-[#748c69] dark:text-[#e5a86c] flex items-center justify-center mx-auto mb-5 group-hover:scale-110 group-hover:bg-[#8da384] dark:group-hover:bg-[#d48c46] group-hover:text-white transition-all shadow-xs">
          <Upload className="w-8 h-8" />
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#4a3b32] dark:text-[#e8e4db] mb-2">
          點擊上傳照片，或拖曳圖片至此處
        </h3>
        <p className="text-xs sm:text-sm text-[#8a7f76] dark:text-[#9c938c] max-w-md mx-auto mb-8">
          支援 JPG, PNG, WEBP 等格式（外國菜單、藥品成分、藥妝說明、交通告示）
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenCamera();
            }}
            className="flex items-center gap-2.5 px-6 py-3 bg-[#8da384] dark:bg-[#d48c46] hover:bg-[#798e71] dark:hover:bg-[#c27d3b] text-white font-bold text-sm rounded-2xl shadow-xs transition-all hover:scale-105"
          >
            <Camera className="w-4 h-4" />
            <span>開啟手機/電腦相機</span>
          </button>

          <button
            type="button"
            className="flex items-center gap-2.5 px-6 py-3 bg-white dark:bg-[#241e1b] hover:bg-[#f5f3ef] dark:hover:bg-[#322a25] text-[#4a3b32] dark:text-[#e8e4db] font-bold text-sm rounded-2xl border border-[#e8e4db] dark:border-[#382f29] transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-[#8a7f76] dark:text-[#9c938c]" />
            <span>選擇相簿檔案</span>
          </button>
        </div>
      </div>

      {/* Preset Travel Demo Scenarios Section */}
      <div className="space-y-5">
        <div className="flex items-center justify-between border-b border-[#e8e4db] dark:border-[#382f29] pb-3">
          <h3 className="text-sm font-bold text-[#4a3b32] dark:text-[#e8e4db] uppercase tracking-wider flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#748c69] dark:text-[#d48c46]" />
            <span>快速測試：點擊載入真實旅遊情境圖片</span>
          </h3>
          <span className="text-xs text-[#8a7f76] dark:text-[#9c938c]">免上傳即可測試辨識與對照</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {SAMPLE_IMAGES.map((sample) => (
            <div
              key={sample.id}
              onClick={() => onImageSelected(sample.dataUrl, sample)}
              className="group bg-white/80 dark:bg-[#28211d]/80 border border-[#e8e4db] dark:border-[#382f29] hover:border-[#8da384] dark:hover:border-[#d48c46] rounded-2xl p-4 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#f0ede6] dark:bg-[#1f1916] mb-3.5 border border-[#e8e4db] dark:border-[#382f29] relative">
                  <img
                    src={sample.dataUrl}
                    alt={sample.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-[#1a1513]/90 backdrop-blur-xs px-2.5 py-1 rounded-lg text-xs font-bold text-[#4a3b32] dark:text-[#e8e4db] border border-[#e8e4db] dark:border-[#382f29] flex items-center gap-1.5 shadow-xs">
                    <span>{sample.flag}</span>
                    <span>{sample.category}</span>
                  </div>
                </div>

                <h4 className="text-base font-bold text-[#4a3b32] dark:text-[#e8e4db] group-hover:text-[#748c69] dark:group-hover:text-[#e5a86c] transition-colors mb-1">
                  {sample.title}
                </h4>
                <p className="text-xs text-[#8a7f76] dark:text-[#9c938c] line-clamp-2 leading-relaxed font-normal">
                  {sample.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#e8e4db] dark:border-[#382f29] flex items-center justify-between text-xs text-[#748c69] dark:text-[#e5a86c] font-bold group-hover:translate-x-1 transition-transform">
                <span>載入情境辨識</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

