"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Star, MessageSquare, X } from "lucide-react";
import { cn } from "@/lib/cn";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string) => void;
  isSubmitting: boolean;
  consultantName: string;
}

export function RatingModal({ isOpen, onClose, onSubmit, isSubmitting, consultantName }: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-rhino/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 p-2 rounded-xl hover:bg-rhino/5 transition-all"
        >
          <X className="w-6 h-6 text-rhino/20" />
        </button>

        <div className="space-y-8">
          <div className="text-center space-y-2">
            <h2 className="font-heading text-3xl font-bold text-rhino">Rate your experience</h2>
            <p className="font-body text-rhino/40 text-sm">
              How was your collaboration with <span className="text-rhino font-bold">{consultantName}</span>?
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
                className="transition-transform active:scale-90"
              >
                <Star 
                  className={cn(
                    "w-12 h-12 transition-all",
                    (hoveredRating || rating) >= star 
                      ? "fill-desert text-desert" 
                      : "text-rhino/10"
                  )} 
                />
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold text-rhino/40 uppercase tracking-widest ml-4">Detailed Review</label>
            <div className="relative group">
              <MessageSquare className="absolute left-6 top-6 w-5 h-5 text-rhino/20" />
              <textarea 
                placeholder="Share your success story or feedback..."
                value={review}
                onChange={(e) => setReview(e.target.value)}
                className="w-full min-h-[150px] pl-14 pr-6 pt-6 pb-6 rounded-[2rem] bg-rhino/5 border border-akaroa/10 font-body text-sm outline-none focus:bg-white focus:ring-4 focus:ring-rhino/5 focus:border-akaroa/30 transition-all resize-none"
              />
            </div>
          </div>

          <Button 
            fullWidth 
            size="md" 
            onClick={() => onSubmit(rating, review)}
            disabled={rating === 0 || !review || isSubmitting}
            isLoading={isSubmitting}
            className="h-16 rounded-2xl text-lg shadow-xl shadow-rhino/10"
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}
