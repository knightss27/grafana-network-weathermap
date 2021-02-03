import { PanelPlugin } from '@grafana/data';
import { SimpleOptions } from './types';
import { SimplePanel } from './SimplePanel';
import { NodeBuilder } from 'NodeBuilder';

export const plugin = new PanelPlugin<SimpleOptions>(SimplePanel).setPanelOptions(builder => {
  return builder
    // .addTextInput({
    //   path: 'text',
    //   name: 'Background Color',
    //   description: 'Change the background color',
    //   defaultValue: 'Default value of text input option',
    // })
    .addColorPicker({
      path: 'backgroundColor',
      name: 'Background Color',
      description: 'Choose a background color.',
      defaultValue: '#fff',
    })
    .addBooleanSwitch({
      path: 'showSeriesCount',
      name: 'Show series counter',
      defaultValue: false,
    })
    .addRadio({
      path: 'seriesCountSize',
      defaultValue: 'sm',
      name: 'Series counter size',
      settings: {
        options: [
          {
            value: 'sm',
            label: 'Small',
          },
          {
            value: 'md',
            label: 'Medium',
          },
          {
            value: 'lg',
            label: 'Large',
          },
        ],
      },
      showIf: config => config.showSeriesCount,
    })
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
    .addRadio({
      path: 'color',
      name: 'Circle color',
      defaultValue: 'red',
      settings: {
        options: [
          {
            value: 'red',
            label: 'Red',
          },
          {
            value: 'green',
            label: 'Green',
          },
          {
            value: 'blue',
            label: 'Blue',
          },
        ],
      }
    });
});
