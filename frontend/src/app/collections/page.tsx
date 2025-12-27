import Header from '@/components/Header';
import CreateCollection from '@/components/CreateCollection';
import NFTGrid from '@/components/NFTGrid';
import Footer from '@/components/Footer';

export default function CollectionsPage() {
  return (
    <main>
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Collections</h1>
          <p className="text-gray-400 text-center mb-12">Create and explore NFT collections</p>
          <div className="mb-16">
            <CreateCollection />
          </div>
          <NFTGrid />
        </div>
      </div>
      <Footer />
    </main>
  );
}
