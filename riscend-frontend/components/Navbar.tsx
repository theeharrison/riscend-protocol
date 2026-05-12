"use client";
import Link from "next/link";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";

export default function Navbar() {
    const { account } = useWallet();
    const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";
    const isAdmin = account?.address?.toString().toLowerCase() === adminAddress.toLowerCase();

    return (
        <nav className="w-full border-b border-slate-800/50 sticky top-0 bg-slate-950/70 backdrop-blur-xl z-50">
            <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                {/* BRANDING UPDATED */}
                <Link href="/" className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 italic tracking-tighter">
                    Riscend Protocol.
                </Link>

                <div className="flex items-center gap-8">
                    <Link href="/explore" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all">Explore</Link>
                    <Link href="/raise" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-cyan-400 transition-all">Raise</Link>

                    {/* NEW: DASHBOARD ACCESS POINTS */}
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
            </div>
        </nav>
    );
}