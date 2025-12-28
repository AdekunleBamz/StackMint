import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import Features from '@/components/Features';
import MintCard from '@/components/MintCard';
import NFTGrid from '@/components/NFTGrid';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="animate-fade-in">
      <Header />
      <Hero />
      <Stats />
      <Features />
      <section className="py-20 px-4" id="mint">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">Start Creating</h2>
          <p className="text-gray-400 text-center mb-12">Mint your first NFT today</p>
          <MintCard />
        </div>
      </section>
      <NFTGrid />
      <Footer />
    </main>
  );
}
