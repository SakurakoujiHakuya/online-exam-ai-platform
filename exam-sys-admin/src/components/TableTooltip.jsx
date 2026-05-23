import React from 'react';
import { Tooltip } from 'antd';

/**
 * A reusable component for table cells that need ellipsis and a tooltip on hover.
 */
const TableTooltip = ({ text, maxWidth = 600 }) => {
  if (!text) return <span>-</span>;

  return (
    <Tooltip title={text} placement="topLeft">
      <div style={{
        maxWidth: maxWidth,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        cursor: 'pointer'
      }}>
        {text}
      </div>
    </Tooltip>
  );
};

export default TableTooltip;
