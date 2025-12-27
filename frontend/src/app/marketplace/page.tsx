import Header from '@/components/Header';
import Footer from '@/components/Footer';

const mockListings = [
  { id: 1, name: 'Stacks Punk #42', price: 100, seller: 'SP1ABC...' },
  { id: 2, name: 'Bitcoin Art #7', price: 50, seller: 'SP2DEF...' },
  { id: 3, name: 'Clarity Dream #13', price: 75, seller: 'SP3GHI...' },
];

export default function MarketplacePage() {
  return (
    <main>
      <Header />
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Marketplace</h1>
          <p className="text-gray-400 text-center mb-12">Buy and sell NFTs</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockListings.map((listing) => (
              <div key={listing.id} className="bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600"></div>
                <div className="p-4">
                  <h4 className="font-bold text-white">{listing.name}</h4>
                  <p className="text-sm text-gray-400">by {listing.seller}</p>
                  <div className="flex justify-between items-center mt-4">
                    <span className="text-purple-500 font-bold">{listing.price} STX</span>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm">
                      Buy Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
