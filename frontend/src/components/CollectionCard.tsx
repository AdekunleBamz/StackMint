interface CollectionCardProps {
  name: string;
  creator: string;
  itemCount: number;
  image?: string;
}

export default function CollectionCard({ name, creator, itemCount, image }: CollectionCardProps) {
  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all cursor-pointer">
      <div className="h-40 bg-gradient-to-br from-purple-600 to-blue-600"></div>
      <div className="p-4">
        <h4 className="font-bold text-white">{name}</h4>
        <p className="text-sm text-gray-400">by {creator.slice(0, 8)}...</p>
        <p className="text-sm text-purple-500 mt-2">{itemCount} items</p>
      </div>
    </div>
  );
}
