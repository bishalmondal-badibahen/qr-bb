"use client";

import { useState, useRef, useEffect } from "react";
import { ref, push } from "firebase/database";
import { db } from "@/lib/firebase";
import { compressAndUploadImage } from "@/lib/s3Upload";
import { checkFileSafety } from "@/lib/nsfwDetection";
import {
  Camera,
  X,
  ArrowRight,
  Loader2,
  RotateCw,
  ShieldAlert,
  Image as ImageIcon,
  ShieldCheck,
  Cross,
  CrossIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DynamicIsland from "./DynamicIsland";
import Image from "next/image";

interface LiveFormProps {
  onSuccess?: () => void;
}

export default function LiveForm({ onSuccess }: LiveFormProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [name, setName] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [wantsToSee, setWantsToSee] = useState<boolean | null>(null);

  const [showReconsider, setShowReconsider] = useState(false);
  const [pendingChoice, setPendingChoice] = useState<"yes" | "no" | null>(null);

  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isAllowed, setIsAllowed] = useState(false);

  // Revoke preview URL on cleanup / when preview changes
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Camera enable / disable
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
          } catch {
            /* ignore play failure */
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

  const toggleFacing = () =>
    setFacingMode((f) => (f === "user" ? "environment" : "user"));

  // ---------- Image selection / capture (NO NSFW check here) ----------
  const setImageAndPreview = (file: File) => {
    // revoke old preview if any
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const capturePhoto = async () => {
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

        // IMPORTANT: no safety check here, only set preview
        setImageAndPreview(file);
        setShowCamera(false);
      },
      "image/jpeg",
      0.9,
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    setImageAndPreview(file);

    // reset input so same file can be chosen again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = () => {
    if (preview) {
      try {
        URL.revokeObjectURL(preview);
      } catch {}
    }
    setImage(null);
    setPreview(null);
  };

  // ---------- Submission (NSFW check + upload / placeholder) ----------
  const handleSubmit = async () => {
    if (!name.trim() || !image || wantsToSee === null) return;
    setError(null);
    setLoading(true);
    setAnalyzing(true);
    setUploadProgress(null);

    try {
      const imageURL = await compressAndUploadImage(image);

      // 4) Push to Firebase
      await fetch("/api/addUser", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          imageURL,
          wantsToSee,
        }),
      });

      // small success animation delay
      setTimeout(() => {
        setName("");
        removeImage();
        setWantsToSee(null);
      }, 150);

      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setLoading(false);
      setAnalyzing(false);
      setUploadProgress(null);
    }
  };

  const handleNext = () => {
    if (step === 1 && name.trim()) {
      setStep(2);
    } else if (step === 2 && image) {
      setStep(3);
    } else if (step === 3 && wantsToSee !== null) {
      handleSubmit();
    }
  };

  const canProceed = () => {
    if (step === 1) return name.trim().length > 0;
    if (step === 2) return image !== null;
    if (step === 3) return wantsToSee !== null && isAllowed;
    return false;
  };

  return (
    <>
      {!showCamera && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <DynamicIsland />
        </div>
      )}

      <div className="fixed inset-0 h-screen bg-gradient-to-br from-white via-rose-50 to-rose-100 flex items-center justify-center overflow-hidden p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="relative z-10 w-full max-w-lg"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: 0.08,
                    type: "spring",
                    stiffness: 150,
                    damping: 10,
                  }}
                  className="mb-16"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl blur-xl opacity-40"></div>
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={100}
                      height={100}
                      className="relative w-24 h-24 object-contain mx-auto drop-shadow-lg"
                    />
                  </div>
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent mb-3"
                >
                  We need your vote
                </motion.h1>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-3xl md:text-4xl font-black bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent mb-3"
                >
                  To Nominate us in FMC 2025
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="text-2xl text-neutral-600 mb-6 font-medium"
                >
                  Just your name
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="relative flex items-center justify-center gap-6 mb-12 h-24"
                >
                  {/* Email Tag - Tilted Left, Floating */}
                  <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -15 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      rotate: -8,
                      y: [0, -8, 0],
                    }}
                    transition={{
                      opacity: { delay: 0.4, duration: 0.5 },
                      x: { delay: 0.4, duration: 0.5 },
                      rotate: { delay: 0.4, duration: 0.5 },
                      y: {
                        delay: 1,
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    whileHover={{
                      rotate: -12,
                      scale: 1.1,
                      y: -12,
                    }}
                    className="group relative cursor-pointer"
                  >
                    {/* Badge with strikethrough effect */}
                    <div className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-br from-rose-100 via-pink-50 to-rose-50 border-2 border-rose-400 rounded-2xl shadow-xl">
                      <motion.div
                        animate={{
                          rotate: [0, 15, -15, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <X
                          className="w-5 h-5 text-rose-600 font-bold"
                          strokeWidth={3}
                        />
                      </motion.div>
                      <span className="text-sm font-bold text-rose-700 relative">
                        <span className="">Email</span>
                        <motion.div
                          animate={{ scaleX: [0, 1] }}
                          transition={{ delay: 0.8, duration: 0.4 }}
                          className="absolute inset-0 bg-rose-500/20 rounded"
                        />
                      </span>
                      {/* Small sparkle */}
                      <motion.span
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [0, 180, 360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 0.5,
                        }}
                        className="absolute -top-2 -right-2 text-rose-400"
                      >
                        ✨
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Phone Tag - Tilted Right, Different Height */}
                  <motion.div
                    initial={{ opacity: 0, x: 50, rotate: 15 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      rotate: 8,
                      y: [0, 10, 0],
                    }}
                    transition={{
                      opacity: { delay: 0.5, duration: 0.5 },
                      x: { delay: 0.5, duration: 0.5 },
                      rotate: { delay: 0.5, duration: 0.5 },
                      y: {
                        delay: 1.3,
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut",
                      },
                    }}
                    whileHover={{
                      rotate: 12,
                      scale: 1.1,
                      y: -12,
                    }}
                    className="group relative cursor-pointer"
                  >
                    {/* Glow effect */}
                    {/*<div className="absolute inset-0 bg-gradient-to-bl from-pink-400 to-rose-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />*/}

                    {/* Badge with strikethrough effect */}
                    <div className="relative flex items-center gap-2 px-5 py-3 bg-gradient-to-bl from-pink-100 via-rose-50 to-pink-50 border-2 border-pink-400 rounded-2xl shadow-xl">
                      <motion.div
                        animate={{
                          rotate: [0, -15, 15, 0],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.7,
                        }}
                      >
                        <X
                          className="w-5 h-5 text-rose-600 font-bold"
                          strokeWidth={3}
                        />
                      </motion.div>
                      <span className="text-sm font-bold text-rose-700 relative">
                        <span className="">Phone</span>
                        <motion.div
                          animate={{ scaleX: [0, 1] }}
                          transition={{ delay: 0.9, duration: 0.4 }}
                          className="absolute inset-0 bg-rose-500/20 rounded"
                        />
                      </span>
                      {/* Small sparkle */}
                      <motion.span
                        animate={{
                          scale: [0, 1, 0],
                          rotate: [0, -180, -360],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          delay: 1,
                        }}
                        className="absolute -top-2 -left-2 text-pink-400"
                      >
                        ✨
                      </motion.span>
                    </div>
                  </motion.div>

                  {/* Decorative connecting line */}
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 1, duration: 0.6 }}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-0.5 bg-gradient-to-r from-rose-300 via-pink-300 to-rose-300 rounded-full opacity-30"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.38 }}
                  className="w-full"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" && canProceed() && handleNext()
                    }
                    placeholder="Your name..."
                    className="w-[80%] text-center text-2xl font-semibold py-3 px-4 bg-white/90 backdrop-blur-sm border-2 border-neutral-200 rounded-2xl focus:outline-none focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 transition-all placeholder:text-neutral-400 shadow-lg shadow-rose-500/5"
                    autoFocus
                  />
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.48 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`mt-10 px-8 py-3 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center gap-3 ${
                    canProceed()
                      ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:shadow-rose-500/50"
                      : "bg-white/10 border border-white text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-extrabold text-neutral-800 mb-3"
                >
                  Thank You
                </motion.h2>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-extrabold text-rose-600 mb-3"
                >
                  {name}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg text-neutral-600 mb-8"
                >
                  Now take your selfie
                  <span className="text-rose-500 font-semibold">*</span>
                </motion.p>

                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.38, type: "spring", stiffness: 200 }}
                  className="relative group mb-6 flex flex-col justify-center items-center"
                >
                  <button
                    onClick={() => setShowCamera(true)}
                    className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center relative shadow-2xl group-hover:shadow-rose-500/50 transition-all"
                  >
                    {preview ? (
                      <Image
                        src={preview}
                        alt="preview"
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl font-extrabold text-rose-500">
                        {name.charAt(0).toUpperCase()}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-12 h-12 text-white" />
                        </div>
                      </div>
                    )}
                  </button>

                  {/* small controls */}
                  <div className="mt-4 flex items-center gap-3 justify-center">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-full bg-white text-neutral-700 border border-neutral-200 shadow-sm hover:bg-neutral-50 transition"
                    >
                      <ImageIcon className="inline w-4 h-4 mr-2" />
                      Upload
                    </button>

                    {preview && (
                      <button
                        onClick={removeImage}
                        className="px-4 py-2 rounded-full bg-white text-neutral-700 border border-neutral-200 shadow-sm hover:bg-neutral-50 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(1)}
                    className="px-8 py-3 rounded-full font-semibold text-neutral-600 bg-white border-2 border-neutral-200 hover:border-neutral-300 transition-all"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleNext}
                    className="px-12 py-3 rounded-full font-bold text-white bg-rose-500 hover:bg-rose-600 shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
                  >
                    Continue
                    <ArrowRight className="w-5 h-5" />
                  </motion.button>
                </motion.div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.18 }}
                  className="text-3xl font-extrabold text-neutral-800 mb-3"
                >
                  You&apos;re amazing — just one last favour. Your voice truly
                  matters! ❤️
                </motion.h2>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28 }}
                  className="flex justify-center items-center text-center gap-2 mb-12"
                >
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="text-xl text-neutral-700 font-medium"
                  >
                    Do you want to see us at
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                    className="text-2xl text-rose-600 font-bold"
                  >
                    FMC 25 ?
                  </motion.p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.36 }}
                  className="flex gap-4 mb-8"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setWantsToSee(true);
                      setPendingChoice(null);
                    }}
                    className={`w-36 h-36 p-2 rounded-3xl font-bold text-2xl shadow-xl transition-all ${
                      wantsToSee === true
                        ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white scale-105 shadow-rose-500/50"
                        : "bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Yes, Inspire FMC 25 ✨
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setPendingChoice("no");
                      setShowReconsider(true);
                    }}
                    className={`w-36 h-36 p-2 rounded-3xl font-bold text-2xl shadow-xl transition-all ${
                      wantsToSee === false
                        ? "bg-gradient-to-br from-neutral-500 to-neutral-600 text-white scale-105 shadow-neutral-500/50"
                        : "bg-white text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    Not this time 🙏
                  </motion.button>
                </motion.div>

                <motion.div
                  className="flex flex-col items-center mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                >
                  <motion.p
                    className="text-sm text-rose-600 mb-6 tracking-wide"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 }}
                  >
                    Before you go — watch our 100-episode web series Salahkar
                    Didi on YouTube. Your subscription means a lot to us. 💛
                  </motion.p>

                  <motion.a
                    href="https://www.youtube.com/channel/UCDWIEfGiGn7AwS1iowyMzig"
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.07 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setIsAllowed(true);
                    }}
                    className="
                      relative flex items-center gap-2 px-6 py-3
                      rounded-2xl text-white font-semibold text-sm
                      bg-gradient-to-br from-red-500 via-red-600 to-red-700
                      shadow-[0_8px_20px_rgba(255,0,0,0.35)]
                      hover:shadow-[0_8px_30px_rgba(255,0,0,0.55)]
                      transition-all duration-300
                      backdrop-blur-xl
                      border border-white/20
                    "
                  >
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 opacity-30 pointer-events-none" />

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 drop-shadow-md"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.409 0 5.158 0 12s.488 8.59 4.385 8.816c3.6.245 11.626.246 15.23 0C23.512 20.59 24 18.842 24 12s-.488-8.59-4.385-8.816zM9.75 15.3V8.7l6.3 3.3-6.3 3.3z" />
                    </svg>

                    <span className="drop-shadow-sm">YouTube</span>
                  </motion.a>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="flex gap-4"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setStep(2)}
                    disabled={loading}
                    className="px-8 py-3 rounded-full font-semibold text-neutral-600 bg-white border-2 border-neutral-200 hover:border-neutral-300 transition-all disabled:opacity-50"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: canProceed() && !loading ? 1.05 : 1 }}
                    whileTap={{ scale: canProceed() && !loading ? 0.95 : 1 }}
                    onClick={handleNext}
                    disabled={!canProceed() || loading}
                    className={`px-12 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 ${
                      canProceed() && !loading
                        ? "bg-rose-500 text-white hover:bg-rose-600 hover:shadow-2xl"
                        : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
                    }`}
                  >
                    {loading && isAllowed ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>Submit ✨</>
                    )}
                  </motion.button>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Reconsider Modal */}
                <AnimatePresence>
                  {showReconsider && (
                    <motion.div
                      key="reconsider-modal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[999]"
                    >
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        transition={{
                          type: "spring",
                          stiffness: 220,
                          damping: 18,
                        }}
                        className="bg-white rounded-3xl p-6 w-[92%] max-w-md text-center shadow-2xl"
                      >
                        <div className="flex items-center justify-center mb-3">
                          <ShieldAlert className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-800 mb-2">
                          Are you sure?
                        </h3>

                        <p className="text-neutral-600 mb-6">
                          You chose <span className="font-semibold">No</span>.
                          If you skip now, we might miss one precious vote that
                          truly matters. Want to give it to Badi Bahen? 🌟
                        </p>

                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setWantsToSee(true);
                              setShowReconsider(false);
                              setPendingChoice(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold hover:bg-neutral-800 transition"
                          >
                            👉 Okay, count me in!
                          </button>

                          <button
                            onClick={() => {
                              setWantsToSee(false);
                              setShowReconsider(false);
                              setPendingChoice(null);
                            }}
                            className="px-4 py-2 rounded-xl bg-white border border-neutral-300 text-neutral-700 font-semibold hover:bg-neutral-50 transition"
                          >
                            No, I want to continue
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Camera overlay */}
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
    </>
  );
}
