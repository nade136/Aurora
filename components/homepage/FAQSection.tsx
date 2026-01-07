"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "How long would this cohort last?",
    answer:
      "For 3 months. It would begin with introductory classes on the 13th of March, 2026 and run for 12 weeks after that.",
  },
  {
    question: "What currency do you use?",
    answer:
      "We accept payments in USD, EUR, and NGN. All prices are listed in USD by default.",
  },
  {
    question: "What is the time commitment?",
    answer:
      " We recommend setting aside 10-12 hours per week. This includes watching the modules, attending the live Q&A, and- most importantly- debugging your code and hardware.",
  },
  {
    question: "Do you charge a flat fee?",
    answer:
      "Yes, we charge a one-time flat fee of $32 for the entire cohort with no hidden charges.",
  },
  {
    question: "Any ongoing support?",
    answer:
      "Yes, we provide lifetime access to our community and ongoing support even after the cohort ends.",
  },
  {
    question: "Can i see previous projects?",
    answer:
      "Absolutely! We have a showcase of previous student projects available on our website and social media.",
  },
  {
    question: "Do you take 100% payment upfront?",
    answer:
      "No, we offer flexible payment plans. You can pay 50% upfront and 50% after the first month.",
  },
];

export default function FAQSection() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);

  const toggleFAQ = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <section className="relative bg-black py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10 sm:mb-14 lg:mb-16"
        >
          {/* Badge */}
          <div className="inline-block px-4 py-1 border border-[#CCFF00] rounded-full mb-3 sm:mb-4">
            <span className="text-[#CCFF00] text-[10px] sm:text-xs font-medium uppercase tracking-wider">
              Frequently Asked Questions
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            HAVE QUESTIONS? <span className="text-white">GET ANSWERS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-lg">
            Get Direct answers to questions about this cohort
          </p>
        </motion.div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 items-start">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className={`group relative rounded-2xl overflow-hidden transition-all duration-300 self-start ${
                openIndexes.includes(index)
                  ? "bg-zinc-900 border-2 border-[#CCFF00]"
                  : "bg-white border-2 border-transparent hover:border-zinc-300"
              }`}
            >
              {/* Question Button */}
              <button
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndexes.includes(index)}
                aria-controls={`faq-panel-${index}`}
                className="w-full p-4 sm:p-6 flex items-start justify-between gap-3 sm:gap-4 text-left cursor-pointer"
              >
                <span
                  className={`flex-1 min-w-0 text-base sm:text-lg font-semibold ${
                    openIndexes.includes(index)
                      ? "text-[#CCFF00] whitespace-normal break-words"
                      : "text-black group-hover:text-zinc-800 truncate"
                  }`}
                >
                  {faq.question}
                </span>
                <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs text-zinc-500 whitespace-nowrap">
                  <span className="whitespace-nowrap">{openIndexes.includes(index) ? "Hide answer" : "Show answer"}</span>
                  <ChevronDown
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                      openIndexes.includes(index) ? "rotate-180 text-[#CCFF00]" : "rotate-0 text-black group-hover:text-zinc-800"
                    }`}
                  />
                </span>
              </button>

              {/* Answer */}
              <AnimatePresence>
                {openIndexes.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                    id={`faq-panel-${index}`}
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6 pt-2">
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
