import React from 'react';
import { getDefaultRelativeTimeRange, getTimeZone, LoadingState, PanelProps } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { WeathermapPanel } from 'WeathermapPanel';
import { SimpleOptions } from 'types';
import { handleVersionedStateUpdates } from 'utils';
import { getData, theme } from 'testData';

const mPanelProps: PanelProps<SimpleOptions> = {
  id: 1,
  data: {
    state: LoadingState.Done,
    series: [],
    // @ts-ignore
    timeRange: getDefaultRelativeTimeRange(),
  },
  // @ts-ignore
  timeRange: getDefaultRelativeTimeRange(),
  timeZone: getTimeZone(),
  options: {
    // @ts-ignore
    weathermap: null,
  },
  transparent: false,
  width: 600,
  height: 400,
  // @ts-ignore
  fieldConfig: {},
  renderCounter: 1,
  title: 'Test Panel Title',
  // @ts-ignore
  eventBus: {},
  onOptionsChange: (options: SimpleOptions) => {
    console.log('OPTION CHANGE CALLED');
  },
};

test('Creating a weathermap', () => {
  let testProps = { ...mPanelProps };
  // @ts-ignore
  testProps.options.weathermap = handleVersionedStateUpdates(getData(theme), theme);

  // Render the panel
  const { container } = render(<WeathermapPanel {...testProps} />);

  // Check the SVG exists
  let wmRendered = container.querySelector('#nw-testing');
  expect(wmRendered).toHaveProperty('tagName', 'svg');

  // Check for each node
  testProps.options.weathermap.nodes.forEach((n) => {
    expect(screen.getByText(n.label!)).not.toBeNull();
  });

  // Check that we have a link
  expect(screen.getAllByTestId('link')).toHaveLength(1);

  // Check that link hover works
  fireEvent.mouseMove(screen.getByTestId('link').firstChild!);
  expect(screen.getByText('Usage: n/a')).not.toBeNull();
  expect(screen.getByText('Bandwidth: 0 b/s')).not.toBeNull();

  // Check link labels
  expect(screen.getAllByText('n/a')).toHaveLength(2);

  // screen.debug();
});
