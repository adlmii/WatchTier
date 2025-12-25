// Tipe data untuk Film
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

// Pilihan Label Tier
export type TierLabel = 'S' | 'A' | 'B' | 'C' | 'D';

// Tipe data untuk satu Baris Tier (misal: Baris S)
export interface Tier {
  id: TierLabel;
  label: string;
  color: string;
  movies: Movie[];
}