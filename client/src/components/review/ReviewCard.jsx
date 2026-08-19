import { formatDate } from '../../utils/formatDate';
import Rating from './Rating';

const ReviewCard = ({ review }) => {
  return (
    <div className="glass-effect rounded-xl p-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-full bg-primary-600/20 flex items-center justify-center flex-shrink-0">
          <span className="text-primary-400 font-semibold">
            {review.client?.name?.charAt(0) || 'U'}
          </span>
        </div>
        <div className="flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-white">{review.client?.name || 'Utilisateur'}</h4>
              <Rating value={review.rating} size="sm" />
            </div>
            <span className="text-sm text-gray-400">
              {formatDate(review.createdAt)}
            </span>
          </div>
          <p className="text-gray-300 mt-2">{review.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default ReviewCard;