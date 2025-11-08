"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

export default function ThankYouPage() {
  const router = useRouter();
  const [canShow, setCanShow] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const confettiRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Check if user came from form submission
  useEffect(() => {
    const submitted = sessionStorage.getItem('formSubmitted');
    if (submitted === 'true') {
      // Clear flag after reading
      sessionStorage.removeItem('formSubmitted');
    } else {
      // Redirect to home if accessed directly without submission
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    // Dynamically import GSAP in the browser to avoid any SSR/runtime issues
    let tl: any = null;
    let gsap: any = null;

    async function run() {
      try {
        const mod = await import('gsap');
        gsap = mod.default || mod;
        tl = gsap.timeline();

        // entrance: container fade/scale
        tl.from(containerRef.current, { opacity: 0, y: 20, duration: 0.6, ease: "power2.out" });

        // check mark pop
        tl.fromTo(
          checkRef.current,
          { scale: 0, transformOrigin: "50% 50%" },
          { scale: 1, duration: 0.6, ease: "back.out(1.7)" },
          "-=.2"
        );

        // draw circle stroke (optional) — animate strokeDashoffset if present
        const strokeEl = checkRef.current ? checkRef.current.querySelector('.check-stroke') : null;
        if (strokeEl) {
          tl.fromTo(strokeEl as SVGElement, { strokeDashoffset: 100 }, { strokeDashoffset: 0, duration: 0.6, ease: 'power2.out' }, "-=.4");
        }

        // text fade in
        tl.from(textRef.current, { opacity: 0, y: 8, duration: 0.5, ease: 'power2.out' }, "-=.2");

        // confetti bursts
        confettiRefs.current.forEach((el, i) => {
          if (!el) return;
          const delay = 0.1 + i * 0.03;
          gsap.fromTo(el, { y: 0, opacity: 1, scale: 0.6 }, { y: -160 - Math.random() * 80, x: (Math.random() - 0.5) * 160, rotation: Math.random() * 360, opacity: 0, scale: 1, duration: 1.1 + Math.random() * 0.6, delay, ease: 'power3.out' });
        });
      } catch (err) {
        // If the animation lib fails, at least show the static UI
        // Avoid throwing so the page doesn't go white.
        // eslint-disable-next-line no-console
        console.error('Failed to load GSAP or run animations', err);
      }
    }

    run();

    return () => {
      if (tl && typeof tl.kill === 'function') tl.kill();
    };
  }, []);

  const colors = [
    '#D14362',
    '#B32C43',
    '#FC9B12',
    '#FFC30C',
    '#24B817'
  ];

  return (
    <div ref={containerRef} className="min-h-screen flex items-center justify-center bg-[color:var(--page-bg)] p-6">
      <div className="w-full max-w-[920px] text-center p-5">
        <div className="flex flex-col gap-6 rounded-[18px] p-6 bg-gradient-to-br from-[#D14362] to-[#B32C43] shadow-[0_18px_60px_rgba(18,20,26,0.35)] items-center text-white">
          <div className="relative w-[120px] h-[120px] m-2">
            <svg ref={checkRef} viewBox="0 0 120 120" width="120" height="120" aria-hidden className="block">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="6" strokeLinecap="round" className="check-stroke" style={{ strokeDasharray: 100, strokeDashoffset: 100 }} />
              <path d="M36 62 L52 78 L84 46" fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))' }} />
            </svg>

            {/* confetti pieces */}
            <div className="pointer-events-none">
              {Array.from({ length: 18 }).map((_, i) => (
                <div
                  key={i}
                  ref={(el) => { if (el) confettiRefs.current[i] = el; }}
                  className="absolute"
                  style={{
                    width: 10 + (i % 4),
                    height: 10 + ((i + 2) % 3),
                    borderRadius: 3,
                    background: colors[i % colors.length],
                    left: 50 + Math.random() * 40,
                    top: 40 + Math.random() * 20,
                    transform: `translate(-50%, -50%)`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <div ref={textRef} className="max-w-[680px] text-white">
            <h1 className="m-0 text-2xl font-extrabold leading-[1.05]">Thank you!</h1>
            <p className="mt-2 text-[15px] text-white/90">Your response has been recorded. We appreciate your time.</p>
            <div className="mt-4 flex gap-3 justify-center flex-wrap">
              <button
                onClick={() => router.push('/')}
                className="px-4 py-2 rounded-[12px] bg-white/10 hover:bg-white/20 transition-colors text-white font-bold min-w-[140px] cursor-pointer"
              >
                Back to home
              </button>
              <button
                onClick={() => router.push('/display')}
                className="px-4 py-2 rounded-[12px] border border-white/14 bg-transparent hover:bg-white/10 transition-colors text-white/95 font-bold min-w-[140px] cursor-pointer"
              >
                View responses
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
