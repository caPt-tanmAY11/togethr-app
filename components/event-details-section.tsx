"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import CustomDropdown from "./custom-dropdown";
import CalendarTimePicker from "./date-time-picker";

interface EventDetails {
    name: string;
    description: string;
    startTime: string;
    endTime: string;
    mode: string;
    link: string;
    location: string;
}

export default function EventDetailsSection({ eventDetails, setEventDetails }: {
    eventDetails: EventDetails;
    setEventDetails: React.Dispatch<React.SetStateAction<EventDetails>>;
}) {
    const [selectedEventMode, setSelectedEventMode] = useState<string>("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempDetails, setTempDetails] = useState<EventDetails>(eventDetails);

    function handleSave() {
        setEventDetails(tempDetails);
        setIsModalOpen(false);
    }

    function handleChange(
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
        >
    ) {
        const { name, value } = e.target;
        setTempDetails((prev) => ({ ...prev, [name]: value }));
    }

    return (
        <>
            <motion.div
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex flex-col gap-6"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
            >
                {Object.values(eventDetails).some((val) => val.trim() !== "") ? (
                    <div className="space-y-3 text-white">
                        <h2 className="text-xl font-semibold text-center mb-3 bg-linear-to-r from-teal-500 to-cyan-400 bg-clip-text text-transparent">
                            {eventDetails.name}
                        </h2>
                        <p className="text-white/70 text-sm leading-relaxed">
                            {eventDetails.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-white/80">
                            <div>
                                <span className="font-medium">Start:</span>{" "}
                                {new Date(eventDetails.startTime).toLocaleString() || "—"}
                            </div>
                            <div>
                                <span className="font-medium">End:</span>{" "}
                                {new Date(eventDetails.endTime).toLocaleString() || "—"}
                            </div>
                            <div>
                                <span className="font-medium">Mode:</span>{" "}
                                {eventDetails.mode || "—"}
                            </div>
                            <div>
                                <span className="font-medium">Location:</span>{" "}
                                {eventDetails.location || "—"}
                            </div>
                            {eventDetails.link && (
                                <div className="md:col-span-2">
                                    <span className="font-medium">Link:</span>{" "}
                                    <a
                                        href={eventDetails.link}
                                        target="_blank"
                                        className="text-teal-400 underline hover:text-teal-300 transition"
                                    >
                                        {eventDetails.link}
                                    </a>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-center mt-5">
                            <button
                                type="button"
                                onClick={() => {
                                    setTempDetails(eventDetails);
                                    setIsModalOpen(true);
                                }}
                                className="bg-[#0d6969] hover:bg-[#118585] px-6 py-2 rounded-lg font-medium shadow-md transition-all cursor-pointer"
                            >
                                Edit Event Details
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex justify-center">
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(true)}
                            className="bg-[#0d6969] hover:bg-[#118585] px-8 py-2 rounded-lg font-medium shadow-md transition-all cursor-pointer"
                        >
                            Add Event Details
                        </button>
                    </div>
                )}
            </motion.div>


            {typeof window !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isModalOpen && (
                            <>
                                <motion.div
                                    className="fixed top-0 left-0 w-screen h-screen bg-black/60 backdrop-blur-sm z-[1000]"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsModalOpen(false)}
                                />

                                <motion.div
                                    className="fixed inset-0 z-[1001] flex justify-center items-center"
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="bg-[#0b0f0f] p-8 rounded-2xl shadow-2xl w-[90%] max-w-125 border border-white/10 text-white space-y-5">
                                        <h2 className="text-xl font-semibold mb-2 text-center bg-linear-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent">
                                            Add Event Details
                                        </h2>

                                        <div className="flex flex-col gap-3">
                                            <div className="flex flex-col gap-1">
                                                <label htmlFor="" className="px-1">Event name *</label>
                                                <input
                                                    type="text"
                                                    name="name"
                                                    value={tempDetails.name}
                                                    onChange={handleChange}
                                                    className="bg-white/10 px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label htmlFor="" className="px-1">Event description</label>
                                                <textarea
                                                    name="description"
                                                    rows={3}
                                                    value={tempDetails.description}
                                                    onChange={handleChange}
                                                    className="bg-white/10 px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-teal-600 resize-none border border-white/15"
                                                />
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <CalendarTimePicker
                                                    label="Begins *"
                                                    value={tempDetails.startTime}
                                                    onChange={(val) => setTempDetails({ ...tempDetails, startTime: val })}
                                                />
                                                <CalendarTimePicker
                                                    label="Ends *"
                                                    value={tempDetails.endTime}
                                                    onChange={(val) => setTempDetails({ ...tempDetails, endTime: val })}
                                                />
                                            </div>


                                            <CustomDropdown
                                                label="Event Mode *"
                                                options={["VIRTUAL", "INPERSON", "HYBRID"]}
                                                placeholder="Select Mode"
                                                onChange={(val) => setTempDetails((prev) => ({ ...prev, mode: val }))}
                                                selected={selectedEventMode}
                                                setSelected={setSelectedEventMode}
                                            />

                                            <div className="flex flex-col gap-1">
                                                <label htmlFor="" className="px-1">Event link</label>
                                                <input
                                                    type="text"
                                                    name="link"
                                                    value={tempDetails.link}
                                                    onChange={handleChange}
                                                    className="bg-white/10 px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                                                />
                                            </div>
                                            <div className="flex flex-col gap-1">
                                                <label htmlFor="" className="px-1">Location *</label>
                                                <input
                                                    type="text"
                                                    name="location"
                                                    value={tempDetails.location}
                                                    onChange={handleChange}
                                                    className="bg-white/10 px-3 py-2 rounded-md outline-none focus:ring-1 focus:ring-teal-600 border border-white/15"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex justify-end gap-3 mt-5">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    setIsModalOpen(false)
                                                }
                                                className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all cursor-pointer"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleSave}
                                                className="px-6 py-2 bg-[#118585] hover:bg-[#14a0a0] rounded-lg transition-all cursor-pointer"
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
