export interface Event {
  title: string;
  startDate: Date;
  endDate: Date;
  description?: string;
  url?: string;
  location?: string;
  hash?: string;
  originalUID?: string,
  originalRecurrenceID?: string
  toBeRemoved?: boolean
}