// src/components/dashboard/StatCard.tsx
import React from 'react';
import { Card } from 'antd';
import { IconType } from 'react-icons';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
  prefix?: string;
  suffix?: string;
  trend?: number;
  loading?: boolean;  // ← AJOUTER
  error?: boolean;    // ← AJOUTER
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, prefix, suffix,trend, loading = false, 
  error = false }) => {
  return (
    <Card
      style={{
        textAlign: 'center',
        borderLeft: `5px solid ${color || '#1890ff'}`,
      }}
    >
      <div style={{ fontSize: 24, marginBottom: 10 }}>
        {icon}
      </div>
      <h3 style={{ marginBottom: 5 }}>{title}</h3>
      <p style={{ fontSize: 20, fontWeight: 'bold' }}>{value}</p>
    </Card>
  );
};

export default StatCard;
