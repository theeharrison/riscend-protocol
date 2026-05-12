"use client";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";

export default function WalletButtons() {
    return (
        <div className="riscend-wallet-provider">
            {/* We use a simple wrapper to style the existing WalletSelector component */}
            <WalletSelector />
        </div>
    );
}