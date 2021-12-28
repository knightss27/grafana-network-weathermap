import React, { useState } from 'react';
import { css } from 'emotion';
import { Button, Input, stylesFactory, ColorPicker, Icon, useTheme2 } from '@grafana/ui';
import { GrafanaTheme2, StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const ColorForm = (props: Props) => {
  const theme = useTheme2();
  const styles = getStyles(theme);

  const { value, onChange } = props;

  const handleNumberChange = (e: any, key: number) => {
    let weathermap: Weathermap = value;
    let prev: string = weathermap.scale[key];
    delete weathermap.scale[key];
    weathermap.scale[parseInt(e.currentTarget.value, 10)] = prev;
    onChange(weathermap);
    setEditedPercents(Object.keys(value.scale).map((i) => parseInt(i, 10)));
  };

  const handleColorChange = (color: any, key: number) => {
    let weathermap: Weathermap = value;
    weathermap.scale[key] = color;
    onChange(weathermap);
  };

  const addNewValue = () => {
    let weathermap: Weathermap = value;
    if (Object.keys(value.scale).length === 0) {
      weathermap.scale[0] = '#ffffff';
    } else {
      weathermap.scale[parseInt(Object.keys(value.scale)[Object.keys(value.scale).length - 1], 10) + 10] = '#ffffff';
    }
    onChange(weathermap);
    setEditedPercents(Object.keys(value.scale).map((i) => parseInt(i, 10)));
  };

  const clearValues = () => {
    let weathermap: Weathermap = value;
    weathermap.scale = {};
    onChange(weathermap);
    setEditedPercents(Object.keys(value.scale).map((i) => parseInt(i, 10)));
  };

  const handleDeletePercent = (key: number) => {
    let weathermap: Weathermap = value;
    delete weathermap.scale[key];
    onChange(weathermap);
  };

  // const [editedColor, setEditedColor] = useState('');
  const [editedPercents, setEditedPercents] = useState(Object.keys(value.scale).map((i) => parseInt(i, 10)));

  return (
    <React.Fragment>
      <h6
        style={{
          padding: '10px 0px 5px 5px',
          marginTop: '10px',
          borderTop: '1px solid var(--in-content-button-background)',
        }}
      >
        Color Scale
      </h6>
      {Object.keys(value.scale).map((percent, i) => (
        <Input
          className={styles.item}
          type="number"
          step="0.0001"
          key={i}
          onChange={(e) => {
            setEditedPercents((prev) => {
              let t = prev;
              t[i] = e.currentTarget.valueAsNumber;
              return t;
            });
            onChange(value);
          }}
          value={editedPercents[i]}
          aria-label={`Weathermap Threshold ${percent}`}
          onBlur={(e) => handleNumberChange(e, parseInt(percent, 10))}
          prefix={
            <div className={styles.inputPrefix}>
              <div className={styles.colorPicker}>
                <ColorPicker
                  color={value.scale[parseInt(percent, 10)]}
                  onChange={(color) => handleColorChange(color, parseInt(percent, 10))}
                />
              </div>
            </div>
          }
          suffix={
            <Icon
              className={styles.trashIcon}
              name="trash-alt"
              onClick={() => handleDeletePercent(parseInt(percent, 10))}
            />
          }
        />
      ))}

      <Button variant="secondary" icon="plus" size="md" onClick={addNewValue} className={styles.addNew}>
        Add Scale Value
      </Button>
      <Button variant="secondary" icon="trash-alt" size="md" onClick={clearValues} className={styles.clearAll}>
        Clear All
      </Button>
    </React.Fragment>
  );
};

const getStyles = stylesFactory((theme: GrafanaTheme2) => {
  return {
    nodeLabel: css`
      margin: 0px 0px;
    `,
    addNew: css`
      width: calc(50% - 10px);
      justify-content: center;
      margin: 10px 0px;
      margin-right: 5px;
    `,
    clearAll: css`
      width: calc(50% - 10px);
      justify-content: center;
      margin: 10px 0px;
      margin-left: 5px;
    `,
    nodeSelect: css`
      margin: 5px 0px;
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    colorPicker: css`
      padding: 0 ${theme.spacing(1)};
    `,
    trashIcon: css`
      color: ${theme.colors.text.secondary};
      cursor: pointer;
      &:hover {
        color: ${theme.colors.text.primary};
      }
    `,
    item: css`
      margin-bottom: ${theme.spacing(1)};
      &:last-child {
        margin-bottom: 0;
      }
    `,
  };
});
