import React from 'react';
import { ColorPicker, InlineField, InlineFieldRow, InlineLabel, InlineSwitch, Input } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';

interface Settings {}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const PanelForm = ({ value, onChange }: Props) => {
  const handleColorChange = (color: string) => {
    let options = value;
    options.settings.panel.backgroundColor = color;
    onChange(options);
  };

  if (value) {
    return (
      <React.Fragment>
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Background Color:
          <ColorPicker color={value.settings.panel.backgroundColor} onChange={handleColorChange} />
        </InlineLabel>
        <InlineFieldRow>
          <InlineField label="Viewbox Width (px)">
            <Input
              value={value.settings.panel.panelSize.width}
              placeholder={'Panel Width'}
              type={'number'}
              css={''}
              name={'panelWidth'}
              onChange={(e) => {
                let options = value;
                options.settings.panel.panelSize.width = parseInt(e.currentTarget.value);
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Viewbox Height (px)">
            <Input
              value={value.settings.panel.panelSize.height}
              placeholder={'Panel Height'}
              type={'number'}
              css={''}
              name={'panelHeight'}
              onChange={(e) => {
                let options = value;
                options.settings.panel.panelSize.height = parseInt(e.currentTarget.value);
                onChange(options);
              }}
            ></Input>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Link Stroke Width">
            <Input
              value={value.settings.linkStrokeWidth}
              placeholder={'Link Width'}
              type={'number'}
              css={''}
              name={'linkStrokeWidth'}
              onChange={(e) => {
                let options = value;
                options.settings.linkStrokeWidth = parseInt(e.currentTarget.value);
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Link Spacing">
            <Input
              value={value.settings.linkSpacing}
              placeholder={'Link Spacing'}
              type={'number'}
              css={''}
              name={'linkSpacing'}
              onChange={(e) => {
                let options = value;
                options.settings.linkSpacing = parseInt(e.currentTarget.value);
                onChange(options);
              }}
            ></Input>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Arrow Width">
            <Input
              value={value.settings.linkArrow.width}
              placeholder={'Arrow Width'}
              type={'number'}
              css={''}
              name={'arrowWidth'}
              onChange={(e) => {
                let options = value;
                options.settings.linkArrow.width = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Arrow Height">
            <Input
              value={value.settings.linkArrow.height}
              placeholder={'Arrow Height'}
              type={'number'}
              css={''}
              name={'arrowHeight'}
              onChange={(e) => {
                let options = value;
                options.settings.linkArrow.height = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Arrow Offset">
            <Input
              value={value.settings.linkArrow.offset}
              placeholder={'Arrow Offset'}
              type={'number'}
              css={''}
              name={'arrowOffset'}
              onChange={(e) => {
                let options = value;
                options.settings.linkArrow.offset = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label="Enable Node Grid Snapping">
            <InlineSwitch
              value={value.settings.enableNodeGrid}
              css={''}
              onChange={(e) => {
                let wm = value;
                wm.settings.enableNodeGrid = e.currentTarget.checked;
                onChange(wm);
              }}
            />
          </InlineField>
          {value.settings.enableNodeGrid ? (
            <InlineField label="Grid Size (px)">
              <Input
                value={value.settings.gridSizePx}
                placeholder={'Grid Size (px)'}
                type={'number'}
                css={''}
                name={'gridSize'}
                onChange={(e) => {
                  let options = value;
                  options.settings.gridSizePx = parseInt(e.currentTarget.value);
                  onChange(options);
                }}
              ></Input>
            </InlineField>
          ) : (
            ''
          )}
        </InlineFieldRow>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};
