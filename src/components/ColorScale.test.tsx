import { render, screen } from '@testing-library/react';
import React from 'react';
import { getData, theme } from 'testData';
import ColorScale from './ColorScale';

test('Creating a scale', () => {
  let testProps = {
    thresholds: [
      {
        color: '#5794F2',
        percent: 0,
      },
      {
        color: '#73BF69',
        percent: 10,
      },
      {
        color: '#FADE2A',
        percent: 20,
      },
      {
        color: '#FF9830',
        percent: 30,
      },
      {
        color: '#FA6400',
        percent: 40,
      },
      {
        color: '#E02F44',
        percent: 50,
      },
      {
        color: '#C4162A',
        percent: 60,
      },
      {
        color: '#B877D9',
        percent: 70,
      },
      {
        color: '#8F3BB8',
        percent: 80,
      },
      {
        color: '#ff00ce',
        percent: 90,
      },
    ],
    settings: getData(theme).settings,
  };

  // Render the panel
  const { rerender } = render(<ColorScale {...testProps} />);

  // Check if scale items are all rendered
  expect(screen.getAllByTestId('scale-item')).toHaveLength(testProps.thresholds.length);
  testProps.thresholds.forEach((t, i) => {
    if (i < testProps.thresholds.length - 1) {
      expect(screen.getByText(`${t.percent}% - ${testProps.thresholds[i + 1].percent}%`)).not.toBeNull();
    } else {
      expect(screen.getByText(`${t.percent}% - 100%`)).not.toBeNull();
    }
  });

  // Check that scale doesn't render without settings
  let testProps2 = { ...testProps };
  // @ts-ignore
  delete testProps2.settings.scale;
  rerender(<ColorScale {...testProps2} />);

  expect(screen.queryByTestId('scale-item')).toBeNull();
});
