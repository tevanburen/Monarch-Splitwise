import { Dayjs } from 'dayjs';

export interface TvbAccount {
  monarchName: string;
  splitwiseName: string;
  monarchId: string;
  startDate: Dayjs | null;
}
