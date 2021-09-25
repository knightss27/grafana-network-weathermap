import React from 'react';
import { ColorPicker, InlineField, InlineFieldRow, InlineLabel, InlineSwitch, Input } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';
import { FormDivider } from './FormDivider';

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
        <FormDivider title="Panel" />
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
                options.settings.panel.panelSize.width = e.currentTarget.valueAsNumber;
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
                options.settings.panel.panelSize.height = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
        </InlineFieldRow>
        <FormDivider title="Link Options" />
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
                options.settings.linkStrokeWidth = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Link Spacing Horizontal">
            <Input
              value={value.settings.linkSpacingHorizontal}
              placeholder={'Link Spacing Horizontal'}
              type={'number'}
              css={''}
              name={'linkSpacingHorizontal'}
              onChange={(e) => {
                let options = value;
                options.settings.linkSpacingHorizontal = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Link Spacing Vertical">
            <Input
              value={value.settings.linkSpacingVertical}
              placeholder={'Link Spacing Horizontal'}
              type={'number'}
              css={''}
              name={'linkSpacingVertical'}
              onChange={(e) => {
                let options = value;
                options.settings.linkSpacingVertical = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
        </InlineFieldRow>
        <FormDivider title="Arrow Options" />
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
        <FormDivider title="Grid Options" />
        <InlineFieldRow>
          <InlineField label="Enable Node Grid Snapping">
            <InlineSwitch
              value={value.settings.panel.grid.enabled}
              css={''}
              onChange={(e) => {
                let wm = value;
                wm.settings.panel.grid.enabled = e.currentTarget.checked;
                wm.settings.panel.grid.guidesEnabled = false;
                onChange(wm);
              }}
            />
          </InlineField>
          {value.settings.panel.grid.enabled ? (
            <InlineField label="Grid Size (px)">
              <Input
                value={value.settings.panel.grid.size}
                placeholder={'Grid Size (px)'}
                type={'number'}
                css={''}
                name={'gridSize'}
                onChange={(e) => {
                  let options = value;
                  options.settings.panel.grid.size = e.currentTarget.valueAsNumber;
                  onChange(options);
                }}
              ></Input>
            </InlineField>
          ) : (
            ''
          )}
        </InlineFieldRow>
        {value.settings.panel.grid.enabled ? (
          <InlineFieldRow>
            <InlineField label="Grid Guides">
              <InlineSwitch
                value={value.settings.panel.grid.guidesEnabled}
                css={''}
                onChange={(e) => {
                  let wm = value;
                  wm.settings.panel.grid.guidesEnabled = e.currentTarget.checked;
                  onChange(wm);
                }}
              />
            </InlineField>
          </InlineFieldRow>
        ) : (
          ''
        )}
        <FormDivider title="Font Options" />
        <InlineFieldRow>
          <InlineField label="Node Font Size">
            <Input
              value={value.settings.fontSizing.node}
              placeholder={'Node Font Size'}
              type={'number'}
              css={''}
              name={'nodeFontSize'}
              onChange={(e) => {
                let options = value;
                options.settings.fontSizing.node = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Link Font Size">
            <Input
              value={value.settings.fontSizing.link}
              placeholder={'Link Font Size'}
              type={'number'}
              css={''}
              name={'linkFontSize'}
              onChange={(e) => {
                let options = value;
                options.settings.fontSizing.link = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
        </InlineFieldRow>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};
