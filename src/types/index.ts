export type Member = {
  id: string;
  name: string;
  phone?: string | null;
  organization: string;
  division?: string | null;
  role?: string | null;
  joined_at?: string | null;
};

export type Attendance = {
  id: string;
  member_id: string;
  date: string;
  status: "hadir" | "izin" | "alpa";
};

export type PointRow = {
  id: string;
  member_id: string;
  activity: string;
  points: number;
  created_at: string;
};
