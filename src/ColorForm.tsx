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

  const handleNumberChange = (e: any, currentIndex: number) => {
    let weathermap: Weathermap = value;
    weathermap.scale[currentIndex].percent = e.currentTarget.valueAsNumber;
    weathermap.scale.sort((a, b) => a.percent - b.percent);
    onChange(weathermap);
    setEditedPercents(weathermap.scale);
  };

  const handleColorChange = (color: any, index: number) => {
    let weathermap: Weathermap = value;
    weathermap.scale[index].color = color;
    onChange(weathermap);
    setEditedPercents(weathermap.scale);
  };

  const addNewValue = () => {
    let weathermap: Weathermap = value;
    if (value.scale.length === 0) {
      weathermap.scale.push({
        percent: 0,
        color: '#ffffff',
      });
    } else {
      weathermap.scale.push({
        percent: weathermap.scale[weathermap.scale.length - 1].percent + 10,
        color: '#ffffff',
      });
    }
    onChange(weathermap);
    setEditedPercents(weathermap.scale);
  };

  const clearValues = () => {
    let weathermap: Weathermap = value;
    weathermap.scale = [];
    onChange(weathermap);
    setEditedPercents(weathermap.scale);
  };

  const handleDeletePercent = (currentIndex: number) => {
    let weathermap: Weathermap = value;
    weathermap.scale.splice(currentIndex, 1);
    onChange(weathermap);
    setEditedPercents(weathermap.scale);
  };

  const [editedPercents, setEditedPercents] = useState(value.scale);

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
      {editedPercents.map((threshold, i) => (
        <Input
          className={styles.item}
          type="number"
          step="0.0001"
          key={i}
          onChange={(e) => {
            setEditedPercents((prev) => {
              let t = prev;
              t[i].percent = e.currentTarget.valueAsNumber;
              return t;
            });
            onChange(value);
          }}
          value={editedPercents[i].percent}
          aria-label={`Weathermap Threshold ${threshold.percent}`}
          onBlur={(e) => handleNumberChange(e, i)}
          prefix={
            <div className={styles.inputPrefix}>
              <div className={styles.colorPicker}>
                <ColorPicker color={threshold.color} onChange={(color) => handleColorChange(color, i)} />
              </div>
            </div>
          }
          suffix={<Icon className={styles.trashIcon} name="trash-alt" onClick={() => handleDeletePercent(i)} />}
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
