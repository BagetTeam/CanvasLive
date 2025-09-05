import { Room } from "@/types/types";
import React, { useState, useRef, useEffect, useCallback } from "react";

type PixelCanvasPayload = {
  room: Room | undefined;
  selectedColor: string;
};
export default function PixelCanvas({
  room,
  selectedColor,
}: PixelCanvasPayload) {
  const canvasRef = useRef(null);
  const [pixels, setPixels] = useState({});
  const [zoom, setZoom] = useState(8);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const CANVAS_WIDTH = room?.canvas.width || 100;
  const CANVAS_HEIGHT = room?.canvas.width || 100;
  const PIXEL_SIZE = zoom;

  function onPixelPlace() {}

  // Load existing pixels for the room
  useEffect(() => {
    if (!room?.id) return;

    const loadPixels = async () => {
      setIsLoading(true);
      try {
        const pixelData = await PixelData.filter({ room_id: room.id });
        const pixelMap = {};
        pixelData.forEach((pixel) => {
          pixelMap[`${pixel.x}-${pixel.y}`] = pixel.color;
        });
        setPixels(pixelMap);
      } catch (error) {
        console.error("Error loading pixels:", error);
      }
      setIsLoading(false);
    };

    loadPixels();
  }, [room?.id]);

  // Draw canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= CANVAS_WIDTH; x++) {
      const screenX = x * PIXEL_SIZE + pan.x;
      if (screenX >= -PIXEL_SIZE && screenX <= width + PIXEL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(screenX, 0);
        ctx.lineTo(screenX, height);
        ctx.stroke();
      }
    }

    for (let y = 0; y <= CANVAS_HEIGHT; y++) {
      const screenY = y * PIXEL_SIZE + pan.y;
      if (screenY >= -PIXEL_SIZE && screenY <= height + PIXEL_SIZE) {
        ctx.beginPath();
        ctx.moveTo(0, screenY);
        ctx.lineTo(width, screenY);
        ctx.stroke();
      }
    }

    // Draw pixels
    Object.entries(pixels).forEach(([coord, color]) => {
      const [x, y] = coord.split("-").map(Number);
      const screenX = x * PIXEL_SIZE + pan.x;
      const screenY = y * PIXEL_SIZE + pan.y;

      if (
        screenX >= -PIXEL_SIZE &&
        screenX <= width + PIXEL_SIZE &&
        screenY >= -PIXEL_SIZE &&
        screenY <= height + PIXEL_SIZE
      ) {
        ctx.fillStyle = color;
        ctx.fillRect(screenX, screenY, PIXEL_SIZE, PIXEL_SIZE);
      }
    });
  }, [pixels, zoom, pan, CANVAS_WIDTH, CANVAS_HEIGHT, PIXEL_SIZE]);

  const getCanvasCoordinates = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current;
      if (!canvas) return null;

      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((clientX - rect.left - pan.x) / PIXEL_SIZE);
      const y = Math.floor((clientY - rect.top - pan.y) / PIXEL_SIZE);

      if (x >= 0 && x < CANVAS_WIDTH && y >= 0 && y < CANVAS_HEIGHT) {
        return { x, y };
      }
      return null;
    },
    [pan, PIXEL_SIZE, CANVAS_WIDTH, CANVAS_HEIGHT]
  );

  const handleCanvasClick = async (e) => {
    if (isDragging) return;

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    if (!coords || !selectedColor || !room?.id) return;

    const key = `${coords.x}-${coords.y}`;

    // Optimistic update
    setPixels((prev) => ({ ...prev, [key]: selectedColor }));

    try {
      // Save to database
      await PixelData.create({
        room_id: room.id,
        x: coords.x,
        y: coords.y,
        color: selectedColor,
      });

      onPixelPlace?.(coords.x, coords.y, selectedColor);
    } catch (error) {
      console.error("Error placing pixel:", error);
      // Revert optimistic update
      setPixels((prev) => {
        const newPixels = { ...prev };
        delete newPixels[key];
        return newPixels;
      });
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(false);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e) => {
    const deltaX = e.clientX - lastMousePos.x;
    const deltaY = e.clientY - lastMousePos.y;

    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      setIsDragging(true);
      setPan((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    }

    setLastMousePos({ x: e.clientX, y: e.clientY });
  };

  const handleWheel = (e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    setZoom((prev) => Math.max(2, Math.min(20, prev + delta)));
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-900">
      <canvas
        ref={canvasRef}
        width={800}
        height={600}
        className="cursor-crosshair select-none"
        onClick={handleCanvasClick}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onWheel={handleWheel}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <button
          onClick={() => setZoom((prev) => Math.min(20, prev + 2))}
          className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-200"
        >
          +
        </button>
        <button
          onClick={() => setZoom((prev) => Math.max(2, prev - 2))}
          className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600 rounded-lg flex items-center justify-center text-white font-bold transition-all duration-200"
        >
          −
        </button>
        <button
          onClick={() => {
            setPan({ x: 0, y: 0 });
            setZoom(8);
          }}
          className="w-10 h-10 bg-gray-800/90 hover:bg-gray-700/90 border border-gray-600 rounded-lg flex items-center justify-center text-white text-xs transition-all duration-200"
        >
          ⌂
        </button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-gray-800/90 border border-gray-600 rounded-lg px-4 py-2 text-white text-sm">
        <div>Click to place pixels • Drag to pan • Scroll to zoom</div>
      </div>
    </div>
  );
}
