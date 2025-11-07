"use client";

import { useState, useRef, useEffect } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { compressAndUploadImage } from "@/lib/s3Upload";
import { Camera, Upload, X, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LiveForm() {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Start camera when user opens camera mode
  useEffect(() => {
    if (!showCamera) return;

    async function enableCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error(err);
        setError("Camera access denied.");
        setShowCamera(false);
      }
    }

    enableCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, [showCamera]);

  // Capture a photo from camera
  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    const ctx = canvas.getContext("2d");
    ctx?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      setImage(file);
      setPreview(URL.createObjectURL(file));
      setShowCamera(false);
    }, "image/jpeg");
  };

  const handleFilePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;

    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      let imageURL = null;

      // Upload image to S3 with compression if present
      if (image) {
        console.log("📸 Uploading image to S3...");
        imageURL = await compressAndUploadImage(image);
        console.log("✅ Image uploaded successfully:", imageURL);
      }

      // Save to Firebase Realtime Database
      await push(ref(db, "users"), {
        name,
        imageURL,
        timestamp: Date.now(),
      });

      // Reset form state
      setName("");
      setImage(null);
      setPreview(null);
      setSuccess(true);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error("❌ Submission error:", err);
      setError(
        err instanceof Error
          ? `Failed to submit: ${err.message}`
          : "Failed to submit.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Card className="glass border-border/50 shadow-2xl animate-fade-in overflow-hidden">
        <CardHeader className="space-y-1 bg-gradient-to-br from-primary/5 via-purple-500/5 to-pink-500/5 border-b">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                Add New Entry
              </CardTitle>
              <CardDescription className="text-xs">
                Fill in the details below to create a new entry
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                disabled={loading}
                required
                className="h-11 transition-all duration-200 focus:scale-[1.01]"
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">
                Photo <span className="text-muted-foreground">(Optional)</span>
              </label>

              {preview ? (
                /* Image Preview */
                <div className="relative group animate-fade-in">
                  <div className="relative w-full aspect-video rounded-xl overflow-hidden border-2 border-border shadow-lg ring-4 ring-primary/10 transition-all duration-300 hover:ring-primary/20">
                    <img
                      src={preview}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <Button
                    type="button"
                    onClick={removeImage}
                    disabled={loading}
                    size="icon"
                    variant="destructive"
                    className="absolute top-3 right-3 h-9 w-9 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Badge
                    className="absolute top-3 left-3 shadow-lg"
                    variant="success"
                  >
                    <Check className="h-3 w-3 mr-1" />
                    Ready
                  </Badge>
                </div>
              ) : (
                /* Upload Options */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* File Upload Button */}
                  <Button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading}
                    variant="gradient"
                    className="h-auto py-6 rounded-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Upload Photo</div>
                        <div className="text-xs opacity-90">From gallery</div>
                      </div>
                    </div>
                  </Button>

                  {/* Camera Button */}
                  <Button
                    type="button"
                    onClick={() => setShowCamera(true)}
                    disabled={loading}
                    className="h-auto py-6 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Camera className="h-6 w-6" />
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">Take Photo</div>
                        <div className="text-xs opacity-90">Use camera</div>
                      </div>
                    </div>
                  </Button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFilePicker}
                    disabled={loading}
                    className="hidden"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              variant="success"
              size="lg"
              className="w-full text-base font-semibold rounded-xl h-12 hover:scale-[1.02] transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5" />
                  <span>Submit Entry</span>
                </>
              )}
            </Button>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-xl animate-fade-in">
                <div className="flex items-start gap-3">
                  <X className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-destructive">
                      Error
                    </p>
                    <p className="text-sm text-destructive/80 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-700 dark:text-green-400">
                      Success!
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-500">
                      Entry submitted successfully
                    </p>
                  </div>
                </div>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Camera Modal */}
      {showCamera && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-card rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden border border-border animate-slide-in">
            <div className="relative aspect-video bg-gray-900">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
              <Badge
                className="absolute top-4 left-4 shadow-lg"
                variant="destructive"
              >
                <div className="h-2 w-2 rounded-full bg-white mr-2 animate-pulse" />
                Recording
              </Badge>
            </div>

            <div className="p-6 space-y-3 bg-gradient-to-b from-background to-muted/20">
              <p className="text-sm text-muted-foreground text-center">
                Position yourself in the frame and click capture
              </p>
              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={capturePhoto}
                  variant="gradient"
                  size="lg"
                  className="flex-1 rounded-xl h-12 hover:scale-[1.02] transition-all duration-300"
                >
                  <Camera className="h-5 w-5" />
                  Capture Photo
                </Button>
                <Button
                  type="button"
                  onClick={() => setShowCamera(false)}
                  variant="outline"
                  size="lg"
                  className="rounded-xl h-12 px-6 hover:scale-[1.02] transition-all duration-300"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
