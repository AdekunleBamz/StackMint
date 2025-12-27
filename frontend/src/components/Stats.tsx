export default function Stats() {
  const stats = [
    { label: 'NFTs Minted', value: '1,234' },
    { label: 'Collections', value: '56' },
    { label: 'Total Volume', value: '5.2K STX' },
    { label: 'Creators', value: '128' },
  ];

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((stat) => (
          <div key={stat.label} className="text-center">
            <div className="text-3xl md:text-4xl font-bold text-purple-500">{stat.value}</div>
            <div className="text-gray-400 mt-2">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
