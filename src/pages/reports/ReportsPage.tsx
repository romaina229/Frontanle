// src/pages/reports/ReportsPage.tsx - VERSION CORRIGÉE
import React, { useState } from 'react';
import { 
  Card, Select, DatePicker, Button, Table, Row, Col, 
  Statistic, message, Alert, Empty 
} from 'antd';
import { DownloadOutlined, LineChartOutlined } from '@ant-design/icons';
import reportService from '../../services/reportService';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf('month'), 
    dayjs().endOf('month')
  ]);
  const [data, setData] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const reportTypes = [
    { value: 'sales', label: 'Ventes', icon: '📊' },
    { value: 'inventory', label: 'Stock', icon: '📦' },
    { value: 'clients', label: 'Clients', icon: '👥' },
    { value: 'transactions', label: 'Transactions', icon: '💰' },
  ];

  const columns: any = {
    sales: [
      { 
        title: 'Date', 
        dataIndex: 'date',
        render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY') : '—'
      },
      { 
        title: 'Montant', 
        dataIndex: 'montant',
        render: (val: number) => val ? `${new Intl.NumberFormat('fr-FR').format(val)} FCFA` : '0 FCFA'
      },
      { 
        title: 'Nb Ventes', 
        dataIndex: 'count',
        render: (val: number) => val || 0
      },
    ],
    inventory: [
      { title: 'Produit', dataIndex: 'produit' },
      { 
        title: 'Quantité', 
        dataIndex: 'quantite',
        render: (val: number) => val || 0
      },
      { 
        title: 'Valeur', 
        dataIndex: 'valeur',
        render: (val: number) => val ? `${new Intl.NumberFormat('fr-FR').format(val)} FCFA` : '0 FCFA'
      },
    ],
    clients: [
      { title: 'Client', dataIndex: 'nom' },
      { title: 'Email', dataIndex: 'email' },
      { 
        title: 'Total Achats', 
        dataIndex: 'total_achats',
        render: (val: number) => val ? `${new Intl.NumberFormat('fr-FR').format(val)} FCFA` : '0 FCFA'
      },
    ],
    transactions: [
      { title: 'ID Transaction', dataIndex: 'id' },
      { 
        title: 'Date', 
        dataIndex: 'date',
        render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—'
      },
      { 
        title: 'Montant', 
        dataIndex: 'montant',
        render: (val: number) => val ? `${new Intl.NumberFormat('fr-FR').format(val)} FCFA` : '0 FCFA'
      },
    ],
  };

  const generateReport = async () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Veuillez sélectionner une période');
      return;
    }

    setLoading(true);
    
    try {
      const params = {
        start_date: dateRange[0].format('YYYY-MM-DD'),
        end_date: dateRange[1].format('YYYY-MM-DD'),
      };

      console.log('📊 Génération rapport:', reportType, params);

      let response;
      
      // Appeler la méthode appropriée selon le type de rapport
      switch (reportType) {
        case 'sales':
          response = await reportService.getSalesReport(params);
          break;
        case 'inventory':
          response = await reportService.getInventoryReport();
          break;
        case 'clients':
          if (reportService.getClientsReport) {
            response = await reportService.getClientsReport(params);
          } else {
            message.warning('Rapport clients non disponible');
            return;
          }
          break;
        case 'transactions':
          if (reportService.getTransactionsReport) {
            response = await reportService.getTransactionsReport(params);
          } else {
            message.warning('Rapport transactions non disponible');
            return;
          }
          break;
        default:
          response = await reportService.getSalesReport(params);
      }

      console.log('📦 Réponse rapport:', response);
      
      // Extraction robuste des données
      let reportData: any[] = [];
      let reportSummary: any = {};

      if (response?.data) {
        // Cas 1: response.data.data
        if (response.data.data && Array.isArray(response.data.data)) {
          reportData = response.data.data;
        }
        // Cas 2: response.data.results
        else if (response.data.results && Array.isArray(response.data.results)) {
          reportData = response.data.results;
        }
        // Cas 3: response.data direct
        else if (Array.isArray(response.data)) {
          reportData = response.data;
        }
        
        // Extraire le summary
        if (response.data.summary) {
          reportSummary = response.data.summary;
        } else if (response.data.stats) {
          reportSummary = response.data.stats;
        }
      }
      
      console.log(`✅ Rapport généré: ${reportData.length} lignes`);
      setData(reportData);
      setSummary(reportSummary);
      
      if (reportData.length === 0) {
        message.info('Aucune donnée pour cette période');
      } else {
        message.success('Rapport généré avec succès');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur génération rapport:', error);
      console.error('Détails:', error.response?.data);
      
      message.error(
        error.response?.data?.message || 
        'Erreur lors de la génération du rapport'
      );
      setData([]);
      setSummary({});
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Veuillez générer un rapport avant de l\'exporter');
      return;
    }

    const exportUrl = `/api/reports/export?type=${reportType}&start_date=${dateRange[0].format('YYYY-MM-DD')}&end_date=${dateRange[1].format('YYYY-MM-DD')}`;
    
    console.log('📥 Export rapport:', exportUrl);
    window.open(exportUrl, '_blank');
  };

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Rapports</h2>
      
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col xs={24} sm={6}>
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
          <Col xs={24} sm={10}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={(dates) => {
                if (dates && dates[0] && dates[1]) {
                  setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs]);
                }
              }}
              format="DD/MM/YYYY"
              placeholder={['Date début', 'Date fin']}
            />
          </Col>
          <Col xs={24} sm={4}>
            <Button
              type="primary"
              onClick={generateReport}
              icon={<LineChartOutlined />}
              style={{ width: '100%' }}
              loading={loading}
            >
              Générer
            </Button>
          </Col>
          <Col xs={24} sm={4}>
            <Button
              onClick={exportReport}
              icon={<DownloadOutlined />}
              style={{ width: '100%' }}
              disabled={data.length === 0}
            >
              Exporter
            </Button>
          </Col>
        </Row>
      </Card>

      {Object.keys(summary).length > 0 && (
        <Row gutter={16} style={{ marginBottom: 20 }}>
          {Object.entries(summary).map(([key, value]: [string, any]) => (
            <Col xs={24} sm={12} md={6} key={key}>
              <Card>
                <Statistic
                  title={key.replace(/_/g, ' ').toUpperCase()}
                  value={value}
                  precision={0}
                  suffix={key.includes('montant') || key.includes('total') ? 'FCFA' : ''}
                />
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Card>
        {data.length > 0 ? (
          <Table
            columns={columns[reportType] || columns.sales}
            dataSource={data}
            rowKey={(record, index) => record.id || `row-${index}`}
            pagination={{ 
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `${total} ligne${total > 1 ? 's' : ''}`
            }}
            loading={loading}
          />
        ) : (
          <Empty 
            description={
              loading 
                ? "Chargement en cours..." 
                : "Sélectionnez une période et cliquez sur 'Générer' pour afficher le rapport"
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            style={{ padding: '60px 0' }}
          />
        )}
      </Card>
    </div>
  );
};

export default ReportsPage;