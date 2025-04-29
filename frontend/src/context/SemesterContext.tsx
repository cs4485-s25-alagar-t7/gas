import React, { createContext, useContext, useState, useEffect } from 'react';

const SEASONS = ["Spring", "Summer", "Fall"];

// Helper to format semester string
const formatSemester = (season: string, year: string) => `${season} ${year}`;

// Try to load from localStorage
const getInitialSemesters = () => {
  const stored = localStorage.getItem('createdSemesters');
  if (stored) return JSON.parse(stored);
  // Default to current year/season
  const now = new Date();
  const defaultYear = now.getFullYear().toString();
  return [formatSemester(SEASONS[0], defaultYear)];
};

export const SemesterContext = createContext({
  season: SEASONS[0],
  year: new Date().getFullYear().toString(),
  setSeason: (s: string) => {},
  setYear: (y: string) => {},
  SEASONS,
  createdSemesters: [] as string[],
  addSemester: (sem: string) => {},
  setCurrentSemester: (sem: string) => {},
  availableSemesters: [] as string[],
  refreshAvailableSemesters: () => {},
});

export const useSemester = () => useContext(SemesterContext);

export const SemesterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [season, setSeason] = useState(SEASONS[0]);
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [createdSemesters, setCreatedSemesters] = useState<string[]>(getInitialSemesters());
  const [availableSemesters, setAvailableSemesters] = useState<string[]>([]);

  // Fetch available semesters from backend
  const refreshAvailableSemesters = async () => {
    try {
      const res = await fetch('http://localhost:5002/api/candidates/semesters');
      const data = await res.json();
      setAvailableSemesters(data);
    } catch (e) {
      setAvailableSemesters([]);
    }
  };

  useEffect(() => {
    refreshAvailableSemesters();
  }, []);

  // Add a new semester if not already present
  const addSemester = (sem: string) => {
    setCreatedSemesters(prev => {
      if (!prev.includes(sem)) {
        const updated = [...prev, sem];
        localStorage.setItem('createdSemesters', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
    // Optionally, refresh available semesters after adding
    refreshAvailableSemesters();
  };

  // Set current semester from dropdown (parses season/year)
  const setCurrentSemester = (sem: string) => {
    if (!sem) {
      setSeason("");
      setYear("");
      return;
    }
    const [s, y] = sem.split(' ');
    setSeason(s);
    setYear(y);
  };

  // Persist createdSemesters to localStorage
  useEffect(() => {
    localStorage.setItem('createdSemesters', JSON.stringify(createdSemesters));
  }, [createdSemesters]);

  return (
    <SemesterContext.Provider value={{ season, year, setSeason, setYear, SEASONS, createdSemesters, addSemester, setCurrentSemester, availableSemesters, refreshAvailableSemesters }}>
      {children}
    </SemesterContext.Provider>
  );
}; 