interface InputWSuggestionsProps {
  suggestions: string[];
  value: string;
  onChange: (newValue: string) => void;
}

export default function InputWSuggestions({
  suggestions,
  value,
  onChange,
}: InputWSuggestionsProps) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 rounded border border-gray-600 bg-gray-900 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Escribe algo..."
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-gray-800 border border-gray-600 rounded mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((sug, index) => (
            <li
              key={index}
              onClick={() => onChange(sug)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-700"
            >
              {sug}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
