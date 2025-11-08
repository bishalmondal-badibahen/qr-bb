"use client";

import { useState, useRef, useEffect } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { compressAndUploadImage } from "@/lib/s3Upload";
import { Camera, X, Check, Loader2, Sparkles, RotateCw } from "lucide-react";
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
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when user opens camera mode
  useEffect(() => {
    if (!showCamera) return;

    let mounted = true;

    async function enableCamera() {
      try {
        // stop any existing tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const constraints: MediaStreamConstraints = {
          video: { facingMode },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (!mounted) return;
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch (e) {
            // ignore autoplay play error
          }
        }
      } catch (err) {
        console.error(err);
        setError("Camera access denied or not available.");
        setShowCamera(false);
      }
    }

    enableCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [showCamera, facingMode]);

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
      // close camera to show avatar preview in form
      setShowCamera(false);
    }, "image/jpeg");
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const toggleFacing = () => {
    setFacingMode((f) => (f === "user" ? "environment" : "user"));
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

            {/* Photo (camera-only) */}
            <div className="space-y-3">
              <label className="text-sm font-medium leading-none">Photo <span className="text-muted-foreground">(capture only)</span></label>

              <div className="flex items-center gap-4">
                <div>
                  <div style={{ width: 72, height: 72, borderRadius: 9999, overflow: 'hidden', background: 'rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {preview ? (
                      <img src={preview} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', fontWeight: 700 }}>{name?.charAt(0) ?? '?'}</div>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="text-sm text-muted">Tap the camera to open full-screen capture</div>
                  <div className="mt-2 flex gap-2">
                    <Button type="button" onClick={() => setShowCamera(true)} className="btn-primary">
                      <Camera className="h-4 w-4" />
                      Open Camera
                    </Button>
                    {preview && (
                      <Button type="button" variant="outline" onClick={removeImage}>
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              </div>
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
        <div className="fixed inset-0 z-50 bg-black text-white" style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ position: 'relative', flex: 1, width: '100%', height: '100%' }}>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />

            {/* Top controls */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button onClick={() => setShowCamera(false)} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', padding: 8, borderRadius: 9999 }} aria-label="Close">
                <X />
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={toggleFacing} style={{ background: 'rgba(0,0,0,0.4)', border: 'none', padding: 8, borderRadius: 8 }} aria-label="Switch camera">
                  <RotateCw />
                </button>
              </div>
            </div>

            {/* Bottom capture area */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 24, display: 'flex', justifyContent: 'center', pointerEvents: 'auto' }}>
              <button onClick={capturePhoto} aria-label="Capture" style={{ width: 84, height: 84, borderRadius: 9999, background: 'rgba(255,255,255,0.9)', border: '6px solid rgba(0,0,0,0.15)' }} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
