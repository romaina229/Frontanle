// src/pages/ReportsPage.tsx
import React, { useState } from 'react';
import { Card, Select, DatePicker, Button, Table, Row, Col, Statistic } from 'antd';
import { DownloadOutlined, LineChartOutlined } from '@ant-design/icons';
import { reportService } from '../../services';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState([dayjs().startOf('month'), dayjs().endOf('month')]);
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState<any>({});

  const reportTypes = [
    { value: 'sales', label: 'Ventes', icon: '📊' },
    { value: 'inventory', label: 'Stock', icon: '📦' },
    { value: 'clients', label: 'Clients', icon: '👥' },
    { value: 'transactions', label: 'Transactions', icon: '💰' },
  ];

  const columns: any = {
    sales: [
      { title: 'Date', dataIndex: 'date' },
      { title: 'Montant', dataIndex: 'montant' },
      { title: 'Nb Ventes', dataIndex: 'count' },
    ],
    inventory: [
      { title: 'Produit', dataIndex: 'produit' },
      { title: 'Quantité', dataIndex: 'quantite' },
      { title: 'Valeur', dataIndex: 'valeur' },
    ],
  };

  const generateReport = async () => {
    try {
      const params = {
        type: reportType,
        date_debut: dateRange[0].format('YYYY-MM-DD'),
        date_fin: dateRange[1].format('YYYY-MM-DD'),
      };
      
      const response = await reportService.generate(params);
      setData(response.data.data);
      setSummary(response.data.summary || {});
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const exportReport = () => {
    // Logique d'export
    window.open(`/api/reports/export?type=${reportType}`, '_blank');
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Rapports</h2>
      
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              value={reportType}
              onChange={setReportType}
              style={{ width: '100%' }}
            >
              {reportTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={12}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
            />
          </Col>
          <Col span={3}>
            <Button
              type="primary"
              onClick={generateReport}
              icon={<LineChartOutlined />}
              style={{ width: '100%' }}
            >
              Générer
            </Button>
          </Col>
          <Col span={3}>
            <Button
              onClick={exportReport}
              icon={<DownloadOutlined />}
              style={{ width: '100%' }}
            >
              Exporter
            </Button>
          </Col>
        </Row>
      </Card>

      {Object.keys(summary).length > 0 && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {Object.entries(summary).map(([key, value]: [string, any]) => (
            <Col span={6} key={key}>
              <Card>
                <Statistic
                  title={key}
                  value={value}
                  precision={0}
                  suffix={key.includes('montant') ? 'FCFA' : ''}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {data.length > 0 && (
        <Card>
          <Table
            columns={columns[reportType] || []}
            dataSource={data}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>
      )}
    </div>
  );
};

export default ReportsPage;