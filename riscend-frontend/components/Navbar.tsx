"use client";
import Link from "next/link";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

export default function Navbar() {
    const { account } = useWallet();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";
    const isAdmin = account?.address?.toString().toLowerCase() === adminAddress.toLowerCase();

    return (
        <nav className="w-full border-b border-slate-800/50 sticky top-0 bg-slate-950/90 backdrop-blur-xl z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
                {/* BRANDING RESTORED TO FULL NAME */}
                <Link href="/" className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 italic tracking-tighter whitespace-nowrap">
                    Riscend Alliance Protocol.
                </Link>

                {/* DESKTOP MENU (Hidden on Mobile) */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/explore" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all">Explore</Link>
                    <Link href="/raise" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all">Raise</Link>

                    {account && (
                        <>
                            <Link href="/dashboard/backer" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all">Portfolio</Link>
                            <Link href="/dashboard/founder" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all">Founder Hub</Link>
                        </>
                    )}

                    <Link href="/verify" className="group flex items-center gap-2">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[9px] font-black tracking-widest group-hover:bg-blue-500 transition-all shadow-[0_0_10px_rgba(37,99,235,0.4)]">VERIFY ID</span>
                    </Link>

                    {isAdmin && (
                        <Link href="/admin" className="text-[10px] font-black uppercase tracking-widest text-white bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg hover:border-cyan-400 transition-all">
                            Vault Admin
                        </Link>
                    )}

                    <div className="riscend-wallet-adapter">
                        <WalletSelector />
                    </div>
                </div>

                {/* MOBILE BUTTONS (Hidden on Desktop) */}
                <div className="md:hidden flex items-center gap-2">
                    <div className="riscend-wallet-adapter scale-75 origin-right">
                        <WalletSelector />
                    </div>
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} 
                        className="text-slate-400 hover:text-white p-1"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"} />
                        </svg>
                    </button>
                </div>
            </div>

            {/* MOBILE DROPDOWN MENU */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-6 space-y-6 shadow-xl">
                    <Link href="/explore" className="block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400" onClick={() => setIsMobileMenuOpen(false)}>Explore</Link>
                    <Link href="/raise" className="block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400" onClick={() => setIsMobileMenuOpen(false)}>Raise</Link>
                    
                    {account && (
                        <>
                            <Link href="/dashboard/backer" className="block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400" onClick={() => setIsMobileMenuOpen(false)}>Portfolio</Link>
                            <Link href="/dashboard/founder" className="block text-xs font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400" onClick={() => setIsMobileMenuOpen(false)}>Founder Hub</Link>
                        </>
                    )}
                    
                    <div className="pt-2">
                        <Link href="/verify" className="inline-block bg-blue-600 text-white px-4 py-2 rounded-full text-[10px] font-black tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>
                            VERIFY ID
                        </Link>
                    </div>

                    {isAdmin && (
                        <Link href="/admin" className="block mt-4 text-[10px] font-black uppercase tracking-widest text-amber-400" onClick={() => setIsMobileMenuOpen(false)}>
                            Vault Admin
                        </Link>
                    )}
                </div>
            )}
        </nav>
    );
}