import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-7xl mx-auto px-6 py-24">
      <div className="max-w-3xl">
        <h1 className="text-6xl font-extrabold text-slate-900 leading-tight mb-8">
          The new standard for <span className="text-blue-600 italic">startup equity.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed">
          Riscend Protocol bridges the gap between traditional funding and blockchain security.
          Your capital is automatically converted to stable liquidity, ensuring your 7% equity
          is protected by the Ascend Ledger.
        </p>
        <div className="flex gap-4">
          <Link href="/explore" className="bg-blue-600 text-white px-8 py-4 rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all">
            Browse Startups
          </Link>
          <Link href="/verify" className="bg-white text-slate-900 border border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-all">
            Verify Identity
          </Link>
        </div>
      </div>

      {/* FEATURE GRID */}
      <div className="grid md:grid-cols-3 gap-12 mt-32">
        <div>
          <h3 className="font-bold text-lg mb-2">Stable Growth</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Automatic conversion to price-stable assets keeps your investment safe from market volatility.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">Verified Success</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Our Physical Verification portal ensures only real humans guide the protocol via upvotes.</p>
        </div>
        <div>
          <h3 className="font-bold text-lg mb-2">7% Equity Protocol</h3>
          <p className="text-slate-500 text-sm leading-relaxed">Fixed equity standards are coded directly into the contract. No hidden legal fees.</p>
        </div>
      </div>
    </main>
  );
}