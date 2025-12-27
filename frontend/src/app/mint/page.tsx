import Header from '@/components/Header';
import MintCard from '@/components/MintCard';
import WalletBalance from '@/components/WalletBalance';
import Footer from '@/components/Footer';

export default function MintPage() {
  return (
    <main>
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Mint Your NFT</h1>
          <p className="text-gray-400 text-center mb-12">Create unique digital collectibles on Stacks</p>
          <div className="grid md:grid-cols-2 gap-8">
            <MintCard />
            <div className="space-y-4">
              <WalletBalance />
              <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-4">
                <h4 className="font-bold text-white mb-2">How it works</h4>
                <ol className="text-sm text-gray-400 space-y-2">
                  <li>1. Connect your Stacks wallet</li>
                  <li>2. Enter your NFT metadata URI</li>
                  <li>3. Pay 0.01 STX minting fee</li>
                  <li>4. Your NFT is minted!</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
