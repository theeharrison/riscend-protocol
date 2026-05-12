"use client";
import { useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
const APT_PRICE_USD = 200;

export default function CreateProject() {
    const { account, signAndSubmitTransaction } = useWallet();

    const [title, setTitle] = useState("");
    const [goal, setGoal] = useState("");
    const [isDeploying, setIsDeploying] = useState(false);

    // FIXED: Added fallback address to prevent 'undefined' errors
    const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";

    const handleCreate = async () => {
        if (!account) return;
        setIsDeploying(true);

        try {
            const goalInOctas = Math.floor(Number(goal) * 100_000_000).toString();

            const transaction: any = {
                data: {
                    function: `${adminAddress}::crowdfund::create_project`,
                    functionArguments: [goalInOctas, title, "Riscend Ecosystem Project"],
                },
            };

            const response = await signAndSubmitTransaction(transaction);
            await aptos.waitForTransaction({ transactionHash: response.hash });

            alert("🚀 Success! Project created.");
            setTitle("");
            setGoal("");
        } catch (error) {
            console.error("Blockchain error:", error);
            alert("Transaction failed. Check if you already created a project with this wallet!");
        } finally {
            setIsDeploying(false);
        }
    };

    const usdValue = goal ? (Number(goal) * APT_PRICE_USD).toLocaleString() : "0";

    return (
        <div className="bg-slate-900/80 backdrop-blur-xl p-8 rounded-2xl border border-blue-500/30 w-full max-w-md shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/20 blur-[50px] rounded-full pointer-events-none"></div>

            <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 drop-shadow-sm">
                Launch Your Startup
            </h3>

            <div className="space-y-5 relative z-10">
                <div>
                    <label htmlFor="projectTitle" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Name</label>
                    <input
                        id="projectTitle"
                        type="text"
                        value={title}
                        placeholder="e.g. Acme Corp"
                        className="w-full p-4 bg-slate-950/50 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white font-medium shadow-inner"
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                <div>
                    <label htmlFor="fundingGoal" className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Raise</label>
                    <div className="relative">
                        <span className="absolute left-4 top-4 text-slate-500 font-bold">$</span>
                        <input
                            id="fundingGoal"
                            type="number"
                            value={goal}
                            placeholder="Amount in APT"
                            className="w-full p-4 pl-8 pr-20 bg-slate-950/50 rounded-xl border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none transition-all text-white font-medium shadow-inner"
                            onChange={(e) => setGoal(e.target.value)}
                        />
                        <span className="absolute right-4 top-4 text-slate-500 text-sm font-bold">APT</span>
                    </div>
                    {goal && (
                        <p className="text-right text-xs text-emerald-400 mt-2 font-medium tracking-wide">
                            ≈ ${usdValue} USD
                        </p>
                    )}
                </div>

                <button
                    onClick={handleCreate}
                    disabled={!account || isDeploying || !title || !goal}
                    className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 py-4 rounded-xl font-black text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6 shadow-[0_0_15px_rgba(6,182,212,0.4)] hover:shadow-[0_0_25px_rgba(6,182,212,0.6)] uppercase tracking-widest text-sm"
                >
                    {isDeploying ? "Securing Ledger..." : account ? "Initialize Project" : "Connect Account"}
                </button>
            </div>
        </div>
    );
}