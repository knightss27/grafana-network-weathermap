import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { WeathermapPanel } from './WeathermapPanel';
import { WeathermapBuilder } from 'WeathermapBuilder';
import { ExportForm } from './ExportForm';

export const plugin = new PanelPlugin<SimpleOptions>(WeathermapPanel).setPanelOptions((builder) => {
  return builder
    .addCustomEditor({
      id: 'weathermapEditor',
      path: 'weathermap',
      name: 'Edit Weathermap',
      description: 'Add, remove, and edit weathermap nodes and links.',
      editor: WeathermapBuilder,
      settings: {
        placeholder: 'This is my placeholder.',
      },
    })
    .addCustomEditor({
      id: 'exportForm',
      path: 'weathermap',
      name: 'Export Weathermap',
      description: 'Export an SVG snapshot or JSON definition of the weathermap.',
      editor: ExportForm,
    });
});
