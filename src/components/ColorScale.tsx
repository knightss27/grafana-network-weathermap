import { stylesFactory, useTheme2 } from '@grafana/ui';
import { css, cx } from 'emotion';
import React from 'react';
import { Threshold, WeathermapSettings } from 'types';

interface ColorScaleProps {
  thresholds: Threshold[];
  settings: WeathermapSettings;
}

// TODO: Fix auto-updating to scale that happens before we've had onBlur called on the ColorForm.
const ColorScale: React.FC<ColorScaleProps> = (props: ColorScaleProps) => {
  const { thresholds, settings } = props;
  const styles = getStyles();
  const theme = useTheme2();

  // Calculate the height of a scale's sub-rectangle
  const scaleHeights: { [num: number]: string } = {};

  if (settings.scale) {
    // Double check scale existence, since sometimes it doesn't before we get here.

    thresholds.forEach((threshold, i) => {
      const current: number = threshold.percent;
      const next: number = thresholds[i + 1] !== undefined ? thresholds[i + 1].percent : 101;
      let height: number = ((next - current) / 100) * settings.scale.size.height;
      scaleHeights[i] = height.toString() + 'px';
    });
  }

  if (settings.scale && settings.scale.fontSizing) {
    return (
      <div className={styles.colorScaleContainer}>
        <div
          className={cx(
            styles.colorBoxTitle,
            css`
              font-size: ${settings.scale.fontSizing.title}px;
              color: ${theme.colors.getContrastText(
                settings.panel.backgroundColor.startsWith('image')
                  ? settings.panel.backgroundColor.split('|', 3)[1]
                  : settings.panel.backgroundColor
              )};
            `
          )}
        >
          {settings.scale.title}
        </div>
        {thresholds.map((threshold, i) => (
          <div className={styles.colorScaleItem} key={i}>
            <span
              className={cx(
                styles.colorBox,
                css`
                  background: ${threshold.color};
                  height: ${scaleHeights[i]};
                  width: ${settings.scale.size.width}px;
                `
              )}
            ></span>
            <span
              className={cx(
                styles.colorLabel,
                css`
                  font-size: ${settings.scale.fontSizing.threshold}px;
                  color: ${theme.colors.getContrastText(
                    settings.panel.backgroundColor.startsWith('image')
                      ? settings.panel.backgroundColor.split('|', 3)[1]
                      : settings.panel.backgroundColor
                  )};
                `
              )}
            >
              {threshold.percent +
                '%' +
                (thresholds[i + 1] === undefined
                  ? threshold.percent >= 100
                    ? ''
                    : ' - 100%'
                  : ' - ' + thresholds[i + 1].percent + '%')}
            </span>
          </div>
        ))}
      </div>
    );
  } else {
    return <React.Fragment />;
  }
};

const getStyles = stylesFactory(() => {
  return {
    colorScaleContainer: css`
      position: relative;
      bottom: 0;
      left: 0;
      padding: 10px;
      display: flex;
      flex-direction: column;
      color: black;
      z-index: 2;
      width: fit-content;
    `,
    colorBoxTitle: css`
      font-weight: bold;
      padding: 5px 0px;
    `,
    colorScaleItem: css`
      display: flex;
      align-items: center;
    `,
    colorBox: css`
      margin-right: 5px;
    `,
    colorLabel: css`
      line-height: 0px;
    `,
  };
});

export default ColorScale;
