import React, { useState } from 'react';

const ItemInput = ({ onClassify, disabled = false }) => {
  const [item, setItem] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (item.trim() && !disabled) {
      onClassify(item.trim());
      setItem(''); // Clear input after submission
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <input
          type="text"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          placeholder="e.g., plastic bottle, banana peel..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={disabled}
        />
      </div>
      <button
        type="submit"
        disabled={!item.trim() || disabled}
        className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {disabled ? 'Classifying...' : 'Classify Item'}
      </button>
    </form>
  );
};

export default ItemInput;