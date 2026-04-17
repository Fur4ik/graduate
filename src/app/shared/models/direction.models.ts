export interface Status {
  id: number;
  name: string;
}

export interface DegreeLevel {
  id: number;
  name: string;
}

export interface DirectionEntry {
  id: number;
  code: string;
  direction: string;
  profile: string;
  degree_level_id: number;
  degree_level: string;
}

export interface DirectionForm {
  degreeLevelId: number | null;
  code: string;
  name: string;
  profile: string;
}
