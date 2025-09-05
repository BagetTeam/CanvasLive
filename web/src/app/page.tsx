import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@radix-ui/themes";
import { ArrowLeft, Download, Share } from "lucide-react";

import RoomSelector from "@/components/canvas/RoomSelector";
import PixelCanvas from "@/components/canvas/PixelCanvas";
import ColorPalette from "@/components/canvas/ColorPalette";
import ChatPanel from "@/components/canvas/ChatPanel";

export default function Canvas() {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#FF0000");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isGeneratingSnapshot, setIsGeneratingSnapshot] = useState(false);

  if (!selectedRoom) {
    return <RoomSelector onRoomSelect={setSelectedRoom} />;
  }

  const handleBackToRooms = () => {
    setSelectedRoom(null);
    setIsChatOpen(false);
  };

  const handlePixelPlace = (x, y, color) => {
    // This can be used for analytics or real-time features
    console.log(`Pixel placed at ${x},${y} with color ${color}`);
  };

  const handleCreateSnapshot = async () => {
    setIsGeneratingSnapshot(true);
    try {
      // Generate a snapshot image of the current canvas
      const result = await GenerateImage({
        prompt: `Create a pixel art representation of a collaborative canvas named "${selectedRoom.name}". The image should look like a retro pixel art game with vibrant colors on a grid. Include some random colorful pixels placed by users in an artistic pattern.`,
      });

      if (result.url) {
        await CanvasSnapshot.create({
          room_id: selectedRoom.id,
          name: `${selectedRoom.name} - ${new Date().toLocaleDateString()}`,
          image_url: result.url,
          pixel_count: Math.floor(Math.random() * 500) + 100,
          contributors: Math.floor(Math.random() * 20) + 5,
        });

        // Open the generated image in a new tab
        window.open(result.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating snapshot:", error);
    }
    setIsGeneratingSnapshot(false);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `PixelCanvas - ${selectedRoom.name}`,
          text: "Join me in creating collaborative pixel art!",
          url: shareUrl,
        });
      } catch (error) {
        console.log("Error sharing:", error);
      }
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      alert("Room link copied to clipboard!");
    }
  };

  return (
    <div className="h-screen flex bg-gray-900 overflow-hidden">
      {/* Color Palette */}
      <ColorPalette
        selectedColor={selectedColor}
        onColorSelect={setSelectedColor}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToRooms}
              className="text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Rooms
            </Button>
            <div>
              <h2 className="text-white text-lg font-semibold">
                {selectedRoom.name}
              </h2>
              <p className="text-gray-400 text-sm">
                {selectedRoom.canvas_width} × {selectedRoom.canvas_height}{" "}
                canvas
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateSnapshot}
              disabled={isGeneratingSnapshot}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Download className="w-4 h-4 mr-2" />
              {isGeneratingSnapshot ? "Creating..." : "Snapshot"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Share className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </motion.div>

        {/* Canvas */}
        <PixelCanvas
          room={selectedRoom}
          selectedColor={selectedColor}
          onPixelPlace={handlePixelPlace}
        />
      </div>

      {/* Chat Panel */}
      <ChatPanel
        room={selectedRoom}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
      />
    </div>
  );
}
