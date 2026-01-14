"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CalendarTimePickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export default function CalendarTimePicker({ label, value, onChange }: CalendarTimePickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
        value ? new Date(value) : null
    );
    const [hours, setHours] = useState<number>(selectedDate ? selectedDate.getHours() : 12);
    const [minutes, setMinutes] = useState<number>(
        selectedDate ? selectedDate.getMinutes() : 0
    );
    const [monthOffset, setMonthOffset] = useState(0);

    const today = new Date();
    const currentMonth = new Date(today.getFullYear(), today.getMonth() + monthOffset, 1);
    const monthDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();

    const handleDaySelect = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, hours, minutes);
        setSelectedDate(newDate);
    };

    const handleSave = () => {
        if (selectedDate) {
            const updated = new Date(
                selectedDate.getFullYear(),
                selectedDate.getMonth(),
                selectedDate.getDate(),
                hours,
                minutes
            );
            onChange(updated.toISOString());
            setIsOpen(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-1 relative">
            <label className="px-1 text-white/80 text-sm font-medium">{label}</label>

            <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="w-full text-left bg-white/10 px-3 py-2.5 rounded-md outline-none 
                   focus:ring-1 focus:ring-teal-600 transition-all duration-200 
                   flex justify-between items-center text-white/80 hover:bg-white/15 border border-white/15"
            >
                {value ? (
                    <>
                        {new Date(value).toLocaleString()}
                    </>
                ) : (
                    <span className="text-white/50">Select date & time</span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            className="fixed inset-0 z-50 flex items-center justify-center"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            <div className="bg-[#0b0f0f] border border-white/10 rounded-2xl shadow-xl p-6 w-[90%] max-w-[420px] text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <button
                                        onClick={() => setMonthOffset((prev) => prev - 1)}
                                        className="px-2 py-1 text-white/60 hover:text-teal-300"
                                    >
                                        ‹
                                    </button>
                                    <h2 className="text-lg font-semibold">
                                        {currentMonth.toLocaleString("default", { month: "long", year: "numeric" })}
                                    </h2>
                                    <button
                                        onClick={() => setMonthOffset((prev) => prev + 1)}
                                        className="px-2 py-1 text-white/60 hover:text-teal-300"
                                    >
                                        ›
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 gap-1 text-center text-sm mb-4">
                                    {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
                                        <div key={d} className="text-white/50 font-medium">{d}</div>
                                    ))}

                                    {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}

                                    {Array.from({ length: monthDays }, (_, i) => i + 1).map((day) => {
                                        const isSelected =
                                            selectedDate &&
                                            selectedDate.getDate() === day &&
                                            selectedDate.getMonth() === currentMonth.getMonth();

                                        return (
                                            <div
                                                key={day}
                                                onClick={() => handleDaySelect(day)}
                                                className={`cursor-pointer py-2 rounded-md transition-all ${isSelected
                                                    ? "bg-teal-600 text-white"
                                                    : "hover:bg-white/10 text-white/80"
                                                    }`}
                                            >
                                                {day}
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="flex justify-between items-center mb-4 gap-4">
                                    <div className="flex-1">
                                        <label className="text-sm text-white/70 block mb-1">Hours</label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="23"
                                            value={hours}
                                            onChange={(e) => setHours(Number(e.target.value))}
                                            className="w-full accent-teal-500 "
                                        />
                                        <div className="text-center text-white/70 text-sm mt-1 font-medium">
                                            {hours.toString().padStart(2, "0")}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <label className="text-sm text-white/70 block mb-1">Minutes</label>
                                        <div className="flex gap-3 justify-center">
                                            {["00", "30"].map((m) => (
                                                <button
                                                    key={m}
                                                    onClick={() => setMinutes(Number(m))}
                                                    className={`px-4 py-2 rounded-lg border border-white/10 transition-all cursor-pointer ${minutes === Number(m)
                                                        ? "bg-teal-600 text-white"
                                                        : "bg-white/5 text-white/70 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {m}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="px-5 py-2 rounded-md bg-white/10 hover:bg-white/20 transition-all text-white/80 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-5 py-2 rounded-md bg-teal-600 hover:bg-teal-700 transition-all text-white font-medium cursor-pointer"
                                    >
                                        Save
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
