// src/components/dashboard/StatCard.tsx
import React from 'react';
import { Card, Statistic, Typography, Space, Spin } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface StatCardProps {
  title: string;
  value: number | string;
  prefix?: string;
  suffix?: string;
  icon?: React.ReactNode;
  color?: string;
  trend?: number;
  loading?: boolean;
  error?: boolean;
  height?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  prefix,
  suffix,
  icon,
  color = '#1890ff',
  trend,
  loading = false,
  error = false,
  height = 120
}) => {
  const formattedValue = typeof value === 'number' 
    ? value.toLocaleString('fr-FR', { maximumFractionDigits: 0 })
    : value;

  return (
    <Card 
      style={{ 
        height: height,
        borderLeft: `4px solid ${color}`,
        borderRadius: 8 
      }}
      bodyStyle={{ padding: '16px', height: '100%' }}
    >
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
          <Spin size="small" />
        </div>
      ) : error ? (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <Text type="secondary">{title}</Text>
          <Text type="danger" style={{ fontSize: 24, fontWeight: 600 }}>
            Erreur
          </Text>
        </div>
      ) : (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Text type="secondary" style={{ fontSize: 14 }}>{title}</Text>
            <div style={{ 
              width: 32, 
              height: 32, 
              borderRadius: 8, 
              backgroundColor: `${color}15`,
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              color: color
            }}>
              {icon}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: 28, fontWeight: 600, color: color, lineHeight: 1.2 }}>
              {prefix && <span style={{ fontSize: 16, marginRight: 2 }}>{prefix}</span>}
              {formattedValue}
              {suffix && <span style={{ fontSize: 14, marginLeft: 2 }}>{suffix}</span>}
            </div>
            
            {trend !== undefined && (
              <div style={{ marginTop: 8, fontSize: 12, display: 'flex', alignItems: 'center' }}>
                {trend > 0 ? (
                  <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                ) : (
                  <ArrowDownOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                )}
                <Text style={{ color: trend > 0 ? '#52c41a' : '#ff4d4f' }}>
                  {Math.abs(trend)}%
                </Text>
                <Text type="secondary" style={{ marginLeft: 4 }}>
                  vs mois dernier
                </Text>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StatCard;