import React from 'react';
import { css } from 'emotion';
import { stylesFactory } from '@grafana/ui';
import { Button, Input, InlineField, InlineFieldRow} from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import {Weathermap} from 'types';

interface Settings {
    placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {};

export const ColorForm = ({ value, onChange }: Props) => {

    // const  = props;
    // const theme = useTheme();
    const styles = getStyles();

    const handleChange = (e: any, key: number) => {
        let weathermap: Weathermap = value;
        let prev: string = weathermap.SCALE[key];
        delete weathermap.SCALE[key];
        weathermap.SCALE[parseInt(e.currentTarget.value)] = prev;
        onChange(weathermap);
    }

    // const editValue = (e: any, key: number) => {
    //     let weathermap: Weathermap = value;
    //     weathermap.SCALE[key] = e.currentTarget.value;
    //     onChange(weathermap);
    // }

    const addNewValue = () => {
        let weathermap: Weathermap = value;
        if (Object.keys(value.SCALE).length == 0) {
            weathermap.SCALE[0] = "#ffffff"
        } else {
            weathermap.SCALE[parseInt(Object.keys(value.SCALE)[Object.keys(value.SCALE).length - 1]) + 1] = "#ffffff";
        }
        
        onChange(weathermap);
    }

    const clearValues = () => {
        let weathermap: Weathermap = value;
        weathermap.SCALE = {};
        onChange(weathermap);
    }

    // const [currentNode, setCurrentNode] = useState('null');

    return(
        <React.Fragment>
            {Object.keys(value.SCALE).map((percent) => (
                    <InlineFieldRow>
                        <InlineField label="%">
                        <Input
                            value={percent}
                            onChange={e => handleChange(e, parseInt(percent))}
                            placeholder={'Percent Load'}
                            type={"number"}
                            css={""}
                            className={styles.nodeLabel}
                            name={"percent"}
                        ></Input>
                        </InlineField>
                    </InlineFieldRow>
            ))}
            
            
            <Button
                variant="secondary"
                icon="plus"
                size="md"
                onClick={addNewValue}
                className={styles.addNew}
            >
                Add Scale Value
            </Button>
            <Button
                variant="secondary"
                icon="trash-alt"
                size="md"
                onClick={clearValues}
                className={styles.clearAll}
            >
                Clear All
            </Button>
        </React.Fragment>
    )
}

const getStyles = stylesFactory(() => {
    return {
      nodeLabel: css`
        margin: 0px 0px;
      `,
      addNew: css`
        width: 100%;
        justify-content: center;
        margin: 10px 0px 0px;
      `,
      clearAll: css`
        width: 100%;
        justify-content: center;
        margin: 10px 0px;
      `,
      nodeSelect: css`
        margin: 5px 0px;
      `
    };
  });