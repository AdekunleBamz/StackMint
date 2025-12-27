import Header from '@/components/Header';
import WalletBalance from '@/components/WalletBalance';
import TransactionHistory from '@/components/TransactionHistory';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  return (
    <main>
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-12">My Profile</h1>
          <div className="grid md:grid-cols-2 gap-8">
            <WalletBalance />
            <TransactionHistory />
          </div>
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-white mb-6">My NFTs</h2>
            <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl p-8 text-center">
              <p className="text-gray-400">Connect wallet to view your NFTs</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
