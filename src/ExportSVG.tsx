import React from 'react';
import { InlineFieldRow, Button } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { Weathermap } from 'types';

interface Settings {}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const ExportSVG = ({ value, onChange }: Props) => {
  const handleSVGExport = () => {
    const svg = document.getElementById(`nw-${value.id}`);

    const data = svg?.outerHTML || "";
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';
    const svgBlob = new Blob([preface, data], {type:"image/svg+xml;charset=utf-8"});
    const svgUrl = URL.createObjectURL(svgBlob);
    console.log(svgUrl)
    let downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "network-weathermap.svg";
    downloadLink.target = "_blank"

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  if (value) {
    return (
      <React.Fragment>
        <InlineFieldRow>
            <Button
                onClick={handleSVGExport}
            >
                Export SVG
            </Button>
        </InlineFieldRow>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};
