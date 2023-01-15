import React from 'react';
import { getDefaultRelativeTimeRange, getTimeZone, LoadingState, PanelProps } from '@grafana/data';
import { fireEvent, render, screen } from '@testing-library/react';
import { WeathermapPanel } from 'WeathermapPanel';
import { SimpleOptions } from 'types';
import { handleVersionedStateUpdates } from 'utils';
import { getConnectedLinkData, getData, getData2, theme } from 'testData';

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

// Annoying wrapper to support movementX/Y in mouse events for testing
class MouseMoveEvent extends MouseEvent {
  readonly movementX = 0 as number;
  readonly movementY = 0 as number;
  constructor(init?: MouseEventInit) {
    super('mousemove', init);
    if (init?.movementX) {
      this.movementX = init.movementX ?? 0;
    }
    if (init?.movementY) {
      this.movementY = init.movementY ?? 0;
    }
  }
}

test('Creating a weathermap', () => {
  let testProps = { ...mPanelProps };
  testProps.options.weathermap = handleVersionedStateUpdates(getData(theme), theme);
  testProps.onOptionsChange = (options: SimpleOptions) => {
    testProps.options = options;
  };

  // Render the panel
  const { container } = render(<WeathermapPanel {...testProps} />);

  // Check the SVG exists
  let wmRendered = container.querySelector('#nw-testing')!;
  expect(wmRendered).toHaveProperty('tagName', 'svg');

  // Check for each node
  testProps.options.weathermap.nodes.forEach((n) => {
    expect(screen.queryByText(n.label!)).not.toBeNull();
  });

  // Check that we have a link
  expect(screen.getAllByTestId('link')).toHaveLength(1);

  // Check that link hover works
  fireEvent.mouseMove(screen.getByTestId('link').firstChild!);
  fireEvent.mouseLeave(screen.getByTestId('link').firstChild!);

  // Check link labels
  expect(screen.getAllByText('n/a')).toHaveLength(2);

  // Check we can drag the viewport
  const prevTranslation = container.querySelector('g')!.getAttribute('transform');
  fireEvent.mouseDown(container.querySelector('#nw-testing')!);
  const event: MouseEvent = new MouseMoveEvent({ movementX: 10, movementY: 10, buttons: 4, bubbles: true });
  fireEvent(container.querySelector('#nw-testing')!, event);
  fireEvent.mouseUp(container.querySelector('#nw-testing')!);
  const newTranslation = container.querySelector('g')!.getAttribute('transform');
  expect(prevTranslation).not.toEqual(newTranslation);

  // TODO: find a working way to check node dragging
});

test('Editing a weathermap', () => {
  let testProps = { ...mPanelProps };
  testProps.options.weathermap = handleVersionedStateUpdates(getData2(theme), theme);
  testProps.onOptionsChange = (options: SimpleOptions) => {
    testProps.options = options;
  };

  // Render the panel
  const { rerender } = render(<WeathermapPanel {...testProps} />);

  // Check for each node
  testProps.options.weathermap.nodes.forEach((n) => {
    expect(screen.queryByText(n.label!)).not.toBeNull();
  });

  // Check that icons are rendered
  testProps.options.weathermap.nodes[0].label = '';
  rerender(<WeathermapPanel {...testProps} />);
  expect(screen.queryByText('Node A')).toBeNull();

  testProps.options.weathermap.nodes[0].nodeIcon!.drawInside = true;
  testProps.options.weathermap.nodes[0].nodeIcon!.size = { width: 100, height: 100 };
  testProps.options.weathermap.nodes[0].nodeIcon!.src = '/icons/test';
  rerender(<WeathermapPanel {...testProps} />);
  expect(screen.queryByText('Node A')).toBeNull();

  testProps.options.weathermap.nodes[0].label = 'Node A';
  rerender(<WeathermapPanel {...testProps} />);
  expect(screen.queryByText('Node A')).not.toBeNull();

  // Check that we have two links
  expect(screen.getAllByTestId('link')).toHaveLength(2);
});

test('Connected links', () => {
  let testProps = { ...mPanelProps };
  testProps.options.weathermap = handleVersionedStateUpdates(getConnectedLinkData(theme), theme);
  testProps.onOptionsChange = (options: SimpleOptions) => {
    testProps.options = options;
  };

  // Render the panel
  render(<WeathermapPanel {...testProps} />);

  // Check for each node
  testProps.options.weathermap.nodes.forEach((n) => {
    if (n.isConnection) {
      expect(screen.queryByText(n.label!)).toBeNull();
    } else {
      expect(screen.queryByText(n.label!)).not.toBeNull();
    }
  });

  // Check that we have two links (one is a connection)
  expect(screen.getAllByTestId('link')).toHaveLength(2);
});

test('Check edit mode display', () => {
  let testProps = { ...mPanelProps };
  testProps.options.weathermap = handleVersionedStateUpdates(getConnectedLinkData(theme), theme);
  testProps.onOptionsChange = (options: SimpleOptions) => {
    testProps.options = options;
  };

  // @ts-ignore
  delete window.location;
  // @ts-ignore
  window.location = new URL('https://www.example.com/?editPanel=1');
  // Render the panel
  const { container, rerender } = render(<WeathermapPanel {...testProps} />);

  // Check for each node
  testProps.options.weathermap.nodes.forEach((n) => {
    expect(screen.queryByText(n.label!)).not.toBeNull();
  });

  // Check we can zoom the viewport (only possible in edit mode)
  fireEvent.wheel(container.querySelector('#nw-testing_')!, { deltaY: 1 });
  expect(testProps.options.weathermap.settings.panel.zoomScale).not.toEqual(0);

  fireEvent.wheel(container.querySelector('#nw-testing_')!, { deltaY: -1 });
  expect(testProps.options.weathermap.settings.panel.zoomScale).toEqual(0);

  // @ts-ignore
  window.location = new URL('https://www.example.com/');
  rerender(<WeathermapPanel {...testProps} />);
  fireEvent.wheel(container.querySelector('#nw-testing')!, { deltaY: -1 });
  expect(testProps.options.weathermap.settings.panel.zoomScale).toEqual(0);
});
