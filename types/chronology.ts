export interface Attachment {
  _id: string;
  name: string;
  url: string;
  type: "image" | "document";
  size: number;
}

export interface ChronologyEvent {
  _id: string;
  title: string;
  date: string;
  time?: string;
  location: string;
  description: string;
  category: string;
  attachments: Attachment[];
  createdAt?: string;
  updatedAt?: string;
}
