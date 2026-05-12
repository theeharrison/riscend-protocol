"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

// FIXED: Changed to TESTNET to match your deployment
const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);

export default function BackerDashboard() {
    const { account } = useWallet();
    const [points, setPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // FIXED: Added fallback address
    const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";

    const fetchUserStats = async () => {
        if (!account || !adminAddress) return;
        try {
            const result: any = await aptos.view({
                payload: {
                    function: `${adminAddress}::crowdfund::get_user_points`,
                    functionArguments: [account.address.toString()],
                },
            });
            setPoints(Number(result[0]));
        } catch (e) {
            console.error("Error fetching points:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUserStats();
    }, [account, adminAddress]);

    const riscEstimation = (points / 1000).toFixed(2);
    const estimatedValueUSD = (Number(riscEstimation) * 1.50).toFixed(2);

    if (!account) {
        return (
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="p-12 text-center bg-slate-900/50 backdrop-blur-md rounded-2xl border border-slate-800 shadow-xl">
                    <div className="w-16 h-16 mx-auto bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <p className="text-slate-400 font-medium">Connect authentication to access your portfolio.</p>
                </div>
            </div>
        );
    }

    return (
        /* Added max-width, centering, and padding to prevent the 'edge' issue */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-12 pb-32">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-gradient-to-br from-blue-900/40 to-slate-950 border border-blue-500/30 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[40px] rounded-full group-hover:bg-blue-500/20 transition-all"></div>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest relative z-10">Network Influence</p>
                    <h2 className="text-5xl font-black text-white mt-3 relative z-10 drop-shadow-md">{loading ? "..." : points.toLocaleString()}</h2>
                    <p className="text-slate-500 text-[10px] mt-2 font-bold uppercase tracking-widest relative z-10">Total Success Points</p>
                </div>

                <div className="p-8 bg-slate-950/80 border border-slate-800 rounded-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[40px] rounded-full group-hover:bg-cyan-500/10 transition-all"></div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest relative z-10">Liquid Assets Preview</p>
                    <div className="mt-3 flex items-baseline gap-2 relative z-10">
                        <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 to-blue-500 drop-shadow-sm">{riscEstimation}</h2>
                        <span className="text-cyan-600 font-bold text-xl">$RISC</span>
                    </div>
                    <p className="text-emerald-500/70 text-xs mt-2 font-bold tracking-wide relative z-10">≈ ${estimatedValueUSD} USD</p>
                </div>

                <div className="p-8 bg-slate-950/80 border border-slate-800 rounded-2xl flex flex-col justify-center items-center text-center">
                    <div className="mb-4">
                        <p className="text-slate-400 text-sm font-medium mb-1">Vesting Status</p>
                        <span className="inline-block px-3 py-1 bg-amber-900/30 border border-amber-500/30 text-amber-400 text-[10px] font-black tracking-widest rounded uppercase">Pre-TGE</span>
                    </div>
                    <button className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-slate-500 border border-slate-700 rounded-xl font-bold text-xs transition-all uppercase tracking-widest cursor-not-allowed">
                        Bridge Locked
                    </button>
                </div>
            </div>

            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-5 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
                    <h3 className="text-white font-bold text-sm tracking-wide">Active Capital Deployments</h3>
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Network Secure</span>
                    </div>
                </div>

                <div className="p-16 text-center">
                    <div className="inline-flex p-5 rounded-2xl bg-slate-900/50 border border-slate-800 mb-4 shadow-inner">
                        <svg className="w-10 h-10 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    </div>
                    <p className="text-slate-400 text-sm font-medium">Your portfolio is currently empty.</p>
                    <p className="text-slate-600 text-xs mt-2">Investments will reflect here upon contract synchronization.</p>
                </div>
            </div>
        </div>
    );
}