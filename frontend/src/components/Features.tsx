import FeatureCard from './FeatureCard';

const features = [
  { icon: '🎨', title: 'Easy Minting', description: 'Mint NFTs in seconds with just a few clicks' },
  { icon: '📦', title: 'Collections', description: 'Organize your NFTs into beautiful collections' },
  { icon: '💰', title: 'Marketplace', description: 'Buy and sell NFTs with low fees' },
  { icon: '🔒', title: 'Secure', description: 'Built on Bitcoin via Stacks blockchain' },
];

export default function Features() {
  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-4">Why StacksMint?</h2>
        <p className="text-gray-400 text-center mb-12">The easiest way to create and trade NFTs on Bitcoin</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
