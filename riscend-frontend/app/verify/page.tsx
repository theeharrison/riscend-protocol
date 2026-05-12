"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function VerifyPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        const status = localStorage.getItem("riscend_verified") === "true";
        if (status) { setIsVerified(true); setStep(3); }
    }, []);

    const startVerification = () => {
        setLoading(true);
        setTimeout(() => { setLoading(false); setStep(2); }, 3500);
    };

    const finalizeVerification = () => {
        setLoading(true);
        setTimeout(() => {
            setLoading(false);
            setIsVerified(true);
            setStep(3);
            localStorage.setItem("riscend_verified", "true");
        }, 2500);
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-6">
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-2xl shadow-blue-100/50 relative overflow-hidden">
                
                {/* THE "TWEAK": ANIMATED SCAN LINE */}
                {loading && step === 1 && (
                    <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="w-full h-[2px] bg-blue-500 shadow-[0_0_15px_blue] absolute top-0 animate-scan-move" />
                        <div className="absolute inset-0 bg-blue-500/5 animate-pulse" />
                    </div>
                )}

                <div className="flex justify-between mb-12 relative z-20">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className={`h-1.5 w-full rounded-full mx-1 transition-all duration-500 ${step >= i ? 'bg-blue-600' : 'bg-slate-100'}`} />
                    ))}
                </div>

                {step === 1 && (
                    <div className="text-center relative z-20">
                        <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <span className="text-4xl">🧬</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Biometric Vault</h2>
                        <p className="text-slate-500 mb-10 leading-relaxed">
                            Riscend uses <strong>Proof-of-Personhood</strong> to protect equity. 
                            Scan your ID or Face to unlock voting privileges.
                        </p>
                        <button 
                            onClick={startVerification}
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 transition-all flex justify-center items-center gap-3 disabled:bg-blue-300"
                        >
                            {loading ? "Initializing Scan..." : "Start Physical Scan"}
                        </button>
                    </div>
                )}

                {/* STEPS 2 AND 3 REMAIN THE SAME AS PREVIOUS CODE */}
                {step === 2 && (
                    <div className="text-center">
                        <div className="text-5xl mb-6">🛰️</div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Identity Located</h2>
                        <p className="text-slate-500 mb-10">We have mapped your physical markers to the global ledger.</p>
                        <button onClick={finalizeVerification} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Tether to Wallet</button>
                    </div>
                )}

                {step === 3 && (
                    <div className="text-center">
                        <div className="text-5xl mb-6">💎</div>
                        <h2 className="text-3xl font-black text-slate-900 mb-4">Verified Backer</h2>
                        <p className="text-slate-500 mb-10">Welcome to the inner circle. Your votes now carry 1.0x weight.</p>
                        <Link href="/explore" className="block w-full bg-blue-600 text-white py-4 rounded-2xl font-bold">Start Investing</Link>
                    </div>
                )}
            </div>
        </div>
    );
}