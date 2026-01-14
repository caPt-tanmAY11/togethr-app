"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";
import { Github, Linkedin, Send, X } from "lucide-react";
import { createPortal } from "react-dom";

interface JoinTeamFormData {
  message: string;
  githubUrl: string;
  linkedinUrl: string;
  type?: string;
}

interface JoinTeamModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: JoinTeamFormData) => void;
  type: string;
}

export default function JoinTeamModal({
  open,
  onClose,
  onSubmit,
  type,
}: JoinTeamModalProps) {
  const [formData, setFormData] = useState<JoinTeamFormData>({
    message: "",
    githubUrl: "",
    linkedinUrl: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  function handleClose() {
    setFormData({
      message: "",
      githubUrl: "",
      linkedinUrl: "",
    });
    onClose();
  }

  function handleSubmit() {
    const { message, githubUrl, linkedinUrl } = formData;

    if (!message.trim() || !githubUrl.trim() || !linkedinUrl.trim()) {
      toast.error("All fields are required!");
      return;
    }

    onSubmit(formData);
    handleClose();
  }

  let btnColor = "#0d6969";
  let btnHoverColor = "#118585";
  let focusRingColor = "ring-teal-600";
  let mainBg = "#0f1f1f";
  let title = "Join Team";
  let msg = "Tell the team why you’re a great fit";
  let subHead = "Message to team lead";

  if (type === "project") {
    btnColor = "#f36262b7";
    btnHoverColor = "#fc8e8eb7";
    focusRingColor = "ring-[#f36262]";
    mainBg = "#131111";
    title = "Join Project";
    msg =
      "Tell the project owner why you're a great fit and why you want to contribute";
    subHead = "Message to project owner";
  }

  return (
    <>
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/60 backdrop-blur-sm z-998"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={handleClose}
                />

                <motion.div
                  initial={{ scale: 0.92, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.92, opacity: 0, y: 20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className={`
              fixed z-998 top-1/2 left-1/2
              -translate-x-1/2 -translate-y-1/2
              w-[92%] max-w-lg
              rounded-2xl
              border border-white/10
              bg-[${mainBg}]
              backdrop-blur-2xl
              p-7 text-white font-inter
            `}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold">{title}</h2>
                      <p className="text-sm text-white/50 mt-1">{msg}</p>
                    </div>

                    <button
                      onClick={handleClose}
                      className="text-white/50 hover:text-white transition cursor-pointer"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  <div className="mb-5">
                    <label className="text-sm text-white/70">{subHead} *</label>

                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Your skills, experience, motivation..."
                      rows={5}
                      className={`
                  mt-2 w-full rounded-xl
                  bg-white/10
                  border border-white/10
                  p-3 text-sm
                  outline-none resize-none
                  focus:ring-1 focus:${focusRingColor}
                `}
                    />
                  </div>

                  <div className="space-y-4 mb-7">
                    <div>
                      <label className="text-sm text-white/70">
                        GitHub Profile *
                      </label>

                      <div className="relative mt-2">
                        <Github
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                        />

                        <input
                          type="url"
                          name="githubUrl"
                          value={formData.githubUrl}
                          onChange={handleChange}
                          placeholder="https://github.com/username"
                          className={`
                      w-full pl-9 pr-3 py-2.5
                      rounded-xl
                      bg-white/10
                      border border-white/10
                      text-sm
                      outline-none
                      focus:ring-1 focus:${focusRingColor}
                    `}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm text-white/70">
                        LinkedIn Profile *
                      </label>

                      <div className="relative mt-2">
                        <Linkedin
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40"
                        />

                        <input
                          type="url"
                          name="linkedinUrl"
                          value={formData.linkedinUrl}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/username"
                          className={`
                      w-full pl-9 pr-3 py-2.5
                      rounded-xl
                      bg-white/10
                      border border-white/10
                      text-sm
                      outline-none
                      focus:ring-1 focus:${focusRingColor}
                    `}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleClose}
                      className="
                  px-4 py-2 rounded-lg
                  text-sm
                  bg-white/10
                  hover:bg-white/20
                  transition cursor-pointer
                "
                    >
                      Cancel
                    </button>

                    <button
                      disabled={
                        !formData.message.trim() ||
                        !formData.githubUrl.trim() ||
                        !formData.linkedinUrl.trim()
                      }
                      onClick={handleSubmit}
                      className={`
                  inline-flex items-center gap-2
                  px-5 py-2 rounded-lg
                  text-sm font-medium
                  bg-[${btnColor}] hover:bg-[${btnHoverColor}]
                  transition
                  disabled:opacity-50
                  cursor-pointer
                `}
                    >
                      <Send size={14} />
                      Send Request
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
