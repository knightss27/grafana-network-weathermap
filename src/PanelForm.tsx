import React from 'react';
import {
  ColorPicker,
  InlineField,
  InlineFieldRow,
  InlineLabel,
  InlineSwitch,
  Input,
  Slider,
  stylesFactory,
  useTheme2,
} from '@grafana/ui';
import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';
import { FormDivider } from './FormDivider';
import { css } from 'emotion';
// import { handleFileUploadErrors } from 'utils';

interface Settings {}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const PanelForm = ({ value, onChange }: Props) => {
  const styles = getStyles(useTheme2());

  const handleColorChange = (color: string) => {
    let options = value;
    if (!color.startsWith('image') && options.settings.panel.backgroundColor.startsWith('image')) {
      options.settings.panel.backgroundColor =
        'image|' + color + '|' + options.settings.panel.backgroundColor.split('|', 3)[2];
    } else {
      options.settings.panel.backgroundColor = color;
    }
    onChange(options);
  };

  if (value) {
    return (
      <React.Fragment>
        <FormDivider title="Panel" />
        <InlineField label="Background:" className={styles.inlineField}>
          <React.Fragment></React.Fragment>
        </InlineField>
        <InlineLabel width={'auto'} style={{ marginBottom: '4px' }}>
          - Color:
          <ColorPicker
            color={
              value.settings.panel.backgroundColor.startsWith('image')
                ? value.settings.panel.backgroundColor.split('|', 3)[1]
                : value.settings.panel.backgroundColor
            }
            onChange={handleColorChange}
          />
        </InlineLabel>
        {/* <InlineLabel width={'auto'} style={{ marginBottom: '4px' }}>
          - Image:
          <FileUpload
            size="sm"
            accept="image/*"
            onFileUpload={({ currentTarget }) => {
              if (
                currentTarget.files &&
                currentTarget.files[0] &&
                currentTarget.files[0].type.startsWith('image') &&
                currentTarget.files[0].size <= 1000000
              ) {
                console.log('Reading file: ' + currentTarget.files[0].name);
                const reader = new FileReader();
                reader.onload = (e: any) => {
                  if (value.settings.panel.backgroundColor.startsWith('image')) {
                    handleColorChange(
                      'image|' + value.settings.panel.backgroundColor.split('|', 3)[1] + '|' + e.target.result
                    );
                  } else {
                    handleColorChange('image|' + value.settings.panel.backgroundColor + '|' + e.target.result);
                  }
                };
                reader.readAsDataURL(currentTarget.files[0]);
              } else {
                handleFileUploadErrors(currentTarget.files);
              }
            }}
          />
          {value.settings.panel.backgroundColor.startsWith('image') ? (
            <Button
              variant="destructive"
              icon="trash-alt"
              size="sm"
              onClick={() => {
                let options = value;
                options.settings.panel.backgroundColor = value.settings.panel.backgroundColor.split('|', 3)[1];
                onChange(options);
              }}
              style={{ justifyContent: 'center' }}
            ></Button>
          ) : (
            ''
          )}
        </InlineLabel> */}
        <InlineFieldRow className={styles.inlineRow}>
          <InlineField label="Viewbox Width (px)" className={styles.inlineField}>
            <Input
              value={value.settings.panel.panelSize.width}
              placeholder={'Panel Width'}
              type={'number'}
              name={'panelWidth'}
              onChange={(e) => {
                let options = value;
                options.settings.panel.panelSize.width = e.currentTarget.valueAsNumber;
                onChange(options);
              }}
            ></Input>
          </InlineField>
          <InlineField label="Viewbox Height (px)" className={styles.inlineField}>
            <Input
              value={value.settings.panel.panelSize.height}
              placeholder={'Panel Height'}
              type={'number'}
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
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Base Color:
          <ColorPicker
            color={value.settings.link.stroke.color}
            onChange={(color) => {
              let options = value;
              options.settings.link.stroke.color = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineFieldRow className={styles.inlineRow}>
          <InlineField label="Link Stroke Width" className={styles.inlineField}>
            <Slider
              min={1}
              max={30}
              value={value.settings.link.stroke.width}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.link.stroke.width = num;
                onChange(options);
              }}
            />
          </InlineField>
          <InlineField label="Link Spacing Horizontal" className={styles.inlineField}>
            <Slider
              min={0}
              max={30}
              value={value.settings.link.spacing.horizontal}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.link.spacing.horizontal = num;
                onChange(options);
              }}
            />
          </InlineField>
          <InlineField label="Link Spacing Vertical" className={styles.inlineField}>
            <Slider
              min={0}
              max={30}
              value={value.settings.link.spacing.vertical}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.link.spacing.vertical = num;
                onChange(options);
              }}
            />
          </InlineField>
        </InlineFieldRow>
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Label Background Color:
          <ColorPicker
            color={value.settings.link.label.background}
            onChange={(color) => {
              let options = value;
              options.settings.link.label.background = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Label Border Color:
          <ColorPicker
            color={value.settings.link.label.border}
            onChange={(color) => {
              let options = value;
              options.settings.link.label.border = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Label Font Color:
          <ColorPicker
            color={value.settings.link.label.font}
            onChange={(color) => {
              let options = value;
              options.settings.link.label.font = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <FormDivider title="Arrow Options" />
        <InlineFieldRow className={styles.inlineRow}>
          <InlineField label="Arrow Width" className={styles.inlineField}>
            <Slider
              min={0}
              max={30}
              value={value.settings.linkArrow.width}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.linkArrow.width = num;
                onChange(options);
              }}
            />
          </InlineField>
          <InlineField label="Arrow Height" className={styles.inlineField}>
            <Slider
              min={0}
              max={30}
              value={value.settings.linkArrow.height}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.linkArrow.height = num;
                onChange(options);
              }}
            />
          </InlineField>
          <InlineField label="Arrow Offset" className={styles.inlineField}>
            <Slider
              min={0}
              max={10}
              value={value.settings.linkArrow.offset}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.linkArrow.offset = num;
                onChange(options);
              }}
            />
          </InlineField>
        </InlineFieldRow>
        <FormDivider title="Grid Options" />
        <InlineFieldRow className={styles.inlineRow}>
          <InlineField label="Enable Node Grid Snapping" className={styles.inlineField}>
            <InlineSwitch
              value={value.settings.panel.grid.enabled}
              onChange={(e) => {
                let wm = value;
                wm.settings.panel.grid.enabled = e.currentTarget.checked;
                wm.settings.panel.grid.guidesEnabled = false;
                onChange(wm);
              }}
            />
          </InlineField>
          {value.settings.panel.grid.enabled ? (
            <InlineField label="Grid Size (px)" className={styles.inlineField}>
              <Slider
                min={2}
                max={50}
                value={value.settings.panel.grid.size}
                step={1}
                onChange={(num) => {
                  let options = value;
                  options.settings.panel.grid.size = num;
                  onChange(options);
                }}
              />
            </InlineField>
          ) : (
            ''
          )}
        </InlineFieldRow>
        {value.settings.panel.grid.enabled ? (
          <InlineFieldRow className={styles.inlineRow}>
            <InlineField label="Grid Guides" className={styles.inlineField}>
              <InlineSwitch
                value={value.settings.panel.grid.guidesEnabled}
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
        <InlineFieldRow className={styles.inlineRow}>
          <InlineField label="Node Font Size" className={styles.inlineField}>
            <Slider
              min={2}
              max={40}
              value={value.settings.fontSizing.node}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.fontSizing.node = num;
                onChange(options);
              }}
            />
          </InlineField>
          <InlineField label="Link Font Size" className={styles.inlineField}>
            <Slider
              min={2}
              max={40}
              value={value.settings.fontSizing.link}
              step={1}
              onChange={(num) => {
                let options = value;
                options.settings.fontSizing.link = num;
                onChange(options);
              }}
            />
          </InlineField>
        </InlineFieldRow>
        <FormDivider title="Tootlip Options" />
        <FormDivider title="Tooltip" />
        <InlineLabel width={'auto'} style={{ marginBottom: '4px' }}>
          Background Color:
          <ColorPicker
            color={value.settings.tooltip.backgroundColor}
            onChange={(color) => {
              let options = value;
              options.settings.tooltip.backgroundColor = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Text Color:
          <ColorPicker
            color={value.settings.tooltip.textColor}
            onChange={(color) => {
              let options = value;
              options.settings.tooltip.textColor = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineField label="Tooltip Font Size" className={styles.inlineField}>
          <Slider
            min={2}
            max={40}
            value={value.settings.tooltip.fontSize}
            step={1}
            onChange={(num) => {
              let options = value;
              options.settings.tooltip.fontSize = num;
              onChange(options);
            }}
          />
        </InlineField>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};

const getStyles = stylesFactory((theme: GrafanaTheme2) => {
  return {
    inlineField: css`
      flex: 1 0 auto;
    `,
    inlineRow: css`
      flex-flow: column;
    `,
  };
});
