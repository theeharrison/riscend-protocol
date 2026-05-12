"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
const APT_PRICE_USD = 200;

export default function FounderDashboard() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [myProjects, setMyProjects] = useState<any[]>([]);
    const [points, setPoints] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // FIXED: Added the fallback address so it perfectly matches the Admin Dashboard
    const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";

    const fetchFounderData = async () => {
        if (!account) return;
        try {
            const pointResult: any = await aptos.view({
                payload: {
                    function: `${adminAddress}::crowdfund::get_user_points`,
                    functionArguments: [account.address.toString()],
                },
            });
            setPoints(Number(pointResult[0]));

            const registryResult = await aptos.view({
                payload: {
                    function: `${adminAddress}::crowdfund::get_all_projects`,
                    functionArguments: [],
                },
            });
            const addresses = registryResult[0] as string[];

            const details = await Promise.all(
                addresses.map(async (addr) => {
                    const d: any = await aptos.view({
                        payload: {
                            function: `${adminAddress}::crowdfund::get_project_details`,
                            functionArguments: [addr],
                        },
                    });
                    return {
                        address: addr,
                        title: d[0],
                        goal: Number(d[2]) / 100_000_000,
                        balance: Number(d[3]) / 100_000_000,
                        released: Number(d[4]) / 100_000_000,
                        isValidated: d[5],
                        active: d[6],
                        milestoneRequested: d[7],
                    };
                })
            );

            setMyProjects(details.filter(p => p.address.toLowerCase() === account.address.toString().toLowerCase()));
        } catch (e) {
            console.error("Dashboard fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFounderData(); }, [account]);

    const handleRequestMilestone = async (projectAddr: string) => {
        try {
            const transaction: any = {
                data: {
                    function: `${adminAddress}::crowdfund::request_next_milestone`,
                    functionArguments: [projectAddr],
                },
            };
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: response.hash });
            alert("🚀 Milestone Phase 2 requested! Awaiting Admin approval.");
            fetchFounderData();
        } catch (e) {
            alert("Request failed. Ensure Phase 1 is finished.");
        }
    };

    if (!account) return <div className="p-10 text-slate-500 font-bold uppercase tracking-widest text-center border border-dashed border-slate-800 rounded-2xl">Awaiting Founder Authentication...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* HEADER STATS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-slate-900/80 border border-blue-500/20 rounded-2xl shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-500/10 blur-3xl rounded-full"></div>
                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest mb-1">Founder Reputation</p>
                    <h3 className="text-4xl font-black text-white">{points.toLocaleString()} <span className="text-sm text-slate-500 font-medium">XP</span></h3>
                </div>
                <div className="p-8 bg-slate-900/80 border border-purple-500/20 rounded-2xl shadow-[0_0_20px_rgba(168,85,247,0.1)] relative overflow-hidden">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-purple-500/10 blur-3xl rounded-full"></div>
                    <p className="text-[10px] text-purple-400 uppercase font-black tracking-widest mb-1">Protocol Equity</p>
                    <h3 className="text-4xl font-black text-white">7% <span className="text-sm text-slate-500 font-medium uppercase tracking-tighter">Institutional Stake</span></h3>
                </div>
            </div>

            {/* MY PROJECTS LIST */}
            <div className="space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                    My Ventures
                </h2>

                {myProjects.length === 0 ? (
                    <div className="p-12 text-center bg-slate-900/30 border border-slate-800 rounded-2xl border-dashed">
                        <p className="text-slate-500 italic font-medium">No active ventures registered to this identity.</p>
                    </div>
                ) : (
                    myProjects.map((p, i) => {
                        const totalNet = p.balance * 0.98;
                        const isPhase1Done = p.released > 0;
                        const canRequestPhase2 = isPhase1Done && !p.active && !p.milestoneRequested && (p.released < totalNet);

                        return (
                            <div key={i} className="p-8 bg-slate-950/50 border border-slate-800 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-8 group hover:border-slate-700 transition-all">
                                <div className="flex-1 space-y-4">
                                    <h4 className="text-2xl font-black text-white group-hover:text-cyan-300 transition-colors">{p.title}</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Capital</p>
                                            <p className="text-lg font-bold text-white">${(p.balance * APT_PRICE_USD).toLocaleString()}</p>
                                        </div>
                                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                            <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Liquidated</p>
                                            <p className="text-lg font-bold text-emerald-400">${(p.released * APT_PRICE_USD).toLocaleString()}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-full md:w-auto min-w-[200px]">
                                    {p.active ? (
                                        <div className="text-center py-4 px-6 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400 text-xs font-black tracking-widest uppercase">
                                            Fundraising Active
                                        </div>
                                    ) : p.milestoneRequested ? (
                                        <div className="text-center py-4 px-6 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400 text-xs font-black tracking-widest uppercase animate-pulse">
                                            Awaiting Verification
                                        </div>
                                    ) : p.released >= totalNet ? (
                                        <div className="text-center py-4 px-6 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-black tracking-widest uppercase">
                                            Venture Settled
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => handleRequestMilestone(p.address)}
                                            className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white text-xs font-black rounded-xl transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)] uppercase tracking-widest"
                                        >
                                            Request Phase 2 (50%)
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}