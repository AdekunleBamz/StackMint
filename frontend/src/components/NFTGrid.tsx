import CollectionCard from './CollectionCard';

const mockCollections = [
  { name: 'Stacks Punks', creator: 'SP1ABC...', itemCount: 100 },
  { name: 'Bitcoin Art', creator: 'SP2DEF...', itemCount: 50 },
  { name: 'Clarity Dreams', creator: 'SP3GHI...', itemCount: 75 },
  { name: 'Block Heroes', creator: 'SP4JKL...', itemCount: 200 },
];

export default function NFTGrid() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-white mb-8">Popular Collections</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {mockCollections.map((collection) => (
            <CollectionCard key={collection.name} {...collection} />
          ))}
        </div>
      </div>
    </section>
  );
}
