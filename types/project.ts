export interface Project {
  id: string;
  name: string;
  project_type: string;
  client_name: string | null;
  address: string | null;
  area: number | null;
  status: string;
  created_at: string;
}