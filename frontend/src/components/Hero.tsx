import Link from 'next/link';

export default function Hero() {
  return (
    <section className="pt-32 pb-24 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-float stagger-2" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2 mb-6 animate-fade-in-up">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span className="text-sm text-purple-300">Live on Stacks Mainnet</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 animate-fade-in-up stagger-1">
          Mint Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">NFTs</span>
          <br />
          <span className="text-4xl md:text-5xl text-gray-300">on Bitcoin</span>
        </h1>
        
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-fade-in-up stagger-2">
          Create, collect, and trade unique digital assets secured by the Bitcoin blockchain through Stacks
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up stagger-3">
          <Link 
            href="/mint"
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-300 hover:-translate-y-0.5"
          >
            Start Minting
          </Link>
          <Link 
            href="/marketplace"
            className="border border-purple-500/50 text-purple-400 px-8 py-4 rounded-xl font-semibold hover:bg-purple-500/10 hover:border-purple-500 transition-all duration-300"
          >
            Explore Collection
          </Link>
        </div>
        
        <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in-up stagger-4">
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> No gas wars
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Bitcoin-secured
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-500">✓</span> Low fees
          </div>
        </div>
      </div>
    </section>
  );
}
