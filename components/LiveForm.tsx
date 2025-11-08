"use client";

import { useState, useRef, useEffect } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { compressAndUploadImage } from "@/lib/s3Upload";
import { Camera, X, Check, Loader2, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface LiveFormProps {
  onSuccess?: () => void;
}

export default function LiveForm({ onSuccess }: LiveFormProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [wantsToSee, setWantsToSee] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!showCamera) return;

    let mounted = true;

    async function enableCamera() {
      try {
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
          } catch {}
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

  const toggleFacing = () =>
    setFacingMode((f) => (f === "user" ? "environment" : "user"));

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const file = new File([blob], `camera_${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        setImage(file);
        setPreview(URL.createObjectURL(file));
        setShowCamera(false);
      },
      "image/jpeg",
      0.9
    );
  };

  const removeImage = () => {
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError(null);
    setLoading(true);

    try {
      let imageURL: string | null = null;
      if (image) {
        imageURL = await compressAndUploadImage(image);
      }

      await push(ref(db, "users"), {
        name,
        imageURL,
        wantsToSee,
        timestamp: Date.now(),
      });

      setName("");
      setImage(null);
      setPreview(null);

      // Call success callback to switch to thank-you tab
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen h-screen flex items-center justify-center bg-gradient-to-br from-neutral-100 to-rose-100 p-4">
      <main className="w-full max-w-[420px] p-5">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center gap-6 min-h-[calc(100vh-40px)] justify-center border border-neutral-200"
        >
          <div className="flex flex-col items-center gap-2">
            <img
              src="/logo.png"
              alt="logo"
              className="w-[72px] h-[72px] object-contain"
            />
            <h2 className="text-xl font-extrabold text-neutral-800">
              Quick Poll
            </h2>
            <p className="text-sm text-neutral-500">
              Your quick response helps us improve
            </p>
          </div>

          <div className="w-[140px] h-[140px]">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              aria-label="Open camera"
              className="w-full h-full rounded-full overflow-hidden bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center relative p-0 cursor-pointer transition-colors"
            >
              {preview ? (
                <img
                  src={preview}
                  alt="avatar"
                  className="w-full h-full object-cover block"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-rose-500 font-extrabold text-5xl">
                  {name?.charAt(0) ?? "?"}
                </div>
              )}

              {/* Camera overlay icon */}
              <div className="absolute right-2 bottom-2 w-9 h-9 rounded-full bg-rose-500 hover:bg-rose-600 flex items-center justify-center shadow-lg text-white transition-colors">
                <Camera className="w-4 h-4 text-white" />
              </div>
            </button>
          </div>

          <div className="w-full">
            <label
              htmlFor="name"
              className="text-sm font-medium text-neutral-700"
            >
              Name <span className="text-rose-500">*</span>
            </label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              disabled={loading}
              required
              className="h-11 mt-2 w-full border-neutral-300 focus:border-rose-500 focus:ring-rose-500"
            />
          </div>

          <div className="w-full">
            <div className="text-sm font-medium text-neutral-700">
              Do you want to see us?
            </div>
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setWantsToSee(true)}
                className={`${
                  wantsToSee
                    ? "bg-rose-500 text-white shadow-md"
                    : "bg-white text-neutral-700 hover:bg-neutral-50"
                } flex-1 py-2.5 rounded-lg border-2 ${
                  wantsToSee ? "border-rose-500" : "border-neutral-300"
                } font-medium transition-all`}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWantsToSee(false)}
                className={`${
                  !wantsToSee
                    ? "bg-rose-500 text-white shadow-md"
                    : "bg-white text-neutral-700 hover:bg-neutral-50"
                } flex-1 py-2.5 rounded-lg border-2 ${
                  !wantsToSee ? "border-rose-500" : "border-neutral-300"
                } font-medium transition-all`}
              >
                No
              </button>
            </div>
          </div>

          <div className="w-full">
            <Button
              type="submit"
              disabled={loading || !name.trim()}
              className="w-full text-base font-semibold rounded-xl h-12 bg-rose-500 hover:bg-rose-600 disabled:bg-neutral-300 disabled:text-neutral-500 text-white shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Check className="h-5 w-5 mr-2" />
                  <span>Submit</span>
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl w-full">
              <div className="flex items-start gap-3">
                <X className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-rose-800">Error</p>
                  <p className="text-sm text-rose-600 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>

      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
          <div className="relative flex-1 w-full h-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <button
                onClick={() => setShowCamera(false)}
                className="bg-neutral-900/60 backdrop-blur-sm p-3 rounded-full hover:bg-neutral-900/80 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex gap-2">
                <button
                  onClick={toggleFacing}
                  className="bg-neutral-900/60 backdrop-blur-sm p-3 rounded-full hover:bg-neutral-900/80 transition-colors"
                  aria-label="Switch camera"
                >
                  <RotateCw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="absolute left-0 right-0 bottom-8 flex justify-center pointer-events-auto">
              <button
                onClick={capturePhoto}
                aria-label="Capture"
                className="w-20 h-20 rounded-full bg-white hover:bg-neutral-100 border-4 border-rose-500 shadow-2xl transition-all active:scale-95"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
