import { stylesFactory, useTheme2 } from '@grafana/ui';
import { css, cx } from 'emotion';
import React, { useMemo } from 'react';
import { WeathermapSettings } from 'types';

interface ColorScaleProps {
  colors: { [propName: string]: string };
  settings: WeathermapSettings;
}

const ColorScale: React.FC<ColorScaleProps> = (props: ColorScaleProps) => {
  const { colors, settings } = props;
  const styles = getStyles();
  const theme = useTheme2();

  // Calculate the height of a scale's sub-rectangle
  const scaleHeights: { [num: number]: string } = useMemo(() => {
    let c: { [num: number]: string } = {};
    Object.keys(colors).forEach((percent, i) => {
      const keys = Object.keys(colors);
      const current: number = parseInt(keys[i], 10);
      const next: number = keys[i + 1] !== undefined ? parseInt(keys[i + 1], 10) : 101;
      let height: number = ((next - current) / 100) * 200;
      c[i] = height.toString() + 'px';
    });
    return c;
  }, [colors]);

  return (
    <div className={styles.colorScaleContainer}>
      <div
        className={cx(
          styles.colorBoxTitle,
          css`
            color: ${theme.colors.getContrastText(
              settings.panel.backgroundColor.startsWith('image')
                ? settings.panel.backgroundColor.split('|')[1]
                : settings.panel.backgroundColor
            )};
          `
        )}
      >
        Traffic Load
      </div>
      {Object.keys(colors).map((percent, i) => (
        <div className={styles.colorScaleItem} key={i}>
          <span
            className={cx(
              styles.colorBox,
              css`
                background: ${colors[percent]};
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
                    ? settings.panel.backgroundColor.split('|')[1]
                    : settings.panel.backgroundColor
                )};
              `
            )}
          >
            {percent +
              '%' +
              (Object.keys(colors)[i + 1] === undefined
                ? percent === '100'
                  ? ''
                  : ' - 100%'
                : ' - ' + Object.keys(colors)[i + 1] + '%')}
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

export default React.memo(ColorScale);
