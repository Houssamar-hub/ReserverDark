import { useState } from 'react';
import Button from '../common/Button';
import Rating from './Rating';

const ReviewForm = ({ onSubmit, loading = false }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note');
      return;
    }
    if (!comment.trim()) {
      toast.error('Veuillez écrire un commentaire');
      return;
    }
    onSubmit({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Votre note
        </label>
        <Rating
          value={rating}
          size="lg"
          editable
          onChange={setRating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Votre commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary-500 min-h-[100px] resize-y"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Publier l'avis
      </Button>
    </form>
  );
};

export default ReviewForm;