import { Star } from 'lucide-react';

const Rating = ({ value, max = 5, size = 'md', editable = false, onChange }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (index) => {
    if (editable && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[...Array(max)].map((_, index) => (
        <button
          key={index}
          type="button"
          onClick={() => handleClick(index)}
          className={`${editable ? 'cursor-pointer' : 'cursor-default'} transition-colors`}
          disabled={!editable}
        >
          <Star
            className={`${sizes[size]} ${
              index < value
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-600'
            } ${editable ? 'hover:text-yellow-400' : ''}`}
          />
        </button>
      ))}
    </div>
  );
};

export default Rating;