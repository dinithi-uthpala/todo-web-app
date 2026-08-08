export type Todo = {
  id: number;
  user_id?: number;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
};

export type TodoApiResponse = {
  data?: Todo[];
  message?: string;
};
