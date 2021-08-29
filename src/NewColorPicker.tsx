import React from 'react';
import { ColorPicker, InlineLabel } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';

interface Settings {
    
}

interface Props extends StandardEditorProps<string, Settings> {};

export const NewColorPicker = ({ value, onChange }: Props) => {

    const handleColorChange = (color: string) => {
        console.log("changing to: " + color);
        onChange(color);
    }

    return(
        <React.Fragment>
            <InlineLabel width="auto">
            <ColorPicker 
                color={value}
                onChange={handleColorChange}
            />
            </InlineLabel>
            
        </React.Fragment>
    )
}