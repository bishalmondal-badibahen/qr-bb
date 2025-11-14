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
    Sparkles,
    ShieldAlert,
    Image as ImageIcon,
    ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import DynamicIsland from "./DynamicIsland";
import { div } from "@tensorflow/tfjs-core/dist/ops/ops_for_converter";

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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [checkingImage, setCheckingImage] = useState(false);

    const videoRef = useRef<HTMLVideoElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const inputRef = useRef<HTMLInputElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isAllowed, setIsAllowed] = useState(false);

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
                    } catch { }
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

    const validateAndSetImage = async (file: File) => {
        setCheckingImage(true);
        setError(null);

        try {
            // Check if image is safe
            const result = await checkFileSafety(file);

            if (!result.isSafe) {
                setError(result.message);
                setCheckingImage(false);
                return false;
            }

            // Image is safe, proceed
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setCheckingImage(false);
            return true;
        } catch (err) {
            console.error("Error checking image:", err);
            setError("Failed to verify image. Please try again.");
            setCheckingImage(false);
            return false;
        }
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
            async (blob) => {
                if (!blob) return;
                const file = new File([blob], `camera_${Date.now()}.jpg`, {
                    type: "image/jpeg",
                });

                // Validate image before setting
                await validateAndSetImage(file);

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

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }

        // Validate image
        const isValid = await validateAndSetImage(file);

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleSubmit = async () => {
        if (!name.trim() || !image || wantsToSee === null) return;
        setError(null);
        setLoading(true);

        try {
            const imageURL = await compressAndUploadImage(image);

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
        if (step === 3) return (wantsToSee !== null) && isAllowed;
        return false;
    };

    return (
        <>
            {/* Dynamic Island - Live Poll Counter (hidden when camera is open) */}
            {!showCamera && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
                    <DynamicIsland />
                </div>
            )}

            <div className="fixed inset-0 h-screen bg-gradient-to-br from-white via-rose-50 to-rose-100 flex items-center justify-center overflow-hidden p-4">
                {/* Main Content Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-lg"
                >
                    <AnimatePresence mode="wait">
                        {/* Step 1: Name */}
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
                                        delay: 0.1,
                                        type: "spring",
                                        stiffness: 150,
                                        damping: 10,
                                    }}
                                    className="mb-8"
                                >
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-gradient-to-br from-rose-400 to-rose-600 rounded-2xl blur-xl opacity-40"></div>
                                        <img
                                            src="/logo.png"
                                            alt="Logo"
                                            className="relative w-24 h-24 object-contain mx-auto drop-shadow-lg"
                                        />
                                    </div>
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="text-4xl md:text-5xl font-black bg-gradient-to-r from-rose-600 to-rose-500 bg-clip-text text-transparent mb-3"
                                >
                                    Quick Poll ✨
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg text-neutral-600 mb-12 font-medium"
                                >
                                    Let's start with your name
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
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
                                    transition={{ delay: 0.5 }}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleNext}
                                    disabled={!canProceed()}
                                    className={`mt-10 px-8 py-3 rounded-2xl font-bold text-lg shadow-2xl transition-all flex items-center gap-3 ${canProceed()
                                        ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 hover:shadow-rose-500/50"
                                        : "bg-white/10 border border-white text-neutral-500 cursor-not-allowed"
                                        }`}
                                >
                                    Continue
                                    <ArrowRight className="w-5 h-5" />
                                </motion.button>
                            </motion.div>
                        )}

                        {/* Step 2: Photo */}
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
                                    Great, {name}! 📸
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-lg text-neutral-600 mb-8"
                                >
                                    Now take your photo{" "}
                                    <span className="text-rose-500 font-semibold">*</span>
                                </motion.p>

                                {/* Hidden file input */}
                                {/* <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                /> */}

                                {/* Checking Image State */}
                                {checkingImage && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-6 p-4 rounded-2xl bg-blue-50 border-2 border-blue-200 flex items-center gap-3"
                                    >
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                                        <div className="flex items-center gap-2">
                                            <ShieldAlert className="w-5 h-5 text-blue-600" />
                                            <span className="text-blue-700 font-medium">
                                                Checking image safety...
                                            </span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Error Display */}
                                {error && !checkingImage && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="mb-6 p-4 rounded-2xl bg-red-50 border-2 border-red-200 flex items-start gap-3"
                                    >
                                        <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <div className="flex-1">
                                            <p className="text-red-700 font-medium">{error}</p>
                                            <button
                                                onClick={() => setError(null)}
                                                className="text-sm text-red-600 hover:text-red-700 underline mt-1"
                                            >
                                                Dismiss
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                <motion.button
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                                    onClick={() => setShowCamera(true)}
                                    disabled={checkingImage}
                                    className="relative group mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-40 h-40 rounded-full overflow-hidden bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center relative shadow-2xl group-hover:shadow-rose-500/50 transition-all">
                                        {preview ? (
                                            <img
                                                src={preview}
                                                alt="preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-6xl font-extrabold text-rose-500">
                                                {name.charAt(0).toUpperCase()}
                                            </div>
                                        )}

                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Camera className="w-12 h-12 text-white" />
                                        </div>
                                    </div>
                                </motion.button>

                                {/* Or upload from gallery */}
                                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mb-8 flex items-center gap-3"
                >
                  <div className="h-px bg-neutral-300 flex-1"></div>
                  <span className="text-sm text-neutral-500">or</span>
                  <div className="h-px bg-neutral-300 flex-1"></div>
                </motion.div>

                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.55 }}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={checkingImage}
                  className="mb-8 px-6 py-3 rounded-full font-semibold text-rose-600 bg-white border-2 border-rose-200 hover:border-rose-300 hover:bg-rose-50 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ImageIcon className="w-5 h-5" />
                  Choose from Gallery
                </motion.button> */}

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

                        {/* Step 3: Question */}
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
                                    transition={{ delay: 0.2 }}
                                    className="text-3xl font-extrabold text-neutral-800 mb-3"
                                >
                                    One last thing! 🎯
                                </motion.h2>

                                <motion.p
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-xl text-neutral-700 mb-12 font-medium"
                                >
                                    Do you want to see us?
                                </motion.p>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4 }}
                                    className="flex gap-4 mb-8"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setWantsToSee(true)
                                        }}
                                        className={`w-32 h-32 rounded-3xl font-bold text-2xl shadow-xl transition-all ${wantsToSee === true
                                            ? "bg-gradient-to-br from-rose-500 to-rose-600 text-white scale-105 shadow-rose-500/50"
                                            : "bg-white text-neutral-700 hover:bg-neutral-50"
                                            }`}
                                    >
                                        Yes 😊
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => {
                                            setWantsToSee(false)
                                        }}
                                        className={`w-32 h-32 rounded-3xl font-bold text-2xl shadow-xl transition-all ${wantsToSee === false
                                            ? "bg-gradient-to-br from-neutral-500 to-neutral-600 text-white scale-105 shadow-neutral-500/50"
                                            : "bg-white text-neutral-700 hover:bg-neutral-50"
                                            }`}
                                    >
                                        No 🙏
                                    </motion.button>
                                </motion.div>

                                <motion.div className="flex flex-col items-center mb-8">
                                    <p className="text-sm text-neutral-500 mb-8">
                                        Go to our YouTube channel for more!
                                    </p>
                                    <a
                                        href={"https://www.youtube.com/channel/UCDWIEfGiGn7AwS1iowyMzig"}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center w-[100px] h-[40px] bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition-colors duration-200 space-x-1.5 text-sm"
                                        onClick={() => { setIsAllowed(true) }}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 24 24"
                                            fill="currentColor"
                                            className="w-5 h-5"
                                        >
                                            <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0C.488 3.409 0 5.158 0 12s.488 8.59 4.385 8.816c3.6.245 11.626.246 15.23 0C23.512 20.59 24 18.842 24 12s-.488-8.59-4.385-8.816zM9.75 15.3V8.7l6.3 3.3-6.3 3.3z" />
                                        </svg>

                                        <span>YouTube</span>
                                    </a>
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
                                        disabled={(!canProceed() || loading)}
                                        className={`px-12 py-3 rounded-full font-bold shadow-xl transition-all flex items-center gap-2 ${canProceed() && !loading
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
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div >

                {showCamera && (
                    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col">
                        {checkingImage ? (
                            <div className="flex-1 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="mb-4">
                                        <ShieldCheck className="w-12 h-12 animate-spin mx-auto text-rose-500" />
                                    </div>
                                    <p className="text-lg font-semibold">
                                        Checking image safety...
                                    </p>
                                </div>
                            </div>
                        ) : (
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
                        )}
                    </div>
                )
                }
            </div >
        </>
    );
}
