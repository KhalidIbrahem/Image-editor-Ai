"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Upload,
  Download,
  Loader2,
  Image as ImageIcon,
  Wand2,
  Paintbrush,
  Sparkles,
  Copy,
  Trash2,
} from "lucide-react";

interface EditResult {
  url: string;
  prompt: string;
  timestamp: number;
  imageCount?: number;
  type: "edit" | "generate";
}

export function ImageEditor() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<EditResult[]>([]);
  const [activeTab, setActiveTab] = useState("edit");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      // Support multiple images for nano-banana
      setSelectedImages(acceptedFiles);
      setSelectedImage(acceptedFiles[0]); // Keep first image for compatibility

      // Generate previews for all images
      const previewPromises = acceptedFiles.map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });

      Promise.all(previewPromises).then((previews) => {
        setImagePreviews(previews);
      });

      toast.success(`${acceptedFiles.length} image(s) uploaded successfully!`);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    multiple: true, // Allow multiple images for nano-banana
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 5, // Reasonable limit
  });

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleProcessImage = async () => {
    if (
      activeTab === "edit" &&
      (selectedImages.length === 0 || !prompt.trim())
    ) {
      toast.error("Please upload at least one image and enter a prompt");
      return;
    }

    if (activeTab === "generate" && !prompt.trim()) {
      toast.error("Please enter a prompt for image generation");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      let requestBody: any = { prompt: prompt.trim() };
      let apiEndpoint = "/api/image-edit";

      if (activeTab === "edit") {
        // Convert all images to base64 for editing
        const base64Images = await Promise.all(
          selectedImages.map((file) => convertFileToBase64(file))
        );
        requestBody.image = base64Images;
        toast.info(
          `Processing ${selectedImages.length} image(s) with nano-banana model...`
        );
      } else {
        // Image generation
        apiEndpoint = "/api/image-generate";
        toast.info("Generating image with Gemini 2.5 Flash...");
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      const response = await fetch(apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (data.success && data.output) {
        const newResult: EditResult = {
          url: data.output,
          prompt: prompt.trim(),
          timestamp: Date.now(),
          imageCount: activeTab === "edit" ? selectedImages.length : undefined,
          type: activeTab as "edit" | "generate",
        };

        setResults((prev) => [newResult, ...prev]);
        setProgress(100);
        toast.success(
          `Image ${activeTab === "edit" ? "edited" : "generated"} successfully!`
        );
      } else {
        // throw new Error(data.error || `Failed to ${activeTab} image`);
      }
    } catch (error: any) {
      console.error("Error processing image:", error);
      toast.error(`Error: ${error.message || `Failed to ${activeTab} image`}`);
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Image downloaded successfully!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const clearResults = () => {
    setResults([]);
    toast.info("Results cleared");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload and Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              {activeTab === "edit" ? "Upload & Edit" : "Generate Image"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Tab Selection */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" />
                  Edit Images
                </TabsTrigger>
                <TabsTrigger
                  value="generate"
                  className="flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generate Image
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="space-y-6 mt-6">
                {/* Image Upload for Editing */}
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/10"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {imagePreviews.length > 0 ? (
                    <div className="space-y-4">
                      {/* Grid layout for multiple images */}
                      <div
                        className={`grid gap-3 ${
                          imagePreviews.length === 1
                            ? "grid-cols-1"
                            : imagePreviews.length === 2
                            ? "grid-cols-2"
                            : "grid-cols-2 md:grid-cols-3"
                        }`}
                      >
                        {imagePreviews.map((preview, index) => (
                          <div key={index} className="relative">
                            <Image
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              width={150}
                              height={150}
                              className="w-full h-32 object-cover rounded-lg border"
                            />
                            <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                              {index + 1}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-sm text-muted-foreground text-center">
                        <p>{selectedImages.length} image(s) selected</p>
                        <p>Click or drag to replace images</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">
                          {isDragActive
                            ? "Drop images here"
                            : "Drag & drop images"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          or click to browse (max 5 images, 10MB each)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Model Info for Editing */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Paintbrush className="w-4 h-4 text-primary" />
                    <span className="font-medium">Google Nano-Banana</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Google's latest image editing model in Gemini 2.5. Supports
                    natural scene editing and style transfer.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="generate" className="space-y-6 mt-6">
                {/* Generation Preview */}
                <div className="border-2 border-dashed rounded-lg p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5">
                  <div className="space-y-4">
                    <Sparkles className="w-12 h-12 mx-auto text-primary" />
                    <div>
                      <p className="text-lg font-medium">AI Image Generation</p>
                      <p className="text-sm text-muted-foreground">
                        Describe what you want to create and AI will generate it
                      </p>
                    </div>
                  </div>
                </div>

                {/* Model Info for Generation */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="font-medium">Google Gemini 2.5 Flash</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Advanced AI model for generating high-quality, realistic
                    images from text descriptions.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Prompt Input */}
            <div className="space-y-2">
              <Label htmlFor="prompt">
                {activeTab === "edit" ? "Editing Prompt" : "Generation Prompt"}
              </Label>
              <Textarea
                id="prompt"
                placeholder={
                  activeTab === "edit"
                    ? "Describe what you want to do with the image..."
                    : "Describe the image you want to generate..."
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {activeTab === "generate" && (
                <p className="text-xs text-muted-foreground">
                  Example: "a tiger fighting with a lion in a city, realistic
                  photo 8k"
                </p>
              )}
            </div>

            {/* Process Button */}
            <Button
              onClick={handleProcessImage}
              disabled={
                (activeTab === "edit" &&
                  (selectedImages.length === 0 || !prompt.trim())) ||
                (activeTab === "generate" && !prompt.trim()) ||
                isProcessing
              }
              className="w-full"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {activeTab === "edit" ? (
                    <>
                      <Wand2 className="w-4 h-4 mr-2" />
                      Edit{" "}
                      {selectedImages.length > 0
                        ? `${selectedImages.length} Image(s)`
                        : "Images"}
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </>
              )}
            </Button>

            {/* Progress Bar */}
            {isProcessing && (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  {progress < 30
                    ? "Uploading image..."
                    : progress < 60
                    ? "Processing with nano-banana..."
                    : progress < 90
                    ? "Generating result..."
                    : "Almost done..."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="flex flex-col max-h-screen">
          <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Results ({results.length})
            </CardTitle>
            {results.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearResults}>
                <Trash2 className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden">
            {results.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No results yet</p>
                <p className="text-sm">
                  Upload images and process them to see results here
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {results.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">
                        {result.type === "generate" ? (
                          <>
                            <Sparkles className="w-3 h-3 mr-1" />
                            Generated
                          </>
                        ) : (
                          <>
                            <Paintbrush className="w-3 h-3 mr-1" />
                            {result.imageCount} Image
                            {result.imageCount && result.imageCount > 1
                              ? "s"
                              : ""}{" "}
                            Edited
                          </>
                        )}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>

                    {/* Image container with fixed aspect ratio and scroll */}
                    <div className="relative w-full max-h-96 overflow-auto border rounded-lg bg-muted/20">
                      <Image
                        src={result.url}
                        alt={`Result ${index + 1}`}
                        width={400}
                        height={400}
                        className="w-full h-auto object-contain"
                        style={{ minHeight: "200px" }}
                      />
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Prompt:</p>
                      <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        {result.prompt}
                      </p>
                    </div>

                    {/* Action buttons - always visible */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleDownload(
                            result.url,
                            `edited-image-${index + 1}.png`
                          )
                        }
                        className="flex-1"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(result.url)}
                        className="flex-1"
                      >
                        <Copy className="w-3 h-3 mr-1" />
                        Copy URL
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
