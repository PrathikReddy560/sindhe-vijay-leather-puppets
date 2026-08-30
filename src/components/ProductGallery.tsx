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
  onToggleNight?: () => void;
  hasNightImage?: boolean;
  dayImage?: string;
  nightImage?: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  isNight = false,
  onToggleNight,
  hasNightImage = false,
  dayImage,
  nightImage,
}) => {
  // Guard against empty image array
  const galleryImages = images && images.length > 0 ? images : ["/images/products/big-ganesha.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

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

  // Navigation handlers
  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : galleryImages.length - 1));
    resetZoom();
  }, [galleryImages.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < galleryImages.length - 1 ? prev + 1 : 0));
    resetZoom();
  }, [galleryImages.length]);

  const resetZoom = () => {
    setZoomScale(1);
    setPanPosition({ x: 0, y: 0 });
  };

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
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, handlePrev, handleNext]);

  // Desktop Mouse Wheel Zoom in Lightbox
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(prev + 0.25, 4));
    } else {
      setZoomScale((prev) => {
        const next = Math.max(prev - 0.25, 1);
        if (next === 1) setPanPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Desktop Mouse Drag/Pan when zoomed
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomScale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - panPosition.x,
      y: e.clientY - panPosition.y,
    };
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

  // Mobile Touch Gestures (Pinch zoom, Double tap, Swipe)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom start
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      touchStateRef.current.initialDistance = dist;
      touchStateRef.current.initialScale = zoomScale;
    } else if (e.touches.length === 1) {
      const now = Date.now();
      const timeSinceLastTap = now - touchStateRef.current.lastTap;

      // Double-tap detector (< 300ms)
      if (timeSinceLastTap < 300) {
        if (zoomScale > 1) {
          resetZoom();
        } else {
          setZoomScale(2.5);
        }
      }
      touchStateRef.current.lastTap = now;

      // Single touch start for pan or swipe
      touchStateRef.current.touchStartX = e.touches[0].clientX;
      touchStateRef.current.touchStartY = e.touches[0].clientY;

      if (zoomScale > 1) {
        dragStartRef.current = {
          x: e.touches[0].clientX - panPosition.x,
          y: e.touches[0].clientY - panPosition.y,
        };
      }
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Pinch to zoom
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (touchStateRef.current.initialDistance > 0) {
        const factor = dist / touchStateRef.current.initialDistance;
        const newScale = Math.min(Math.max(touchStateRef.current.initialScale * factor, 1), 4);
        setZoomScale(newScale);
        if (newScale === 1) setPanPosition({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1 && zoomScale > 1) {
      // Pan zoomed image
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

      // Horizontal swipe threshold 50px
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStateRef.current.initialDistance = 0;
  };

  const currentImageUrl = isNight
    ? (nightImage || galleryImages[1] || galleryImages[0])
    : (galleryImages[currentIndex] || dayImage || galleryImages[0]);

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
          className={`relative aspect-square overflow-hidden rounded-xl border bg-muted/40 transition-colors duration-500 cursor-zoom-in flex items-center justify-center ${
            isNight ? "bg-black/90" : "bg-card"
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={`${currentImageUrl}-${isNight}`}
              src={currentImageUrl}
              alt={`${productName} view ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.3 }}
              className={`h-full w-full object-contain p-2 transition-all duration-300 ${
                isNight ? "opacity-95 mix-blend-screen drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]" : ""
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
        </div>

        {/* Day / Night View Toggle (if available) */}
        {hasNightImage && onToggleNight && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="absolute bottom-4 right-4 gap-2 bg-background/90 backdrop-blur border-border/80 shadow-md font-medium"
            onClick={onToggleNight}
          >
            {isNight ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-primary" />}
            {isNight ? "Daylight View" : "Illuminated View"}
          </Button>
        )}
      </motion.div>

      {/* Thumbnails Carousel / Strip */}
      {galleryImages.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {galleryImages.map((imgUrl, index) => {
            const isActive = index === currentIndex;
            return (
              <button
                key={`${imgUrl}-${index}`}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden border-2 transition-all p-1 bg-muted/30 ${
                  isActive
                    ? "border-primary ring-2 ring-primary/30 shadow-md scale-105"
                    : "border-border/60 hover:border-primary/50 opacity-70 hover:opacity-100"
                }`}
              >
                <img
                  src={imgUrl}
                  alt={`Thumbnail ${index + 1}`}
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* Full-Screen Lightbox Modal with Multi-Touch, Pinch, and Wheel Zoom */}
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
                className="max-w-[90vw] max-h-[80vh] object-contain drop-shadow-2xl pointer-events-none"
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
                    onClick={() => {
                      setCurrentIndex(idx);
                      resetZoom();
                    }}
                    className={`h-12 w-12 rounded-md overflow-hidden border-2 transition-all p-0.5 flex-shrink-0 bg-white/5 ${
                      idx === currentIndex
                        ? "border-amber-400 scale-110 shadow-md"
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
