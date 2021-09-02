import React from 'react';
import { ColorPicker, InlineField, InlineFieldRow, InlineLabel, Input } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { PanelOptions } from 'types';

interface Settings {}

interface Props extends StandardEditorProps<PanelOptions, Settings> {}

export const NewColorPicker = ({ value, onChange }: Props) => {
  const handleColorChange = (color: string) => {
    console.log('changing to: ' + color);
    let options = value;
    options.backgroundColor = color;
    onChange(options);
  };

  return (
    <React.Fragment>
      <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
        Background Color:
        <ColorPicker color={value.backgroundColor} onChange={handleColorChange} />
      </InlineLabel>

      <InlineFieldRow>
        <InlineField label="Viewbox Width (px)">
          <Input
            value={value.panelSize.width}
            placeholder={'Panel Width'}
            type={'number'}
            css={''}
            name={'panelWidth'}
            onChange={(e) => {
              let options = value;
              options.panelSize.width = parseInt(e.currentTarget.value);
              onChange(options);
            }}
          ></Input>
        </InlineField>
        <InlineField label="Viewbox Height (px)">
          <Input
            value={value.panelSize.height}
            placeholder={'Panel Height'}
            type={'number'}
            css={''}
            name={'panelHeight'}
            onChange={(e) => {
              let options = value;
              options.panelSize.height = parseInt(e.currentTarget.value);
              onChange(options);
            }}
          ></Input>
        </InlineField>
      </InlineFieldRow>
    </React.Fragment>
  );
};
