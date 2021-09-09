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
    .addCustomEditor({
      id: 'exportSVG',
      path: 'weathermap',
      name: 'Export SVG',
      description: 'Export an SVG snapshot of the weathermap.',
      editor: ExportSVG,
    });
});
