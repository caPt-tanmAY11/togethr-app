"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { Star } from "lucide-react";
import { useFeedback } from "./feedback-context";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export default function FeedbackModal() {
  const { open, closeFeedback } = useFeedback();
  const pathname = usePathname();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);

  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  let btnMain = "#236565";
  let btnHover = "#2f8787";

  if (pathname.startsWith("/main/projects")) {
    btnMain = "#f36262b7";
    btnHover = "#fc8e8eb7";
  }

  async function handleFeedbackSubmit() {
    if (rating === 0) return;

    if (!message.trim()) {
      toast.error("Please write some feedback before submitting.");
      return;
    }

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rating,
          message: message.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data?.error || "Failed to submit feedback");
      }

      setRating(0);
      setHovered(0);
      setMessage("");
      closeFeedback();

      toast.success("Feedback sent successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-md
             flex items-center justify-center p-4 sm:p-6"
          onClick={closeFeedback}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[90vw] sm:max-w-md md:max-w-lg lg:max-w-xl
               rounded-2xl bg-[#1d1d1dad] border border-white/15 p-6
               sm:p-8"
          >
            <h2 className="text-white text-lg sm:text-xl font-semibold">
              Share your feedback
            </h2>
            <p className="text-gray-400 text-sm mt-1 sm:text-base">
              Help us improve Togethr
            </p>

            <div className="mt-4">
              <p className="text-sm text-gray-400 mb-2 sm:text-base">
                How was your experience?
              </p>

              <div className="flex gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const active = hovered ? star <= hovered : star <= rating;

                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        size={22}
                        className={`transition-all cursor-pointer ${
                          active
                            ? "fill-gray-500 text-gray-500"
                            : "text-gray-500"
                        } sm:text-lg`}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <textarea
              rows={7}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tell us what you think..."
              className="mt-4 w-full rounded-xl bg-black/40 border border-white/10
                 text-white text-sm sm:text-base p-3 outline-none
                 focus:border-white/30 resize-none min-h-[140px]"
            />

            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  closeFeedback();
                  setMessage("");
                  setRating(0);
                }}
                className="text-gray-400 hover:text-white cursor-pointer text-sm sm:text-base"
              >
                Cancel
              </button>

              <button
                disabled={rating === 0 || isSubmitting || message.length === 0}
                onClick={handleFeedbackSubmit}
                className={`px-4 py-2 rounded-lg
                    bg-[${btnMain}] hover:bg-[${btnHover}]
                    text-white text-sm sm:text-base font-medium
                    disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
