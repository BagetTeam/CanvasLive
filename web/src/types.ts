export type Canvas = {
  width: number;
  height: number;
};

export type Room = {
  id: string;
  name: string;
  description: string;
  canvas: Canvas;
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
