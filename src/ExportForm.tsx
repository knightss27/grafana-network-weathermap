import React from 'react';
import { InlineFieldRow, Button } from '@grafana/ui';
import { StandardEditorProps } from '@grafana/data';
import { Link, Weathermap } from 'types';

interface Settings {}

interface Props extends StandardEditorProps<Weathermap, Settings> {}

export const ExportForm = ({ value, onChange }: Props) => {
  const generateDownloadLink = (href: string, download: string) => {
    let downloadLink = document.createElement('a');
    downloadLink.href = href;
    downloadLink.download = download;
    downloadLink.target = '_blank';

    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const handleSVGExport = async () => {
    const svg = document.getElementById(`nw-${value.id}`);

    let data = svg!.outerHTML || '';
    const preface = '<?xml version="1.0" standalone="no"?>\r\n';

    const icons = svg!.getElementsByTagName('image')
    for (let i = 0; i < icons.length; i++) {
      const iconURL = document.location.origin + "/" + icons[i].href.baseVal;
      const iconData = await fetch(iconURL);
      const iconString = await iconData.text();
      const base64String = "data:image/svg+xml;base64," + window.btoa(iconString);

      data = data.replace(icons[i].href.baseVal, base64String);
    }

    const svgBlob = new Blob([preface, data], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    generateDownloadLink(svgUrl, `network-weathermap-${new Date().toISOString()}.svg`);
  };

  const handleJSONExport = () => {
    let weathermap: any = value;
    weathermap.links = value.links.map((link: Link) => {
      return [link.nodes[0].id, link.nodes[1].id];
    });

    const data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(weathermap));
    generateDownloadLink(data, 'network-weathermap.json');
  };

  if (value) {
    return (
      <React.Fragment>
        <InlineFieldRow>
          <Button onClick={handleSVGExport} style={{ marginRight: '10px' }}>
            Export SVG
          </Button>
          <Button onClick={handleJSONExport}>Export JSON</Button>
        </InlineFieldRow>
      </React.Fragment>
    );
  } else {
    return <React.Fragment />;
  }
};
