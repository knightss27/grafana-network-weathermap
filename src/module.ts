import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { WeathermapPanel } from './WeathermapPanel';
import { WeathermapBuilder } from 'forms/WeathermapBuilder';
import { ExportForm } from 'forms/ExportForm';

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
      description: `Export an SVG snapshot of the weathermap. The SVG exports show only links and nodes, for the entire panel please use Grafana's image renderer plugin.`,
      editor: ExportForm,
    });
});
