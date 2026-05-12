"use client";
import { useEffect, useState } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig, Network } from "@aptos-labs/ts-sdk";

const config = new AptosConfig({ network: Network.TESTNET });
const aptos = new Aptos(config);
const APT_TO_USD = 200;

export default function ProjectList() {
  const { account, signAndSubmitTransaction } = useWallet();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fundAmounts, setFundAmounts] = useState<{ [key: string]: string }>({});

  const adminAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "0x72a9c1bce2b923a81abc72404b5f4e523997445615ef584b47bb57eeebc46a5f";

  const fetchAllData = async () => {
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
            description: details[1],
            goal: details[2],
            balance: details[3],
            isValidated: details[5],
            upvoteCount: details[8] 
          };
        })
      );
      setProjects(projectDetails);
    } catch (e) { console.error("Riscend Protocol Data Sync Error:", e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAllData(); }, []);

  const handleUpvote = async (projectAddress: string) => {
    if (!account) return alert("Authentication required for Riscend Protocol.");
    try {
      const transaction: any = {
        data: {
          function: `${adminAddress}::crowdfund::upvote_project`,
          functionArguments: [projectAddress],
        },
      };
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      fetchAllData();
    } catch (e) {
      alert("Validation failed: You may have already verified this project.");
    }
  };

  const handleFund = async (projectAddress: string) => {
    if (!account) return alert("Authentication required.");
    const amountInAPT = Number(fundAmounts[projectAddress]);
    if (!amountInAPT || amountInAPT <= 0) return alert("Enter a valid amount.");

    try {
      const amountInOctas = BigInt(Math.round(amountInAPT * 100_000_000));
      const transaction: any = {
        data: {
          function: `${adminAddress}::crowdfund::contribute`,
          functionArguments: [projectAddress, amountInOctas.toString()],
        },
      };
      const response = await signAndSubmitTransaction(transaction);
      await aptos.waitForTransaction({ transactionHash: response.hash });
      setFundAmounts({ ...fundAmounts, [projectAddress]: "" });
      fetchAllData();
    } catch (error) {
      alert("Contribution failed. Ensure the project is validated and your wallet is connected.");
    }
  };

  if (loading) return <div className="py-20 text-center text-cyan-500 font-black animate-pulse tracking-widest uppercase">Fetching Riscend Protocol Markets...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
      {projects.map((project, index) => {
        const currentAPT = Number(project.balance) / 100_000_000;
        const goalAPT = Number(project.goal) / 100_000_000;
        const progress = Math.min((currentAPT / goalAPT) * 100, 100);
        const isGoalReached = currentAPT >= goalAPT;
        const votes = Number(project.upvoteCount);

        return (
          <div key={index} className={`relative bg-slate-900/50 backdrop-blur-xl border rounded-3xl p-8 transition-all group overflow-hidden ${isGoalReached ? 'border-emerald-500/50 shadow-[0_0_30px_rgba(16,185,129,0.15)]' : 'border-slate-800 hover:border-blue-500/50 shadow-xl'}`}>
            <div className="absolute top-0 right-0 flex">
              {!project.isValidated && <div className="bg-amber-500/20 text-amber-500 text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest border-l border-b border-amber-500/30">Pending Validation</div>}
              {isGoalReached && <div className="bg-emerald-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest shadow-lg">Cap Secured</div>}
            </div>

            <div className="mb-6">
              <h4 className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors mb-2">{project.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{project.description}</p>
            </div>

            {!project.isValidated && (
              <div className="mb-8 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                <div className="flex justify-between items-center mb-3">
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-tighter">Community Verification Progress</p>
                  <p className="text-xs font-bold text-white">{votes} / 1</p>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mb-4">
                  <div className="h-full bg-amber-500 transition-all" style={{ width: `${Math.min(votes * 100, 100)}%` }}></div>
                </div>
                <button
                  onClick={() => handleUpvote(project.address)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-slate-700"
                >
                  Verify Venture (Upvote)
                </button>
              </div>
            )}

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Raised</p>
                  <p className={`text-3xl font-black ${isGoalReached ? 'text-emerald-400' : 'text-white'}`}>${(currentAPT * APT_TO_USD).toLocaleString()}</p>
                </div>
                <p className="text-xs font-bold text-slate-400 pb-1">Target: ${(goalAPT * APT_TO_USD).toLocaleString()}</p>
              </div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden shadow-inner">
                <div className={`h-full transition-all duration-1000 relative ${isGoalReached ? 'bg-emerald-500' : 'bg-gradient-to-r from-blue-600 to-cyan-400'}`} style={{ width: `${progress}%` }}>
                  {!isGoalReached && project.isValidated && <div className="absolute top-0 right-0 w-2 h-full bg-white/30 animate-pulse"></div>}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-slate-500 uppercase">APT</span>
                <input
                  type="number"
                  disabled={!project.isValidated}
                  placeholder="0.00"
                  value={fundAmounts[project.address] || ""}
                  onChange={(e) => setFundAmounts({ ...fundAmounts, [project.address]: e.target.value })}
                  className="w-full p-4 pl-12 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold text-sm outline-none focus:border-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
              <button
                disabled={!project.isValidated}
                onClick={() => handleFund(project.address)}
                className="px-8 bg-white text-slate-950 font-black rounded-2xl hover:bg-blue-400 hover:text-white transition-all text-xs uppercase tracking-widest shadow-lg shadow-white/5 active:scale-95 disabled:bg-slate-800 disabled:text-slate-500"
              >
                Fund
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}