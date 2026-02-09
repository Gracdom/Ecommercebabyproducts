import { Star, Camera, ThumbsUp, CheckCircle } from 'lucide-react';

interface Review {
  id: number;
  name: string;
  rating: number;
  date: string;
  text: string;
  image?: string;
  verified: boolean;
  helpful: number;
}

const reviews: Review[] = [
  {
    id: 1,
    name: 'María L.',
    rating: 5,
    date: '2 weeks ago',
    text: 'My baby absolutely loves this activity cube! The colors are beautiful and it\'s so soft. Great quality as always from Baby\'s Only.',
    image: '/img/5.webp',
    verified: true,
    helpful: 12,
  },
  {
    id: 2,
    name: 'Ana G.',
    rating: 5,
    date: '3 weeks ago',
    text: 'Perfect gift for new parents! The different textures and activities keep my little one entertained. Highly recommend!',
    image: '/img/6.webp',
    verified: true,
    helpful: 8,
  },
  {
    id: 3,
    name: 'Laura P.',
    rating: 5,
    date: '1 month ago',
    text: 'Beautiful quality and design. My daughter loves exploring all the different sides. Worth every penny!',
    image: '/img/7.webp',
    verified: true,
    helpful: 15,
  },
  {
    id: 4,
    name: 'Carmen R.',
    rating: 4,
    date: '1 month ago',
    text: 'Great toy, very well made. My son enjoys it a lot. Only wish it was a bit larger.',
    verified: true,
    helpful: 5,
  },
];

export function ProductReviews() {
  return (
    <div className="mb-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl text-stone-900 mb-2">Customer Reviews</h2>
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className="h-5 w-5 fill-[#dccf9d] text-[#dccf9d]" />
              ))}
            </div>
            <span className="text-stone-700">4.9 out of 5</span>
            <span className="text-stone-600">Based on 24 reviews</span>
          </div>
        </div>
        <button className="border border-stone-300 text-stone-700 px-6 py-3 rounded-lg hover:bg-stone-50 transition-colors">
          Write a Review
        </button>
      </div>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border border-stone-200 rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-stone-900">{review.name}</p>
                  {review.verified && (
                    <div className="flex items-center gap-1 text-xs text-green-700 bg-green-50 px-2 py-0.5 rounded">
                      <CheckCircle className="h-3 w-3" />
                      <span>Verified Purchase</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-stone-600">{review.date}</p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? 'fill-[#dccf9d] text-[#dccf9d]'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <p className="text-stone-700 mb-4">{review.text}</p>

            {review.image && (
              <div className="mb-4">
                <img
                  src={review.image}
                  alt={`Review by ${review.name}`}
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}

            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 transition-colors">
                <ThumbsUp className="h-4 w-4" />
                <span>Helpful ({review.helpful})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full border border-stone-300 text-stone-700 py-3 rounded-lg hover:bg-stone-50 transition-colors mt-6">
        Load More Reviews
      </button>
    </div>
  );
}
