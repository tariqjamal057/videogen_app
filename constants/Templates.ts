export interface Template {
  id: string;
  title: string;
  description: string;
  image: string;
  inputType: "text" | "image";
  templateType: "video" | "image";
  inputCount: number;
  prompt: string;
}

export interface Category {
  id: string;
  title: string;
  templates: Template[];
}
