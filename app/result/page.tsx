"use client";

import { useEffect, useRef, useState } from "react";
import { ref, onValue } from "firebase/database";
import { db } from "@/lib/firebase";

export default function ResultPage() {
  const [yesCount, setYesCount] = useState<number>(0);
  const [total, setTotal] = useState<number>(0);
  const displayedRef = useRef<{ value: number }>({ value: 0 });
  const [displayed, setDisplayed] = useState<number>(0);

  // subscribe to users and compute yes only
  useEffect(() => {
    const usersRef = ref(db, 'users');
    const unsub = onValue(usersRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) {
        setTotal(0);
        setYesCount(0);
        return;
      }

      const entries = Object.values(val) as any[];
      const total = entries.length;
      let yes = 0;
      entries.forEach((e: any) => {
        if (e?.wantsToSee) yes++;
      });

      setTotal(total);
      setYesCount(yes);
    });

    return () => unsub();
  }, []);

  // animate the displayed counter when yesCount changes
  useEffect(() => {
    let rafId: number | null = null;
    const start = displayedRef.current.value || 0;
    const end = yesCount;
    const duration = 700; // ms
    const startTime = performance.now();

    function step(now: number) {
      const t = Math.min(1, (now - startTime) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(start + (end - start) * eased);
      displayedRef.current.value = current;
      setDisplayed(current);
      if (t < 1) {
        rafId = requestAnimationFrame(step);
      } else {
        rafId = null;
      }
    }

    // kick off
    rafId = requestAnimationFrame(step);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [yesCount]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-300 to-rose-300 p-5">
      <div className="w-full max-w-[720px] p-5 flex items-center justify-center">
        <div role="status" aria-live="polite" className="flex flex-col items-center gap-3">
          <div className="text-[14px] text-[color:var(--muted,#6b7280)] uppercase tracking-[1.2px]">Yes (wantsToSee)</div>
          <div className="w-[260px] h-[260px] rounded-[20px] bg-[color:var(--surface,#fff)] shadow-[0_18px_40px_rgba(0,0,0,0.08)] flex items-center justify-center">
            <div className="text-center">
              <div className="text-[96px] font-extrabold text-[color:var(--bprimary)]">{displayed}</div>
              <div className="mt-1.5 text-[color:var(--muted,#6b7280)]">of {total} responses</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
