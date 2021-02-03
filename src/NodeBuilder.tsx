import React, {useEffect} from 'react';
import { StandardEditorProps } from '@grafana/data';
import {Weathermap} from 'types';
import {NodeForm} from './NodeForm'

interface Settings {
    placeholder: string;
}

interface Props extends StandardEditorProps<Weathermap, Settings> {};

export const NodeBuilder = (props: Props) => {

    // const theme = useTheme();
    // const styles = getStyles();

    useEffect(() => {
    })

    return(
        <React.Fragment>
            <NodeForm {...props}></NodeForm>
        </React.Fragment>
    )
}

// const getStyles = stylesFactory(() => {
//     return {
//       nodeLabel: css`
//         margin: 0px 0px;
//       `,
//       addNew: css`
//         width: 100%;
//         justify-content: center;
//         margin: 10px 0px 0px;
//       `,
//       nodeSelect: css`
//         margin: 5px 0px;
//       `
//     };
//   });