import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';
import { NodeBuilder } from 'NodeBuilder';
import { ExportSVG } from './ExportSVG';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions((builder) => {
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
    // TODO: add these inputs to the custom editor
    // .addBooleanSwitch({
    //   path: 'weathermap.enableNodeGrid',
    //   name: 'Node Grid Snapping',
    //   description: 'Turn on or off a snappable grid for dragging.',
    //   defaultValue: false,
    // })
    // .addNumberInput({
    //   path: 'weathermap.gridSizePx',
    //   name: 'Grid Size (px)',
    //   description: "Set the nodes' snappable grid size.",
    //   defaultValue: 10,
    //   showIf: (config) => config.weathermap.settings.enableNodeGrid,
    // })
    .addCustomEditor({
      id: 'exportSVG',
      path: 'weathermap',
      name: 'Export SVG',
      description: 'Export an SVG snapshot of the weathermap.',
      editor: ExportSVG,
    });
});
