import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Input } from "@radix-ui/themes";
import { Textarea } from "@heroui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Users, Palette } from "lucide-react";
import { Room } from "@/types/types";
import { defaultRoom } from "@/types/consts";

export default function RoomSelector() {
  const [rooms, setRooms] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newRoom, setNewRoom] = useState<Room>(defaultRoom);

  function onRoomSelect() {}

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setIsLoading(true);
    try {
      const roomList = await Room.list("-created_date");
      setRooms(roomList);
    } catch (error) {
      console.error("Error loading rooms:", error);
    }
    setIsLoading(false);
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.name.trim()) return;

    try {
      const created = await Room.create(newRoom);
      setRooms((prev) => [created, ...prev]);
      setShowCreateDialog(false);
      setNewRoom({
        name: "",
        description: "",
        canvas_width: 100,
        canvas_height: 100,
      });
      onRoomSelect(created);
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-cyan-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent mb-4">
            PixelCanvas
          </h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join collaborative pixel art rooms and create beautiful artwork
            together with people around the world
          </p>
        </motion.div>

        {/* Create Room Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700 text-white px-8 py-3 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-5 h-5 mr-2" />
            Create New Canvas Room
          </Button>
        </motion.div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {rooms.map((room, index) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="cursor-pointer"
                onClick={() => onRoomSelect(room)}
              >
                <Card className="bg-gray-800/50 border-gray-700 hover:border-cyan-400/50 transition-all duration-300 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      <Palette className="w-5 h-5 text-cyan-400" />
                      {room.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 text-sm mb-3">
                      {room.description || "A collaborative pixel art canvas"}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {room.participant_count || 0} online
                      </span>
                      <span>
                        {room.canvas_width}×{room.canvas_height}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Created {new Date(room.created_date).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {rooms.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Palette className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">No canvas rooms yet</h3>
            <p className="text-gray-500">
              Create the first collaborative canvas room!
            </p>
          </motion.div>
        )}
      </div>

      {/* Create Room Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Create New Canvas Room
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRoom} className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Room Name
              </label>
              <input
                value={newRoom.name}
                onChange={(e) =>
                  setNewRoom((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Enter room name..."
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>
            <div>
              <label className="text-sm text-gray-300 mb-1 block">
                Description (optional)
              </label>
              <textarea
                value={newRoom.description}
                onChange={(e) =>
                  setNewRoom((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="What's this canvas for?"
                className="bg-gray-700 border-gray-600 text-white resize-none"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Width
                </label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={newRoom.canvas_width}
                  onChange={(e) =>
                    setNewRoom((prev) => ({
                      ...prev,
                      canvas_width: parseInt(e.target.value),
                    }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              <div>
                <label className="text-sm text-gray-300 mb-1 block">
                  Height
                </label>
                <input
                  type="number"
                  min="50"
                  max="200"
                  value={newRoom.canvas_height}
                  onChange={(e) =>
                    setNewRoom((prev) => ({
                      ...prev,
                      canvas_height: parseInt(e.target.value),
                    }))
                  }
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-700 hover:to-purple-700"
              >
                Create Room
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
