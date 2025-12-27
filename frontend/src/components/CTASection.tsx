import Link from 'next/link';

export default function CTASection() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Create Your First NFT?
          </h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Join thousands of creators on the most secure NFT platform built on Bitcoin.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link 
              href="/mint"
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
            >
              Start Minting
            </Link>
            <Link 
              href="/marketplace"
              className="border border-purple-500 text-purple-500 px-8 py-3 rounded-lg font-semibold hover:bg-purple-500/10 transition-colors"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
