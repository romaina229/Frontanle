// src/components/common/Tag.tsx
import React from 'react';
import { Tag as AntTag } from 'antd';

interface TagProps {
  color?: string;
  children: React.ReactNode;
}

const Tag: React.FC<TagProps> = ({ color, children }) => {
  return (
    <AntTag color={color} style={{ borderRadius: 4 }}>
      {children}
    </AntTag>
  );
};

export default Tag;