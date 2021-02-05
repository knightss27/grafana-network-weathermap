import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';
import { NodeBuilder } from 'NodeBuilder';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
    .addCustomEditor({
      id: 'weathermapEditor',
      path: 'weathermap',
      name: 'Edit Weathermap',
      description: 'Add, remove, and edit weathermap nodes and links.',
      editor: NodeBuilder,
      settings: {
        placeholder: 'This is my placeholder.',
      },
    })
    .addColorPicker({
      path: 'backgroundColor',
      name: 'Background Color',
      description: 'Choose a background color.',
      defaultValue: '#fff',
    })
    .addBooleanSwitch({
      path: 'enableNodeGrid',
      name: 'Node Grid Snapping',
      description: "Turn on or off a snappable grid for dragging.",
      defaultValue: false,
    })
    .addNumberInput({
      path: 'gridSizePx',
      name: 'Grid Size (px)',
      description: "Set the nodes' snappable grid size.",
      defaultValue: 10,
      showIf: config => config.enableNodeGrid,
    })
});
