"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserAvatar } from "@/components/use-avatar";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

interface ConnectionUser {
  id: string;
  name: string;
  slug: string | null;
  image: string | null;
  headline: string | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  users: ConnectionUser[];
  loading: boolean;
}

export default function ConnectionsModal({
  open,
  onClose,
  title,
  users,
  loading,
}: Props) {
  const router = useRouter();

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed z-50 top-1/2 left-1/2 w-[90%] max-w-md 
              -translate-x-1/2 -translate-y-1/2 rounded-2xl
              bg-zinc-900 border border-white/10 p-6"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} // ⛔ prevent backdrop close
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-white font-semibold">{title}</h2>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white transition cursor-pointer"
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            {loading ? (
              <p className="text-sm text-white/60">Loading...</p>
            ) : users.length === 0 ? (
              <p className="text-sm text-white/60">No users found</p>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      onClose();
                      router.push(`/main/profile/${user.slug ?? user.id}`);
                    }}
                    className="flex w-full items-center gap-3 rounded-lg p-2
               hover:bg-white/5 transition text-left cursor-pointer"
                  >
                    <UserAvatar
                      image={user.image}
                      name={user.name}
                      className="h-10 w-10"
                    />

                    <div>
                      <p className="text-white font-medium">{user.name}</p>
                      {user.headline && (
                        <p className="text-xs text-white/60">{user.headline}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
