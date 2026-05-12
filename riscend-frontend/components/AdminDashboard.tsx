"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
const APT_PRICE_USD = 200;

export default function AdminDashboard() {
    const { account, signAndSubmitTransaction } = useWallet();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [contractHashes, setContractHashes] = useState<{ [key: string]: string }>({});
    const [inputHash, setInputHash] = useState("");

    // Ensure this fallback is the ONLY place you need to change the address if .env fails
    const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";

    const fetchTreasuryData = async () => {
        try {
            const registryResult = await aptos.view({
                payload: {
                    function: `${adminAddress}::crowdfund::get_all_projects`,
                    functionArguments: [],
                },
            });
            const addresses = registryResult[0] as string[];
            const projectDetails = await Promise.all(
                addresses.map(async (addr) => {
                    const details: any = await aptos.view({
                        payload: {
                            function: `${adminAddress}::crowdfund::get_project_details`,
                            functionArguments: [addr],
                        },
                    });
                    return {
                        address: addr,
                        title: details[0],
                        goal: details[2] / 100000000,
                        balance: details[3] / 100000000,
                        released: details[4] / 100000000,
                        isValidated: details[5],
                        active: details[6],
                        milestoneRequested: details[7],
                    };
                })
            );
            setProjects(projectDetails);
            const saved = localStorage.getItem("riscend_legal_ledger");
            if (saved) setContractHashes(JSON.parse(saved));
        } catch (e) {
            console.error("Treasury fetch error:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (adminAddress) fetchTreasuryData();
    }, [adminAddress]);

    const handleFinalizePhase1 = async (projectAddr: string) => {
        try {
            const transaction: any = {
                data: {
                    function: `${adminAddress}::crowdfund::finalize_funding`,
                    functionArguments: [projectAddr],
                },
            };
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: response.hash });
            alert("Phase 1 Finalized: Capital Deployed.");
            fetchTreasuryData();
        } catch (e) { alert("Deployment failed. Ensure metrics are met."); }
    };

    const handleApproveMilestone = async (projectAddr: string) => {
        try {
            const transaction: any = {
                data: {
                    function: `${adminAddress}::crowdfund::approve_milestone`,
                    functionArguments: [projectAddr],
                },
            };
            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: response.hash });
            alert("Milestone Verified: Final Capital Deployed.");
            fetchTreasuryData();
        } catch (e) { alert("Verification failed."); }
    };

    const saveLegalHash = (address: string) => {
        const newHashes = { ...contractHashes, [address]: inputHash };
        setContractHashes(newHashes);
        localStorage.setItem("riscend_legal_ledger", JSON.stringify(newHashes));
        setInputHash("");
    };

    const isUserAdmin = account?.address?.toString().toLowerCase() === adminAddress.toLowerCase();

    if (!isUserAdmin) {
        return (
            <div className="py-32 text-center">
                <h2 className="text-3xl font-black text-slate-800">System Restricted</h2>
                <p className="text-slate-500 mt-2 tracking-widest uppercase text-sm">Awaiting Administrator Authentication</p>
            </div>
        );
    }

    if (loading) return <div className="text-cyan-400 py-32 animate-pulse text-center font-bold tracking-widest">SYNCING VAULT SECRETS...</div>;

    const totalVolume = projects.reduce((acc, proj) => acc + proj.balance, 0);
    const successfulProjects = projects.filter(proj => proj.balance >= proj.goal);
    const treasuryRevenue = successfulProjects.reduce((acc, proj) => acc + (proj.goal * 0.02), 0);

    return (
        <div className="max-w-7xl mx-auto px-6 py-16">
            <div className="w-full mt-4 mb-8 p-[1px] bg-gradient-to-r from-blue-500/30 via-cyan-400/30 to-purple-500/30 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.15)]">
                <div className="bg-slate-950/90 backdrop-blur-xl p-8 rounded-2xl h-full">
                    <div className="flex items-center justify-between mb-10 border-b border-slate-800/50 pb-6">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-md">
                            Treasury Operations
                        </h2>
                        <button onClick={fetchTreasuryData} className="text-xs font-bold uppercase tracking-widest bg-slate-900 border border-slate-700 hover:border-cyan-400 hover:text-cyan-400 px-4 py-2 rounded-lg text-slate-400 transition-all">
                            Sync Data
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 group-hover:shadow-[0_0_15px_rgba(59,130,246,1)] transition-all"></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">AUM (Volume)</p>
                            <p className="text-3xl font-black text-white">${(totalVolume * APT_PRICE_USD).toLocaleString()}</p>
                            <p className="text-slate-600 text-xs mt-1 font-mono">{totalVolume.toFixed(2)} APT</p>
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500 group-hover:shadow-[0_0_15px_rgba(16,185,129,1)] transition-all"></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Gross Revenue</p>
                            <p className="text-3xl font-black text-emerald-400">${(treasuryRevenue * APT_PRICE_USD).toLocaleString()}</p>
                            <p className="text-slate-600 text-xs mt-1 font-mono">{treasuryRevenue.toFixed(2)} APT</p>
                        </div>
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500 group-hover:shadow-[0_0_15px_rgba(168,85,247,1)] transition-all"></div>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Venture Equity</p>
                            <p className="text-3xl font-black text-purple-400">{successfulProjects.length} <span className="text-lg text-purple-500 font-medium">Assets</span></p>
                            <p className="text-slate-600 text-xs mt-1">7% Standard Stake</p>
                        </div>
                    </div>

                    <div className="overflow-x-auto rounded-xl border border-slate-800">
                        <table className="w-full text-left text-sm text-slate-400">
                            <thead className="text-[10px] text-slate-500 uppercase tracking-widest bg-slate-900/80 border-b border-slate-800">
                                <tr>
                                    <th className="px-6 py-4">Entity</th>
                                    <th className="px-6 py-4">Capital Metrics</th>
                                    <th className="px-6 py-4">Compliance Anchor</th>
                                    <th className="px-6 py-4 text-right">Deployment Status</th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-950/30">
                                {projects.map((proj, i) => {
                                    const isGoalMet = proj.balance >= proj.goal;
                                    const isFullyReleased = proj.released >= (proj.balance * 0.98);

                                    return (
                                        <tr key={i} className="border-b border-slate-800/50 hover:bg-slate-900/50 transition-colors">
                                            <td className="px-6 py-5 font-bold text-white text-base">
                                                {proj.title}
                                                {!proj.isValidated && <span className="block text-[9px] text-amber-500 uppercase tracking-widest mt-1">Awaiting Sign-off</span>}
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-medium text-slate-300">
                                                    ${(proj.balance * APT_PRICE_USD).toLocaleString()} <span className="text-slate-600 text-xs">/ ${(proj.goal * APT_PRICE_USD).toLocaleString()}</span>
                                                </div>
                                                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                                                    <div className="bg-cyan-500 h-full rounded-full shadow-[0_0_10px_rgba(6,182,212,0.8)] relative" style={{ width: `${Math.min((proj.balance / proj.goal) * 100, 100)}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 text-xs">
                                                {contractHashes[proj.address] ? (
                                                    <span className="text-emerald-400 font-mono bg-emerald-950/30 px-2 py-1 rounded border border-emerald-500/20">✅ {contractHashes[proj.address].slice(0, 12)}...</span>
                                                ) : (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text" placeholder="Enter Hash..."
                                                            onChange={(e) => setInputHash(e.target.value)}
                                                            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs outline-none focus:border-cyan-400 w-32"
                                                        />
                                                        <button onClick={() => saveLegalHash(proj.address)} className="bg-slate-800 hover:bg-slate-700 px-3 rounded-lg text-white font-bold transition-colors">Lock</button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-5 text-right">
                                                {proj.active && isGoalMet && (
                                                    <button onClick={() => handleFinalizePhase1(proj.address)} className="bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 hover:bg-emerald-500 hover:text-white text-[10px] px-4 py-2 rounded-lg font-black tracking-widest transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]">
                                                        DEPLOY PHASE 1
                                                    </button>
                                                )}
                                                {proj.milestoneRequested && (
                                                    <button onClick={() => handleApproveMilestone(proj.address)} className="bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500 hover:text-white text-[10px] px-4 py-2 rounded-lg font-black tracking-widest transition-all animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.4)]">
                                                        VERIFY MILESTONE
                                                    </button>
                                                )}
                                                {isFullyReleased && <span className="text-blue-400 text-[10px] font-black tracking-widest px-3 py-1 rounded bg-blue-900/20 border border-blue-500/30 shadow-[0_0_10px_rgba(59,130,246,0.2)]">SETTLED</span>}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}