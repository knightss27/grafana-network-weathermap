import React, { useState } from 'react';
import { css } from 'emotion';
import { Button, Input, InlineField, InlineFieldRow, stylesFactory } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';

interface Settings {
  placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const ColorForm = (props: Props) => {
  // const  = props;
  // const theme = useTheme();
  const styles = getStyles();

  const { value, onChange } = props;

  const handleNumberChange = (e: any, key: number) => {
    let weathermap: Weathermap = value;
    let prev: string = weathermap.scale[key];
    delete weathermap.scale[key];
    weathermap.scale[parseInt(e.currentTarget.value, 10)] = prev;
    onChange(weathermap);
    setEditedPercents(Object.keys(value.scale).map((i) => parseInt(i, 10)));
  };

  const handleColorChange = (e: any, key: number) => {
    let weathermap: Weathermap = value;
    weathermap.scale[key] = e.currentTarget.value;
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
        <InlineFieldRow key={i}>
          <InlineField label="%">
            <Input
              id={`nw-input-${percent}`}
              value={editedPercents[i]}
              placeholder={'Percent Load'}
              type={'number'}
              className={styles.nodeLabel}
              name={'percent'}
              onChange={(e) => {
                setEditedPercents((prev) => {
                  let t = prev;
                  t[i] = e.currentTarget.valueAsNumber;
                  return t;
                });
                // TODO: find a way to not force an update to the panel here
                onChange(value);
              }}
              onBlur={(e) => handleNumberChange(e, parseInt(percent, 10))}
            ></Input>
          </InlineField>
          <InlineField label="Color">
            <Input
              value={value.scale[parseInt(percent, 10)]}
              onChange={(e) => handleColorChange(e, parseInt(percent, 10))}
              placeholder={'Percent Color'}
              type={'string'}
              className={styles.nodeLabel}
              name={'color'}
            ></Input>
          </InlineField>
          <Button icon="trash-alt" variant="destructive" onClick={(e) => handleDeletePercent(parseInt(percent, 10))} />
        </InlineFieldRow>
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

const getStyles = stylesFactory(() => {
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
  };
});
