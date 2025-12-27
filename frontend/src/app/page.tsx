import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Stats from '@/components/Stats';
import MintCard from '@/components/MintCard';
import NFTGrid from '@/components/NFTGrid';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Stats />
      <section className="py-16 px-4" id="mint">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Create Your NFT</h2>
          <MintCard />
        </div>
      </section>
      <NFTGrid />
      <Footer />
    </main>
  );
}
