interface NFTCardProps {
  id: number;
  name: string;
  image?: string;
  price?: number;
  owner: string;
  onBuy?: () => void;
}

export default function NFTCard({ id, name, image, price, owner, onBuy }: NFTCardProps) {
  return (
    <div className="bg-gray-900/50 border border-purple-500/20 rounded-xl overflow-hidden hover:border-purple-500/50 transition-all group">
      <div className="h-48 bg-gradient-to-br from-purple-600 to-blue-600 relative overflow-hidden">
        {image && <img src={image} alt={name} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg">View Details</button>
        </div>
      </div>
      <div className="p-4">
        <h4 className="font-bold text-white truncate">{name}</h4>
        <p className="text-sm text-gray-400">#{id}</p>
        <div className="flex justify-between items-center mt-3">
          <span className="text-xs text-gray-500">{owner.slice(0, 10)}...</span>
          {price && (
            <span className="text-purple-500 font-bold">{price} STX</span>
          )}
        </div>
        {price && onBuy && (
          <button 
            onClick={onBuy}
            className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-lg text-sm"
          >
            Buy Now
          </button>
        )}
      </div>
    </div>
  );
}
