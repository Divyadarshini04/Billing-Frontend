import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";
import { ExportSuccessContext } from "../context/ExportSuccessContext";

export default function ExportSuccessModal() {
  const { successModal } = useContext(ExportSuccessContext);

  return (
    <AnimatePresence>
      {successModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 150, damping: 20 }}
            className="bg-white rounded-3xl p-16 shadow-2xl text-center max-w-md w-full mx-4"
          >
            {/* Animated Checkmark Circle */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 20 }}
              className="w-32 h-32 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <CheckCircle className="w-24 h-24 text-green-600" strokeWidth={1.5} />
              </motion.div>
            </motion.div>

            {/* Success Title */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-4xl font-bold text-gray-900 mb-4"
            >
              Success!
            </motion.h2>

            {/* Success Message */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl text-gray-600 mb-8"
            >
              {successModal.message}
            </motion.p>

            {/* Progress Bar */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ delay: 0.6, duration: 3.4 }}
              className="h-1 bg-green-500 rounded-full origin-left"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
