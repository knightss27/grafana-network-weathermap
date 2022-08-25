import React from 'react';

interface Props {
  title: string;
}

export const FormDivider = ({ title }: Props) => {
  return (
    <h6
      style={{
        padding: '10px 0px 5px 5px',
        marginTop: '10px',
        borderTop: '1px solid var(--in-content-button-background)',
      }}
    >
      {title}
    </h6>
  );
};
