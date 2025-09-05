export type Canvas = {
  width: number;
  height: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  canvas: Canvas;
  participants: number; // can be changed to user list
  date: Date;
};

export type User = {
  id: string;
  name: string;
};

export type Message = {
  id: string;
  content: string;
  sender: string;
  date: Date;
};
