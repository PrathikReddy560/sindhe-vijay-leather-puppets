import React, { useState, useRef } from "react";
import { Upload, X, Star, ArrowLeft, ArrowRight, Loader2, Plus, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadManagerProps {
  images: string[];
  onChange: (images: string[]) => void;
  featuredImage: string;
  onFeaturedChange: (featured: string) => void;
}

export const ImageUploadManager: React.FC<ImageUploadManagerProps> = ({
  images,
  onChange,
  featuredImage,
  onFeaturedChange,
}) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const [manualUrl, setManualUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Upload multiple files to Supabase Storage
  const handleUploadFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];
    const fileArray = Array.from(files);

    try {
      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];

        // Validation
        if (!file.type.startsWith("image/")) {
          toast({
            title: "Invalid file type",
            description: `${file.name} is not an image.`,
            variant: "destructive",
          });
          continue;
        }

        if (file.size > 15 * 1024 * 1024) {
          toast({
            title: "File too large",
            description: `${file.name} exceeds 15MB limit.`,
            variant: "destructive",
          });
          continue;
        }

        setUploadProgress(`Uploading ${i + 1} of ${fileArray.length}...`);

        const ext = file.name.split(".").pop() || "jpg";
        const cleanName = file.name.substring(0, file.name.lastIndexOf(".")).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 20);
        const path = `${Date.now()}_${cleanName}_${Math.random().toString(36).substring(2, 7)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(path, file, { cacheControl: "3600", upsert: false });

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

        // If no featured image or existing was empty, set first image as featured
        if (!featuredImage || !images.includes(featuredImage)) {
          onFeaturedChange(updatedImages[0]);
        }

        toast({
          title: "Images uploaded successfully",
          description: `Added ${newUrls.length} new image${newUrls.length > 1 ? "s" : ""}.`,
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
      toast({ title: "Image already added", variant: "destructive" });
      return;
    }

    const updated = [...images, trimmed];
    onChange(updated);
    if (!featuredImage) {
      onFeaturedChange(trimmed);
    }
    setManualUrl("");
    setShowUrlInput(false);
    toast({ title: "Image URL added" });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const removedUrl = images[indexToRemove];
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);

    // If removed image was featured, reassign featured to first available image
    if (featuredImage === removedUrl) {
      onFeaturedChange(updated[0] || "");
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

  const handleSetFeatured = (url: string) => {
    onFeaturedChange(url);
    toast({ title: "Featured image updated" });
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
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-semibold">Product Images & Gallery *</Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Select multiple images. Star the one you want as the Main/Featured image.
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
            placeholder="Paste image URL (https://...)"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            className="flex-1 text-sm h-9"
          />
          <Button type="button" size="sm" onClick={handleAddManualUrl} disabled={!manualUrl.trim()}>
            Add Image
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
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files && handleUploadFiles(e.target.files)}
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2 py-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{uploadProgress || "Uploading images..."}</p>
            <p className="text-xs text-muted-foreground">Please wait while images are saved to storage.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-center">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-1">
              <Upload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Click or drag & drop to upload images
            </p>
            <p className="text-xs text-muted-foreground">
              Support selecting multiple PNG, JPG, WEBP files at once (up to 15MB each)
            </p>
          </div>
        )}
      </div>

      {/* Image Gallery Cards */}
      {images.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{images.length} Image{images.length !== 1 ? "s" : ""} in Gallery (use arrows to reorder)</span>
            <span className="font-medium text-primary">★ = Featured/Main Image</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images.map((url, index) => {
              const isFeatured = url === featuredImage || (!featuredImage && index === 0);

              return (
                <div
                  key={`${url}-${index}`}
                  className={`group relative rounded-lg border bg-card overflow-hidden transition-all ${
                    isFeatured
                      ? "ring-2 ring-primary border-primary shadow-sm"
                      : "hover:border-primary/50"
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square bg-muted/30 relative flex items-center justify-center p-2">
                    <img
                      src={url}
                      alt={`Product preview ${index + 1}`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />

                    {/* Featured Star Badge */}
                    {isFeatured && (
                      <Badge className="absolute top-1.5 left-1.5 bg-primary text-primary-foreground font-semibold text-[10px] px-1.5 py-0 flex items-center gap-1 shadow-sm">
                        <Star className="h-3 w-3 fill-current" /> Main Image
                      </Badge>
                    )}

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveImage(index);
                      }}
                      className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-black/70 hover:bg-red-600 text-white flex items-center justify-center opacity-90 transition-colors shadow-sm"
                      title="Remove image"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Actions Bar below thumbnail */}
                  <div className="p-1.5 bg-muted/40 border-t flex items-center justify-between gap-1">
                    {/* Left Reorder */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMove(index, "left")}
                      disabled={index === 0}
                      title="Move Left"
                    >
                      <ArrowLeft className="h-3 w-3" />
                    </Button>

                    {/* Set as Featured Button */}
                    <Button
                      type="button"
                      variant={isFeatured ? "default" : "secondary"}
                      size="sm"
                      className={`h-6 text-[10px] px-2 font-medium ${
                        isFeatured ? "bg-primary text-primary-foreground pointer-events-none" : "hover:bg-primary/20"
                      }`}
                      onClick={() => handleSetFeatured(url)}
                    >
                      {isFeatured ? "★ Featured" : "Set Featured"}
                    </Button>

                    {/* Right Reorder */}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => handleMove(index, "right")}
                      disabled={index === images.length - 1}
                      title="Move Right"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </Button>
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
