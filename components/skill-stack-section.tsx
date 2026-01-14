"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface SkillStackProps {
  type: string;
  elements: string[];
  setElements: (elements: string[]) => void;
  section: string;
}

export default function SkillStackSection({
  type,
  elements,
  setElements,
  section,
}: SkillStackProps) {
  const [tempElements, setTempElements] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newElement, setNewElement] = useState("");

  function handleAddSkill() {
    if (newElement.trim() !== "" && !tempElements.includes(newElement.trim())) {
      setTempElements((prev) => [...prev, newElement.trim()]);
      setNewElement("");
    }
  }

  function handleRemoveSkill(skillToRemove: string) {
    setTempElements((prev) => prev.filter((skill) => skill !== skillToRemove));
  }

  function handleOpenModal() {
    setTempElements(elements);
    setIsModalOpen(true);
  }

  function handleSave() {
    setElements(tempElements);
    setIsModalOpen(false);
  }

  let themeMain = "#0d6969";
  let themeHover = "#118585";

  if (section === "projects") {
    themeMain = "#f36262b7";
    themeHover = "#fc8e8eb7";
  }

  return (
    <>
      {/* Main skill section */}
      <motion.div
        className="p-4 sm:p-5 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-lg flex flex-col gap-7"
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex gap-3 flex-wrap justify-center">
          {elements.length > 0 ? (
            elements.map((element, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="bg-white/10 px-4 sm:px-5 py-2 rounded-xl text-sm hover:bg-white/20 transition-all"
              >
                {element}
              </motion.div>
            ))
          ) : (
            <p className="text-white/50 text-sm italic text-center">
              {type === "skillstack"
                ? "No skills added yet."
                : "No project tags added yet."}
            </p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleOpenModal}
            className={`bg-[${themeMain}] hover:bg-[${themeHover}] px-6 sm:px-8 py-2 rounded-lg font-medium shadow-md transition-all cursor-pointer`}
          >
            {type === "skillstack" ? "Add Skill Stack" : "Add Project Tags"}
          </button>
        </div>
      </motion.div>

      {/* Modal via Portal */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {isModalOpen && (
              <>
                {/* Backdrop */}
                <motion.div
                  className="fixed inset-0 bg-black/80 backdrop-blur-md z-998"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsModalOpen(false)}
                />

                {/* Modal wrapper */}
                <motion.div
                  className="fixed inset-0 z-999 flex items-center justify-center px-4 sm:px-0"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div
                    className="
                      bg-[#0b0f0f]
                      w-full
                      max-w-md sm:max-w-lg
                      max-h-[85vh]
                      overflow-y-auto
                      p-5 sm:p-8
                      rounded-2xl
                      shadow-2xl
                      border border-white/10
                      text-white
                      space-y-5
                    "
                  >
                    <h2
                      className={`text-lg sm:text-xl font-semibold text-center bg-linear-to-r from-[${themeMain}] to-[${themeHover}] bg-clip-text text-transparent`}
                    >
                      {type === "skillstack"
                        ? "Add Your Skill Stack"
                        : "Add project related tags"}
                    </h2>

                    {/* Input row */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="text"
                        placeholder={
                          type === "skillstack"
                            ? "Enter a skill (e.g., React, MongoDB)"
                            : "Enter a tag (e.g., Cloud, Web Dev)"
                        }
                        value={newElement}
                        onChange={(e) => setNewElement(e.target.value)}
                        className={`flex-1 bg-white/10 px-4 py-2 rounded-md outline-none text-white ${section === "projects" ? "focus:ring-1 focus:ring-[#f36262]" : "focus:ring-1 focus:ring-teal-600"}`}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className={`px-5 py-2 bg-[${themeMain}] hover:bg-[${themeHover}] rounded-md font-medium transition-all cursor-pointer`}
                      >
                        Add
                      </button>
                    </div>

                    {/* Skill list */}
                    <div className="flex flex-wrap gap-2 mt-3 max-h-40 sm:max-h-50 overflow-y-auto">
                      {tempElements.length > 0 ? (
                        tempElements.map((skill, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-xl text-sm text-white/90"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveSkill(skill)}
                              className="text-red-400 hover:text-red-500 font-semibold transition cursor-pointer"
                            >
                              ✕
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-white/40 text-sm italic">
                          {type === "skillstack"
                            ? "No skills added yet."
                            : "No project tags added yet."}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
                        className={`px-6 py-2 bg-[${themeMain}] hover:bg-[${themeHover}] rounded-lg transition-all cursor-pointer`}
                      >
                        Save
                      </button>
                    </div>
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
