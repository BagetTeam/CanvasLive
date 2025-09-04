type Room = {
  name: "Room";
  type: object;
  properties: {
    name: {
      type: string;
      description: "Name of the canvas room";
    };
    description: {
      type: string;
      description: "Description of what this room is for";
    };
    canvas_width: {
      type: number;
      default: 100;
      description: "Width of the canvas in pixels";
    };
    canvas_height: {
      type: number;
      default: 100;
      description: "Height of the canvas in pixels";
    };
    is_public: {
      type: boolean;
      default: true;
      description: "Whether the room is publicly accessible";
    };
    participant_count: {
      type: number;
      default: 0;
      description: "Number of active participants";
    };
  };
  required: ["name"];
};
