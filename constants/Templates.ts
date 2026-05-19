export interface Template {
  id: string;
  title: string;
  image: string;
  inputType: "text" | "image";
  templateType: "video" | "image";
  inputCount: number;
  prompt: string;
  categoryId?: string;
  isPrimary?: boolean;
}

export interface Category {
  id: string;
  title: string;
  templates: Template[];
}
