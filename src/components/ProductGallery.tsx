import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sun,
  Moon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  isNight?: boolean;
  onToggleNight?: (isNight?: boolean) => void;
  hasNightImage?: boolean;
  dayImage?: string;
  nightImage?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  isNight = false,
  onToggleNight,
}) => {
  // Guard against empty image array
  const galleryImages = images && images.length > 0 ? images : ["/images/products/big-ganesha.jpg"];

  // Active image index: index 0 = Daylight image, index 1 = Illuminated / Night image
  const [currentIndex, setCurrentIndex] = useState(isNight && galleryImages.length > 1 ? 1 : 0);

  // Sync internal index if parent isNight prop changes externally
  useEffect(() => {
    if (isNight && galleryImages.length > 1 && currentIndex !== 1) {
      setCurrentIndex(1);
    } else if (!isNight && currentIndex === 1) {
      setCurrentIndex(0);
    }
  }, [isNight, galleryImages.length]);

  // Full-screen lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);
  const [panPosition, setPanPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });

  // Touch gesture state for pinch-zoom and swipe
  const touchStateRef = useRef<{
    initialDistance: number;
    initialScale: number;
    lastTap: number;
    touchStartX: number;
    touchStartY: number;
  }>({
    initialDistance: 0,
    initialScale: 1,
    lastTap: 0,
    touchStartX: 0,
    touchStartY: 0,
  });

  const lightboxContainerRef = useRef<HTMLDivElement>(null);

  const resetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

  const handleSelectIndex = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      resetZoom();
      if (onToggleNight) {
        onToggleNight(index === 1);
      }
    },
    [onToggleNight]
  );

  // Navigation handlers
  const handlePrev = useCallback(() => {
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : galleryImages.length - 1;
    handleSelectIndex(nextIdx);
  }, [currentIndex, galleryImages.length, handleSelectIndex]);

  const handleNext = useCallback(() => {
    const nextIdx = currentIndex < galleryImages.length - 1 ? currentIndex + 1 : 0;
    handleSelectIndex(nextIdx);
  }, [currentIndex, galleryImages.length, handleSelectIndex]);

  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxOpen(false);
        resetZoom();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "+" || e.key === "=") {
        handleZoomIn();
      } else if (e.key === "-") {
        handleZoomOut();
      } else if (e.key === "0") {
        resetZoom();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext]);

  // Wheel zoom in Lightbox
  const handleWheel = (e: React.WheelEvent) => {
    if (!lightboxOpen) return;
    e.preventDefault();
    const zoomDelta = e.deltaY > 0 ? -0.25 : 0.25;
    setZoomScale((prev) => {
      const next = Math.min(Math.max(prev + zoomDelta, 1), 4);
      if (next === 1) setPanPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Mouse pan in Lightbox when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - panPosition.x, y: e.clientY - panPosition.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomScale <= 1) return;
    setPanPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for Lightbox
  const getTouchDistance = (t1: React.Touch, t2: React.Touch) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch start
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      touchStateRef.current.initialDistance = dist;
      touchStateRef.current.initialScale = zoomScale;
    } else if (e.touches.length === 1) {
      // Pan or double tap start
      const touch = e.touches[0];
      touchStateRef.current.touchStartX = touch.clientX;
      touchStateRef.current.touchStartY = touch.clientY;

      if (zoomScale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - panPosition.x,
          y: touch.clientY - panPosition.y,
        };
      }

      // Double tap detector
      const now = Date.now();
      if (now - touchStateRef.current.lastTap < 300) {
        if (zoomScale > 1) {
          resetZoom();
        } else {
          setZoomScale(2.5);
        }
      }
      touchStateRef.current.lastTap = now;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch zoom in progress
      e.preventDefault();
      const dist = getTouchDistance(e.touches[0], e.touches[1]);
      if (touchStateRef.current.initialDistance > 0) {
        const ratio = dist / touchStateRef.current.initialDistance;
        const newScale = Math.min(Math.max(touchStateRef.current.initialScale * ratio, 1), 4);
        setZoomScale(newScale);
        if (newScale === 1) setPanPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && zoomScale > 1 && isDragging) {
      // Pan in progress
      e.preventDefault();
      setPanPosition({
        x: e.touches[0].clientX - dragStartRef.current.x,
        y: e.touches[0].clientY - dragStartRef.current.y,
      });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If not zoomed, check for swipe navigation
    if (zoomScale === 1 && e.changedTouches.length === 1) {
      const deltaX = e.changedTouches[0].clientX - touchStateRef.current.touchStartX;
      const deltaY = e.changedTouches[0].clientY - touchStateRef.current.touchStartY;

      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStateRef.current.initialDistance = 0;
    setIsDragging(false);
  };

  const currentImageUrl = galleryImages[currentIndex] || galleryImages[0];
  const isIlluminated = currentIndex === 1;

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative group"
      >
        <div
          onClick={() => {
            resetZoom();
            setLightboxOpen(true);
          }}
          className={`relative aspect-square overflow-hidden rounded-xl border transition-colors duration-500 cursor-zoom-in flex items-center justify-center ${
            isIlluminated ? "bg-black/95 border-amber-500/30" : "bg-card border-border/80"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`${currentImageUrl}-${currentIndex}`}
              src={currentImageUrl}
              alt={`${productName} view ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`h-full w-full object-contain p-2 transition-all duration-300 ${
                isIlluminated
                  ? "opacity-95 mix-blend-screen drop-shadow-[0_0_25px_rgba(251,191,36,0.45)]"
                  : ""
              }`}
              loading="eager"
            />
          </AnimatePresence>

          {/* Full-Screen Expand Button */}
          <Button
            type="button"
            variant="secondary"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              resetZoom();
              setLightboxOpen(true);
            }}
            className="absolute left-3 top-3 h-9 w-9 rounded-full bg-black/60 text-white backdrop-blur hover:bg-black/80 hover:text-white border border-white/20 shadow-md transition-transform group-hover:scale-105"
            title="Open Fullscreen Gallery"
          >
            <Expand className="h-4 w-4" />
            <span className="sr-only">Open Fullscreen Viewer</span>
          </Button>

          {/* Image Counter Badge */}
          {galleryImages.length > 1 && (
            <Badge className="absolute top-3 right-3 bg-black/60 text-white border-white/20 backdrop-blur font-mono text-xs shadow-md">
              {currentIndex + 1} / {galleryImages.length}
            </Badge>
          )}

          {/* Previous Image Arrow Button on Hover */}
          {galleryImages.length > 1 && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-black/40 text-white backdrop-blur hover:bg-black/70 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}

          {/* Daylight View & Illuminated View Interactive Buttons */}
          {galleryImages.length > 1 && (
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-3.5 right-3.5 z-20 flex items-center bg-background/95 dark:bg-black/90 backdrop-blur-md rounded-full p-1 border border-border/80 shadow-lg gap-1"
            >
              {/* Button 1: Daylight View (Image 1) */}
              <button
                type="button"
                onClick={() => handleSelectIndex(0)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentIndex === 0
                    ? "bg-amber-500 text-black shadow-sm font-bold scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                title="View in Natural Daylight (Image 1)"
              >
                <Sun className={`h-3.5 w-3.5 ${currentIndex === 0 ? "text-black fill-current" : "text-amber-500"}`} />
                <span>Daylight View</span>
              </button>

              {/* Button 2: Illuminated View (Image 2) */}
              <button
                type="button"
                onClick={() => handleSelectIndex(1)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  currentIndex === 1
                    ? "bg-indigo-600 text-white shadow-sm font-bold scale-105"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                }`}
                title="View Illuminated in Dark (Image 2)"
              >
                <Moon className={`h-3.5 w-3.5 ${currentIndex === 1 ? "text-amber-300 fill-current" : "text-indigo-400"}`} />
                <span>Illuminated View</span>
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Thumbnails Strip — Synchronized with Daylight/Illuminated Views */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {galleryImages.map((imgUrl, index) => {
            const isActive = index === currentIndex;
            const isDayThumb = index === 0;
            const isNightThumb = index === 1;

            return (
              <button
                key={`${imgUrl}-${index}`}
                type="button"
                onClick={() => handleSelectIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all p-1 ${
                  isActive
                    ? isNightThumb
                      ? "border-indigo-500 ring-2 ring-indigo-500/40 shadow-md scale-105 bg-black/80"
                      : "border-amber-500 ring-2 ring-amber-500/40 shadow-md scale-105 bg-card"
                    : "border-border/60 hover:border-primary/50 opacity-70 hover:opacity-100 bg-muted/20"
                }`}
                title={
                  isDayThumb
                    ? "Daylight View (Image 1)"
                    : isNightThumb
                    ? "Illuminated View (Image 2)"
                    : `View ${index + 1}`
                }
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />

                {/* Small indicator tag on thumbnail */}
                {isDayThumb && (
                  <span className="absolute bottom-0.5 right-0.5 p-0.5 rounded-full bg-amber-500/90 text-black">
                    <Sun className="h-2.5 w-2.5 fill-current" />
                  </span>
                )}
                {isNightThumb && (
                  <span className="absolute bottom-0.5 right-0.5 p-0.5 rounded-full bg-indigo-600/90 text-white">
                    <Moon className="h-2.5 w-2.5 fill-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Full-Screen Lightbox Modal with Synchronized Controls */}
      {/* ========================================================================= */}
      {lightboxOpen && (
        <div
          ref={lightboxContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-md select-none touch-none"
        >
          {/* Top Bar Controls */}
          <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
            <div className="flex items-center gap-3">
              <span className="font-serif text-white text-sm font-semibold truncate max-w-[200px] sm:max-w-md">
                {productName}
              </span>
              <Badge className="bg-white/10 text-white border-white/20 font-mono text-xs">
                {currentIndex + 1} / {galleryImages.length}
              </Badge>
            </div>

            {/* Daylight / Illuminated View Switcher in Lightbox Header */}
            {galleryImages.length > 1 && (
              <div className="hidden sm:flex items-center bg-white/10 backdrop-blur-md rounded-full p-0.5 border border-white/15 gap-1">
                <button
                  type="button"
                  onClick={() => handleSelectIndex(0)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentIndex === 0
                      ? "bg-amber-500 text-black shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Sun className="h-3 w-3" /> Daylight
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectIndex(1)}
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                    currentIndex === 1
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-white/70 hover:text-white"
                  }`}
                >
                  <Moon className="h-3 w-3" /> Illuminated
                </button>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setLightboxOpen(false);
                  resetZoom();
                }}
                className="h-9 w-9 rounded-full bg-white/10 text-white hover:bg-white/20 hover:text-white"
                title="Close (Esc)"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Main Zoomable Viewport */}
          <div className="relative flex-1 flex items-center justify-center overflow-hidden p-2 sm:p-6">
            <div
              style={{
                transform: `translate(${panPosition.x}px, ${panPosition.y}px) scale(${zoomScale})`,
                cursor: zoomScale > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
              }}
              className="max-w-full max-h-full flex items-center justify-center"
              onClick={() => {
                if (zoomScale === 1) {
                  setZoomScale(2);
                } else if (!isDragging) {
                  resetZoom();
                }
              }}
            >
              <img
                src={currentImageUrl}
                alt={productName}
                className={`max-w-[90vw] max-h-[80vh] object-contain drop-shadow-2xl pointer-events-none ${
                  isIlluminated ? "drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]" : ""
                }`}
                draggable={false}
              />
            </div>

            {/* Prev / Next Arrows in Lightbox */}
            {galleryImages.length > 1 && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 text-white border border-white/10 hover:bg-black/90 hover:text-white shadow-xl z-20"
                  title="Previous (Left Arrow)"
                >
                  <ChevronLeft className="h-8 w-8" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full bg-black/60 text-white border border-white/10 hover:bg-black/90 hover:text-white shadow-xl z-20"
                  title="Next (Right Arrow)"
                >
                  <ChevronRight className="h-8 w-8" />
                </Button>
              </>
            )}
          </div>

          {/* Bottom Floating Zoom & Thumbnail Strip Controls */}
          <div className="relative z-20 flex flex-col items-center gap-3 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            {/* Zoom Controls Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-md shadow-2xl">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomOut}
                disabled={zoomScale <= 1}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white disabled:opacity-30"
                title="Zoom Out (-)"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>

              <span className="font-mono text-xs text-white w-14 text-center font-medium">
                {Math.round(zoomScale * 100)}%
              </span>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleZoomIn}
                disabled={zoomScale >= 4}
                className="h-8 w-8 rounded-full text-white hover:bg-white/20 hover:text-white disabled:opacity-30"
                title="Zoom In (+)"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>

              {zoomScale > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={resetZoom}
                  className="h-8 w-8 rounded-full text-amber-400 hover:bg-white/20"
                  title="Reset Zoom"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Lightbox Mini Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-2 max-w-full overflow-x-auto py-1 scrollbar-none">
                {galleryImages.map((imgUrl, idx) => (
                  <button
                    key={`lb-thumb-${idx}`}
                    onClick={() => handleSelectIndex(idx)}
                    className={`h-12 w-12 rounded-md overflow-hidden border-2 transition-all p-0.5 flex-shrink-0 bg-white/5 ${
                      idx === currentIndex
                        ? "border-amber-400 scale-110 shadow-md ring-2 ring-amber-400/40"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img src={imgUrl} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
