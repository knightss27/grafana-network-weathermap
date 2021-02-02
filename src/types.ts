type SeriesSize = 'sm' | 'md' | 'lg';

export interface SimpleOptions {
  backgroundColor: string;
  showSeriesCount: boolean;
  seriesCountSize: SeriesSize;
  editNodes: string;
  color: CircleColor;
}

type CircleColor = 'red' | 'green' | 'blue';
