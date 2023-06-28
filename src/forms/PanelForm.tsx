import React from 'react';
import {
  Button,
  ColorPicker,
  InlineField,
  InlineFieldRow,
  InlineLabel,
  InlineSwitch,
  Input,
  Select,
  Slider,
  stylesFactory,
  UnitPicker,
  useTheme2,
} from '@grafana/ui';
import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';
import { FormDivider } from './FormDivider';
import { css } from 'emotion';

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
        <InlineField grow label="Background:" className={styles.inlineField}>
          <React.Fragment></React.Fragment>
        </InlineField>
        <InlineLabel width={'auto'} style={{ marginBottom: '4px', marginLeft: '12px' }}>
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
        <InlineField grow label={'- Image:'} style={{ marginBottom: '4px', marginLeft: '12px' }}>
          {value.settings.panel.backgroundImage ? (
            <Button
              variant="destructive"
              size="md"
              icon="trash-alt"
              onClick={() => {
                if (!confirm('Are you sure you want remove the background image?')) {
                  return;
                }
                let options = value;
                options.settings.panel.backgroundImage = undefined;
                onChange(options);
              }}
              style={{ justifyContent: 'center' }}
            ></Button>
          ) : (
            <Button
              onClick={() => {
                let options = value;
                options.settings.panel.backgroundImage = {
                  url: '',
                  fit: 'contain',
                };
                onChange(options);
              }}
              icon="plus"
              style={{ justifyContent: 'center' }}
            ></Button>
          )}
        </InlineField>
        {value.settings.panel.backgroundImage ? (
          <>
            <InlineField grow label="Image Source" className={styles.inlineField} style={{ marginLeft: '24px' }}>
              <Input
                value={value.settings.panel.backgroundImage.url}
                placeholder={'https://example.com/background.jpg'}
                type={'text'}
                name={'bgImageURL'}
                onChange={(e) => {
                  let options = value;
                  if (options.settings.panel.backgroundImage) {
                    options.settings.panel.backgroundImage.url = e.currentTarget.value;
                  }
                  onChange(options);
                }}
              ></Input>
            </InlineField>
            <InlineField grow label="Image Fit" className={styles.inlineField} style={{ marginLeft: '24px' }}>
              <Select
                onChange={(v) => {
                  let options = value;
                  if (options.settings.panel.backgroundImage) {
                    options.settings.panel.backgroundImage.fit = v.value ? v.value : 'contain';
                  }
                  onChange(options);
                }}
                value={value.settings.panel.backgroundImage.fit}
                options={['contain', 'cover', 'auto'].map((s) => {
                  return { label: s, value: s };
                })}
                placeholder={'Select image fit'}
              ></Select>
            </InlineField>
          </>
        ) : (
          ''
        )}
        <InlineField grow label="Viewbox Width (px)" className={styles.inlineField}>
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
        <InlineField grow label="Viewbox Height (px)" className={styles.inlineField}>
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
        <InlineField grow label="Zoom Scale" className={styles.inlineField}>
          <Input
            value={value.settings.panel.zoomScale}
            placeholder={'Zoom Scale'}
            type={'number'}
            onChange={(e) => {
              let options = value;
              options.settings.panel.zoomScale = e.currentTarget.valueAsNumber;
              onChange(options);
            }}
          ></Input>
        </InlineField>
        <InlineField grow label="View Offset X" className={styles.inlineField}>
          <Input
            value={value.settings.panel.offset.x}
            placeholder={'Offset X'}
            type={'number'}
            onChange={(e) => {
              let options = value;
              options.settings.panel.offset.x = e.currentTarget.valueAsNumber;
              onChange(options);
            }}
          ></Input>
        </InlineField>
        <InlineField grow label="View Offset Y" className={styles.inlineField}>
          <Input
            value={value.settings.panel.offset.y}
            placeholder={'Offset Y'}
            type={'number'}
            onChange={(e) => {
              let options = value;
              options.settings.panel.offset.y = e.currentTarget.valueAsNumber;
              onChange(options);
            }}
          ></Input>
        </InlineField>
        <InlineField grow label={'Display Timestamp'}>
          <InlineSwitch
            value={value.settings.panel.showTimestamp}
            onChange={(e) => {
              let wm = value;
              wm.settings.panel.showTimestamp = e.currentTarget.checked;
              onChange(wm);
            }}
          />
        </InlineField>
        <FormDivider title="Link Options" />
        <InlineField grow label={'Toggle all as Percentage Throughput'}>
          <InlineSwitch
            value={value.settings.link.showAllWithPercentage}
            onChange={(e) => {
              let wm = value;
              wm.settings.link.showAllWithPercentage = e.currentTarget.checked;
              onChange(wm);
            }}
          />
        </InlineField>
        <InlineField grow label={'Default Link Units'}>
          <UnitPicker
            onChange={(val) => {
              let wm = value;
              wm.settings.link.defaultUnits = val;
              onChange(wm);
            }}
            value={value.settings.link.defaultUnits ? value.settings.link.defaultUnits : 'bps'}
          />
        </InlineField>
        <InlineField grow label={'Reset All Links to Default Units'}>
          <Button
            variant="destructive"
            size="md"
            icon="trash-alt"
            onClick={() => {
              if (!confirm('Are you sure you want to reset all link units?')) {
                return;
              }
              let options = value;
              for (let l of options.links) {
                l.units = undefined;
              }
              onChange(options);
            }}
            style={{ justifyContent: 'center' }}
          ></Button>
        </InlineField>

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
        <InlineField grow label="Link Spacing Horizontal" className={styles.inlineField}>
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
        <InlineField grow label="Link Spacing Vertical" className={styles.inlineField}>
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

        <FormDivider title="Grid Options" />
        <InlineFieldRow className={styles.inlineRow}>
          <InlineField grow label="Enable Node Grid Snapping" className={styles.inlineField}>
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
            <InlineField grow label="Grid Size (px)" className={styles.inlineField}>
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
            <InlineField grow label="Grid Guides" className={styles.inlineField}>
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
        <InlineField grow label="Node Font Size" className={styles.inlineField}>
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
        <InlineField grow label="Link Font Size" className={styles.inlineField}>
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
        <FormDivider title="Tootlip Options" />
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
        <InlineField grow label="Tooltip Font Size" className={styles.inlineField}>
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
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Inbound Graph Color:
          <ColorPicker
            color={value.settings.tooltip.inboundColor}
            onChange={(color) => {
              let options = value;
              options.settings.tooltip.inboundColor = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineLabel width="auto" style={{ marginBottom: '4px' }}>
          Outbound Graph Color:
          <ColorPicker
            color={value.settings.tooltip.outboundColor}
            onChange={(color) => {
              let options = value;
              options.settings.tooltip.outboundColor = color;
              onChange(options);
            }}
          />
        </InlineLabel>
        <InlineField grow label="Scale to Include Bandwidth" className={styles.inlineField}>
          <InlineSwitch
            value={value.settings.tooltip.scaleToBandwidth}
            onChange={(e) => {
              let wm = value;
              wm.settings.tooltip.scaleToBandwidth = e.currentTarget.checked;
              onChange(wm);
            }}
          />
        </InlineField>
        <FormDivider title="Scale Options" />
        <InlineField grow label="Scale Title" className={styles.inlineField}>
          <Input
            value={value.settings.scale.title}
            placeholder={'Scale Title'}
            type={'text'}
            name={'scaleTitle'}
            onChange={(e) => {
              let options = value;
              options.settings.scale.title = e.currentTarget.value;
              onChange(options);
            }}
          ></Input>
        </InlineField>
        <InlineField grow label="Scale Width" className={styles.inlineField}>
          <Slider
            min={10}
            max={200}
            value={value.settings.scale.size.width}
            step={1}
            onChange={(num) => {
              let options = value;
              options.settings.scale.size.width = num;
              onChange(options);
            }}
          />
        </InlineField>
        <InlineField grow label="Scale Height" className={styles.inlineField}>
          <Slider
            min={0}
            max={1000}
            value={value.settings.scale.size.height}
            step={10}
            onChange={(num) => {
              let options = value;
              options.settings.scale.size.height = num;
              onChange(options);
            }}
          />
        </InlineField>
        <InlineField grow label="Scale Position X" className={styles.inlineField}>
          <Slider
            min={0}
            max={100}
            value={value.settings.scale.position.x}
            step={1}
            onChange={(num) => {
              let options = value;
              options.settings.scale.position.x = num;
              onChange(options);
            }}
          />
        </InlineField>
        <InlineField grow label="Scale Position Y" className={styles.inlineField}>
          <Slider
            min={0}
            max={100}
            value={value.settings.scale.position.y}
            step={1}
            onChange={(num) => {
              let options = value;
              options.settings.scale.position.y = num;
              onChange(options);
            }}
          />
        </InlineField>
        <InlineField grow label="Title Font Size" className={styles.inlineField}>
          <Slider
            min={2}
            max={40}
            value={value.settings.scale.fontSizing.title}
            step={1}
            onChange={(num) => {
              let options = value;
              options.settings.scale.fontSizing.title = num;
              onChange(options);
            }}
          />
        </InlineField>
        <InlineField grow label="Threshold Font Size" className={styles.inlineField}>
          <Slider
            min={2}
            max={40}
            value={value.settings.scale.fontSizing.threshold}
            step={1}
            onChange={(num) => {
              let options = value;
              options.settings.scale.fontSizing.threshold = num;
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
