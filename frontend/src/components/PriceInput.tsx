'use client';

interface PriceInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export default function PriceInput({ value, onChange, label = 'Price' }: PriceInputProps) {
  return (
    <div>
      {label && <label className="block text-sm text-gray-400 mb-2">{label}</label>}
      <div className="relative">
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
          className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-3 pr-16 text-white focus:border-purple-500 focus:outline-none"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-500 font-semibold">STX</span>
      </div>
    </div>
  );
}
