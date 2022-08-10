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

  thresholds.forEach((threshold, i) => {
    const current: number = threshold.percent;
    const next: number = thresholds[i + 1] !== undefined ? thresholds[i + 1].percent : 101;
    let height: number = ((next - current) / 100) * 200;
    scaleHeights[i] = height.toString() + 'px';
  });

  return (
    <div className={styles.colorScaleContainer}>
      <div
        className={cx(
          styles.colorBoxTitle,
          css`
            color: ${theme.colors.getContrastText(
              settings.panel.backgroundColor.startsWith('image')
                ? settings.panel.backgroundColor.split('|', 3)[1]
                : settings.panel.backgroundColor
            )};
          `
        )}
      >
        Traffic Load
      </div>
      {thresholds.map((threshold, i) => (
        <div className={styles.colorScaleItem} key={i}>
          <span
            className={cx(
              styles.colorBox,
              css`
                background: ${threshold.color};
                height: ${scaleHeights[i]};
              `
            )}
          ></span>
          <span
            className={cx(
              styles.colorLabel,
              css`
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
      width: 200px;
    `,
    colorBoxTitle: css`
      font-size: 16px;
      font-weight: bold;
      padding: 5px 0px;
    `,
    colorScaleItem: css`
      display: flex;
      align-items: center;
    `,
    colorBox: css`
      width: 50px;
      margin-right: 5px;
    `,
    colorLabel: css`
      line-height: 0px;
      font-size: 12px;
    `,
  };
});

export default ColorScale;
