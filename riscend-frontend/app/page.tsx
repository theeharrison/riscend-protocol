"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

// NEW: Live Text Changer Component
const TaglineChanger = () => {
    const phrases = [
        "The Liquidity Layer for Early-Stage Startups",
        "Bridging Fiat to Web3 Tokenization",
        "19% Revenue Share Infrastructure",
        "Sovereign Finance via Proof of Success",
        "The Lean Startup Engine for the Ascend Ecosystem"
    ];
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % phrases.length);
                setFade(true);
            }, 500);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <p className={`text-blue-500 font-bold uppercase tracking-widest text-sm mb-4 transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}>
            {phrases[index]}
        </p>
    );
};

export default function Home() {
    return (
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
            <div className="max-w-3xl">
                {/* LIVE TEXT ADDED HERE */}
                <TaglineChanger />
                
                {/* Responsive text sizing (text-5xl on phone, text-6xl on desktop) */}
                <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-8">
                    The new standard for <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 italic">startup equity.</span>
                </h1>
                <p className="text-lg md:text-xl text-slate-400 mb-10 leading-relaxed">
                    Riscend Protocol bridges the gap between traditional funding and blockchain security.
                    Your capital is automatically converted to stable liquidity, ensuring your 19% revenue share
                    is protected by the Ascend Ledger.
                </p>
                
                {/* Buttons stack on mobile (flex-col) and go side-by-side on larger screens (sm:flex-row) */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/explore" className="bg-blue-600 text-white text-center px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
                        Browse Startups
                    </Link>
                    <Link href="/verify" className="bg-slate-900 text-white border border-slate-700 text-center px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-all">
                        Verify Identity
                    </Link>
                </div>
            </div>

            {/* FEATURE GRID - 1 column on phone, 3 columns on tablet/desktop */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mt-24 md:mt-32">
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <h3 className="font-bold text-lg mb-2 text-white">Stable Growth</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Automatic conversion to price-stable assets keeps your investment safe from market volatility.</p>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <h3 className="font-bold text-lg mb-2 text-white">Verified Success</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Our Physical Verification portal ensures only real humans guide the protocol via upvotes.</p>
                </div>
                <div className="p-6 bg-slate-900/50 rounded-2xl border border-slate-800">
                    <h3 className="font-bold text-lg mb-2 text-white">19% Revenue Share</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">Fixed distribution standards are coded directly into the contract. No hidden legal fees.</p>
                </div>
            </div>
        </main>
    );
}