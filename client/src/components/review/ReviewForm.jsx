import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../common/Button';
import Rating from './Rating';
import { useTranslation } from 'react-i18next';

const ReviewForm = ({ onSubmit, loading = false }) => {
  const { t } = useTranslation();
  const [rating, setRating] = useState(5);
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
    setComment('');
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="p-5 rounded-2xl border space-y-4 mb-6 shadow-sm" 
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
    >
      <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
        {t('property.writeReview') || 'Laisser un avis'}
      </h3>
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Note
        </label>
        <Rating
          value={rating}
          size="lg"
          editable
          onChange={setRating}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
          Commentaire
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience sur ce logement..."
          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[90px] resize-y text-sm transition-all"
          style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          required
        />
      </div>

      <Button type="submit" loading={loading} className="w-full sm:w-auto">
        Publier l'avis
      </Button>
    </form>
  );
};

export default ReviewForm;