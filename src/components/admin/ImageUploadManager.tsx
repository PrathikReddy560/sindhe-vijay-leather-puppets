import React, { useState, useRef } from "react";
import { Upload, X, Star, ArrowLeft, ArrowRight, Loader2, Sun, Moon, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  featuredImage?: string;
  onFeaturedChange?: (featured: string) => void;
  dayImage?: string;
  onDayImageChange?: (dayUrl: string) => void;
  nightImage?: string;
  onNightImageChange?: (nightUrl: string) => void;
  title?: string;
}

export const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  images,
  onChange,
  featuredImage,
  onFeaturedChange,
  dayImage,
  onDayImageChange,
  nightImage,
  onNightImageChange,
  title = "Product Images & Gallery",
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Upload any files to Supabase Storage
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];
    const fileArray = Array.from(files);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Generous file size limit (up to 50MB)
        if (file.size > 50 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 50MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        setUploadProgress(`Uploading ${i + 1} of ${fileArray.length} (${file.name})...`);

        const ext = file.name.split(".").pop() || "jpg";
        const cleanName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
        const path = `${Date.now()}_${cleanName}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          toast({
            title: "Upload failed",
            description: `Could not upload ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(path);

        if (publicUrl) {
          newUrls.push(publicUrl);
        }
      }

      if (newUrls.length > 0) {
        const updatedImages = [...images, ...newUrls];
        onChange(updatedImages);

        // Auto-assign day image or featured image if not set
        if (onFeaturedChange && (!featuredImage || !images.includes(featuredImage))) {
          onFeaturedChange(updatedImages[0]);
        }
        if (onDayImageChange && !dayImage) {
          onDayImageChange(updatedImages[0]);
        }
        if (onNightImageChange && !nightImage && updatedImages.length > 1) {
          onNightImageChange(updatedImages[1]);
        }

        toast({
          title: "Files uploaded successfully",
          description: `Added ${newUrls.length} file${newUrls.length > 1 ? "s" : ""}.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Upload error",
        description: err.message || "An unexpected error occurred during upload.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrl.trim();
    if (!trimmed) return;

    if (images.includes(trimmed)) {
      toast({ title: "Image already in gallery", variant: "destructive" });
      return;
    }

    const updated = [...images, trimmed];
    onChange(updated);
    if (onFeaturedChange && !featuredImage) {
      onFeaturedChange(trimmed);
    }
    if (onDayImageChange && !dayImage) {
      onDayImageChange(trimmed);
    }
    setManualUrl("");
    setShowUrlInput(false);
    toast({ title: "Image URL added" });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);

    if (featuredImage === removedUrl && onFeaturedChange) {
      onFeaturedChange(updated[0] || "");
    }
    if (dayImage === removedUrl && onDayImageChange) {
      onDayImageChange(updated[0] || "");
    }
    if (nightImage === removedUrl && onNightImageChange) {
      onNightImageChange(updated[1] || "");
    }
  };

  const handleMove = (index: number, direction: "left" | "right") => {
    const targetIndex = direction === "left" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const newImages = [...images];
    const temp = newImages[index];
    newImages[index] = newImages[targetIndex];
    newImages[targetIndex] = temp;
    onChange(newImages);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUploadFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <Label className="text-sm font-semibold">{title}</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Upload any file formats (JPG, PNG, WEBP, AVIF, HEIC, TIFF, MP4, etc.). Set Day & Night views.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs h-7"
        >
          {showUrlInput ? "Cancel URL" : "+ Add by URL"}
        </Button>
      </div>

      {/* Manual URL Input */}
      {showUrlInput && (
        <div className="flex gap-2 p-3 bg-muted/40 rounded-lg border">
          <Input
            placeholder="Paste file/image URL (https://...)"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 text-sm h-9"
          />
          <Button type="button" size="sm" onClick={handleAddManualUrl} disabled={!manualUrl.trim()}>
            Add URL
          </Button>
        </div>
      )}

      {/* Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
        } ${isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="*/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{uploadProgress || "Uploading files..."}</p>
            <p className="text-xs text-muted-foreground">Please wait while files are uploaded to storage.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Click or drag & drop to upload any files
            </p>
            <p className="text-xs text-muted-foreground">
              Supports all file types (PNG, JPG, WEBP, AVIF, HEIC, GIF, SVG, etc. up to 50MB)
            </p>
          </div>
        )}
      </div>

      {/* Image Gallery Cards with Day / Night / Featured Toggles */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
            <span>{images.length} File{images.length !== 1 ? "s" : ""} in Gallery</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-amber-500 font-medium">☀️ = Day View</span>
              <span className="flex items-center gap-1 text-indigo-500 font-medium">🌙 = Night View</span>
              <span className="flex items-center gap-1 text-primary font-medium">★ = Main Image</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, index) => {
              const isFeatured = url === featuredImage || (!featuredImage && index === 0);
              const isDay = url === dayImage || (!dayImage && index === 0);
              const isNight = url === nightImage;

              return (
                <div
                  key={`${url}-${index}`}
                  className={`group relative rounded-lg border bg-card overflow-hidden transition-all flex flex-col justify-between ${
                    isFeatured
                      ? "ring-2 ring-primary border-primary shadow-sm"
                      : isNight
                      ? "ring-2 ring-indigo-500 border-indigo-500/80"
                      : "hover:border-primary/50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-muted/30 relative flex items-center justify-center p-2">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className={`w-full h-full object-contain ${isNight ? "bg-black/90 p-1 rounded" : ""}`}
                      loading="lazy"
                    />

                    {/* Tag Badges */}
                    <div className="absolute top-1.5 left-1.5 flex flex-col gap-1">
                      {isDay && (
                        <Badge className="bg-amber-500 text-black font-semibold text-[9px] px-1.5 py-0 flex items-center gap-0.5 shadow-sm">
                          <Sun className="h-2.5 w-2.5 fill-current" /> Day
                        </Badge>
                      )}
                      {isNight && (
                        <Badge className="bg-indigo-600 text-white font-semibold text-[9px] px-1.5 py-0 flex items-center gap-0.5 shadow-sm">
                          <Moon className="h-2.5 w-2.5 fill-current" /> Night
                        </Badge>
                      )}
                      {isFeatured && !isDay && (
                        <Badge className="bg-primary text-primary-foreground font-semibold text-[9px] px-1.5 py-0 flex items-center gap-0.5 shadow-sm">
                          <Star className="h-2.5 w-2.5 fill-current" /> Main
                        </Badge>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-90 transition-colors shadow-sm"
                      title="Remove file"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Day / Night / Featured Selection Controls */}
                  <div className="p-1.5 bg-muted/40 border-t space-y-1">
                    <div className="grid grid-cols-2 gap-1">
                      {onDayImageChange && (
                        <Button
                          type="button"
                          variant={isDay ? "default" : "outline"}
                          size="sm"
                          className={`h-6 text-[10px] px-1.5 font-medium ${
                            isDay ? "bg-amber-500 hover:bg-amber-600 text-black font-bold" : ""
                          }`}
                          onClick={() => {
                            onDayImageChange(url);
                            if (onFeaturedChange) onFeaturedChange(url);
                            toast({ title: "Set as Day View image" });
                          }}
                        >
                          <Sun className="h-3 w-3 mr-1 text-amber-500" />
                          {isDay ? "Day ✓" : "Set Day"}
                        </Button>
                      )}

                      {onNightImageChange && (
                        <Button
                          type="button"
                          variant={isNight ? "default" : "outline"}
                          size="sm"
                          className={`h-6 text-[10px] px-1.5 font-medium ${
                            isNight ? "bg-indigo-600 hover:bg-indigo-700 text-white font-bold" : ""
                          }`}
                          onClick={() => {
                            onNightImageChange(url);
                            toast({ title: "Set as Night / Illuminated View image" });
                          }}
                        >
                          <Moon className="h-3 w-3 mr-1 text-indigo-400" />
                          {isNight ? "Night ✓" : "Set Night"}
                        </Button>
                      )}
                    </div>

                    {/* Reorder Arrows */}
                    <div className="flex items-center justify-between pt-0.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => handleMove(index, "left")}
                        disabled={index === 0}
                        title="Move Left"
                      >
                        <ArrowLeft className="h-3 w-3" />
                      </Button>
                      <span className="text-[10px] text-muted-foreground font-mono">#{index + 1}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => handleMove(index, "right")}
                        disabled={index === images.length - 1}
                        title="Move Right"
                      >
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
