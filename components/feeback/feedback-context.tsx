"use client";

import { createContext, useContext, useState } from "react";

type FeedbackContextType = {
  open: boolean;
  openFeedback: () => void;
  closeFeedback: () => void;
};

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <FeedbackContext.Provider
      value={{
        open,
        openFeedback: () => setOpen(true),
        closeFeedback: () => setOpen(false),
      }}
    >
      {children}
    </FeedbackContext.Provider>
  );
}

export function useFeedback() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) {
    throw new Error("useFeedback must be used inside FeedbackProvider");
  }
  return ctx;
}
