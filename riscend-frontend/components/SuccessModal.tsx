"use client";

export default function SuccessModal({ isOpen, onClose, txHash, amount, type }: any) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
            <div className="bg-slate-900 border border-blue-500/30 w-full max-w-md rounded-3xl p-10 shadow-[0_0_100px_-20px_rgba(59,130,246,0.3)] text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>

                <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                    <span className="text-5xl drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]">✨</span>
                </div>

                <h2 className="text-3xl font-black text-white mb-3 tracking-tighter">
                    {type === 'fund' ? "CAPITAL DEPLOYED" : "ROUND FINALIZED"}
                </h2>

                <p className="text-slate-400 mb-8 text-sm font-medium leading-relaxed">
                    {type === 'fund'
                        ? `Transaction verified. Your contribution of ${amount} APT is now secured on the ledger.`
                        : "The funding cycle is officially closed. All protocol fees have been liquidated."}
                </p>

                <div className="bg-slate-950/80 p-5 rounded-2xl mb-8 border border-slate-800/50 group">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-[0.2em] mb-2 text-left">Internal Reference (Hash)</p>
                    <p className="text-[11px] font-mono text-blue-400 break-all select-all opacity-80 group-hover:opacity-100 transition-opacity">{txHash}</p>
                </div>

                <div className="space-y-4">
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black py-4 rounded-2xl transition-all shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] active:scale-95 uppercase tracking-widest text-xs"
                    >
                        Dismiss Terminal
                    </button>

                    <a
                        href={`https://explorer.aptoslabs.com/txn/${txHash}?network=testnet`}
                        target="_blank"
                        className="block text-[10px] text-slate-500 hover:text-white font-bold uppercase tracking-widest transition-colors"
                    >
                        View Blockchain Proof →
                    </a>
                </div>
            </div>
        </div>
    );
}