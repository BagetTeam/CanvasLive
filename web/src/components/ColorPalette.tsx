import React, { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { COLORS } from "@/lib/consts";

type ColorPalettePayload = {
  selectedColor: string;
  onColorSelect: Dispatch<SetStateAction<string>>;
};

export default function ColorPalette({
  selectedColor,
  onColorSelect,
}: ColorPalettePayload) {
  return (
    <div className="bg-gray-800 border-r border-gray-700 p-4 w-20 flex flex-col">
      <h3 className="text-white text-sm font-semibold mb-4 text-center">
        Colors
      </h3>

      <div className="grid grid-cols-2 gap-2 flex-1 content-start">
        {COLORS.map((color) => (
          <motion.button
            key={color}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onColorSelect(color)}
            className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
              selectedColor === color
                ? "border-cyan-400 shadow-lg shadow-cyan-400/50"
                : "border-gray-600 hover:border-gray-500"
            }`}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>

      {selectedColor && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="text-xs text-gray-400 text-center mb-2">Selected</div>
          <div
            className="w-12 h-12 rounded-lg border-2 border-cyan-400 shadow-lg shadow-cyan-400/50 mx-auto"
            style={{ backgroundColor: selectedColor }}
          />
          <div className="text-xs text-gray-300 text-center mt-2 font-mono">
            {selectedColor.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
