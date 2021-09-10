import React, { useEffect } from 'react';
import { css } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { Button, Input, InlineField, InlineFieldRow } from '@grafana/ui';
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

  let prevFocused = 0;

  const handleNumberChange = (e: any, key: number) => {
    console.log('setting focused')
    prevFocused = parseInt(e.currentTarget.value);

    let weathermap: Weathermap = value;
    let prev: string = weathermap.scale[key];
    delete weathermap.scale[key];
    weathermap.scale[parseInt(e.currentTarget.value)] = prev;
    onChange(weathermap);
    setFocus();
  };

  const handleColorChange = (e: any, key: number) => {
    let weathermap: Weathermap = value;
    weathermap.scale[key] = e.currentTarget.value;
    onChange(weathermap);
  };

  const addNewValue = () => {
    let weathermap: Weathermap = value;
    if (Object.keys(value.scale).length == 0) {
      weathermap.scale[0] = '#ffffff';
    } else {
      weathermap.scale[parseInt(Object.keys(value.scale)[Object.keys(value.scale).length - 1]) + 1] = '#ffffff';
    }
    console.log(weathermap.scale);
    onChange(weathermap);
  };

  const clearValues = () => {
    let weathermap: Weathermap = value;
    weathermap.scale = {};
    onChange(weathermap);
  };

  const setFocus = () => {
    console.log(prevFocused)
    const selected = document.getElementById(`nw-input-${prevFocused}`);
    console.log(selected)
    selected?.focus();
    console.log('focusing on ' + prevFocused)
  }

  // const [editedColor, setEditedColor] = useState('');
  // const [editedPercents, setEditedPercents] = useState(Object.keys(value.scale).map(i => parseInt(i)));

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
        <InlineFieldRow>
          <InlineField label="%">
            <Input
              id={`nw-input-${percent}`}
              value={parseInt(percent)}
              placeholder={'Percent Load'}
              type={'number'}
              css={''}
              className={styles.nodeLabel}
              name={'percent'}
              onChange={(e) => handleNumberChange(e, parseInt(percent))}
              // onBlur={(e) => handleNumberChange(e, parseInt(percent))}
            ></Input>
          </InlineField>
          <InlineField label="Color">
            <Input
              value={value.scale[parseInt(percent)]}
              onChange={(e) => handleColorChange(e, parseInt(percent))}
              // onBlur={(e) => handleColorChange(e, parseInt(percent))}
              placeholder={'Percent Color'}
              type={'string'}
              css={''}
              className={styles.nodeLabel}
              name={'color'}
            ></Input>
          </InlineField>
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
