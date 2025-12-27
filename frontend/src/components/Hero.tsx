export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
          Mint Your <span className="text-purple-500">NFTs</span>
        </h1>
        <p className="text-xl text-gray-400 mb-8">
          Create and collect unique digital assets on the Stacks blockchain
        </p>
        <div className="flex gap-4 justify-center">
          <button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3 rounded-lg font-semibold">
            Start Minting
          </button>
          <button className="border border-purple-500 text-purple-500 px-8 py-3 rounded-lg font-semibold hover:bg-purple-500/10">
            Explore
          </button>
        </div>
      </div>
    </section>
  );
}
