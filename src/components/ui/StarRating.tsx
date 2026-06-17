import { HiStar, HiOutlineStar } from 'react-icons/hi';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  onRate?: (rating: number) => void;
}

export default function StarRating({ rating, size = 'md', onRate }: StarRatingProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' };
  const starClass = sizes[size];

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onRate}
          onClick={() => onRate?.(star)}
          className={onRate ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          {star <= rating ? (
            <HiStar className={`${starClass} text-[#C49B66]`} />
          ) : (
            <HiOutlineStar className={`${starClass} text-gray-300`} />
          )}
        </button>
      ))}
    </div>
  );
}
