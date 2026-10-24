/** Explicit recipe selection; exported CSVs do not identify time units or active pierce stages. */
export interface TechnologySelection {
  code: string;
  cutProfile: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'L';
  pierceProfile: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  pierceTimeUnit: 's' | 'ms' | 'cs';
}
