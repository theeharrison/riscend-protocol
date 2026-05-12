"use client";
import { AptosWalletAdapterProvider } from "@aptos-labs/wallet-adapter-react";
import { Network } from "@aptos-labs/ts-sdk";
import Navbar from "@/components/Navbar";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Changed bg-white to bg-slate-950 to match your dashboard theme */}
      <body className="bg-slate-950 text-white min-h-screen flex flex-col font-sans">
        <AptosWalletAdapterProvider
          optInWallets={["Petra"]}
          autoConnect={true}
          dappConfig={{ network: Network.TESTNET }}
        >
          <Navbar />

          {/* Added padding and centering to the main container */}
          <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>

          <footer className="border-t border-slate-900 py-12 bg-slate-950/50 backdrop-blur-md">
            <div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
              <p>© 2026 Riscend Protocol. All investments converted to stable liquidity.</p>
            </div>
          </footer>
        </AptosWalletAdapterProvider>
      </body>
    </html>
  );
}