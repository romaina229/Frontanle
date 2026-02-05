// src/pages/invoices/InvoicesPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, DatePicker, Select, Row, Col, message } from 'antd';
import { EyeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import api from '../../services/api';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Invoice {
  id: number;
  invoice_number: string;
  invoice_date: string;
  total_amount: number;
  status: string;
  sale?: {
    id: number;
    client?: {
      name: string;
      telephone: string;
    };
  };
}

const InvoicesPage: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: null as [dayjs.Dayjs, dayjs.Dayjs] | null,
    status: '',
  });

  const columns = [
    {
      title: 'N° Facture',
      dataIndex: 'invoice_number',
      render: (invoiceNumber: string) => invoiceNumber || 'N/A',
    },
    {
      title: 'Date',
      dataIndex: 'invoice_date',
      render: (date: string) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : '—',
    },
    {
      title: 'Client',
      render: (_: any, record: Invoice) => (
        <div>
          {record.sale?.client?.name || 'Non renseigné'}
          {record.sale?.client?.telephone && (
            <div style={{ color: '#999', fontSize: '12px' }}>
              📞 {record.sale.client.telephone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Montant',
      dataIndex: 'total_amount',
      render: (amount: number) => (
        <strong>
          {amount ? new Intl.NumberFormat('fr-FR').format(amount) : '0'} FCFA
        </strong>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      render: (status: string) => {
        const colors: any = {
          'draft': 'default',
          'sent': 'blue',
          'paid': 'green',
          'overdue': 'orange',
          'cancelled': 'red',
        };
        return <Tag color={colors[status] || 'default'}>{status || 'draft'}</Tag>;
      },
    },
    {
      title: 'Actions',
      render: (_: any, record: Invoice) => (
        <Row gutter={8}>
          <Col>
            <Button 
              icon={<EyeOutlined />} 
              size="small"
              onClick={() => window.open(`/invoices/${record.id}`, '_blank')}
            />
          </Col>
          <Col>
            <Button 
              icon={<PrinterOutlined />} 
              size="small"
              onClick={() => handlePrintInvoice(record.id)}
            />
          </Col>
          <Col>
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              onClick={() => handleDownloadInvoice(record.id)}
            />
          </Col>
        </Row>
      ),
    },
  ];

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (filters.dateRange) {
        params.date_from = filters.dateRange[0].format('YYYY-MM-DD');
        params.date_to = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      console.log('🔍 Chargement des factures avec params:', params);
      const response = await api.get('/invoices', { params });
      console.log('📦 Réponse factures:', response.data);
      
      // Extraction robuste des données
      let invoicesData: Invoice[] = [];
      
      if (response.data) {
        // Cas 1: response.data.data
        if (response.data.data && Array.isArray(response.data.data)) {
          invoicesData = response.data.data;
          console.log('✅ Format: response.data.data');
        }
        // Cas 2: response.data direct
        else if (Array.isArray(response.data)) {
          invoicesData = response.data;
          console.log('✅ Format: response.data (tableau)');
        }
        // Cas 3: success + data
        else if (response.data.success && Array.isArray(response.data.data)) {
          invoicesData = response.data.data;
          console.log('✅ Format: success + data');
        }
        // Cas 4: Pagination Laravel
        else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          invoicesData = response.data.data.data;
          console.log('✅ Format: pagination Laravel');
        }
        else {
          console.warn('⚠️ Structure non reconnue:', response.data);
        }
      }
      
      console.log(`✅ ${invoicesData.length} factures chargées`);
      setInvoices(invoicesData);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement factures:', error);
      console.error('Détails:', error.response?.data);
      
      message.error(
        error.response?.data?.message || 
        'Erreur lors du chargement des factures'
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (id: number) => {
    try {
      console.log('🖨️ Impression facture:', id);
      const response = await api.get(`/invoices/${id}/print`, {
        responseType: 'blob'
      });
      
      // Vérifier si la réponse contient des données
      const blob = response.data.data || response.data;
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Facture téléchargée');
    } catch (error: any) {
      console.error('❌ Erreur impression:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors du téléchargement de la facture'
      );
    }
  };

  const handleDownloadInvoice = async (id: number) => {
    try {
      console.log('⬇️ Téléchargement facture:', id);
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Facture téléchargée');
    } catch (error: any) {
      console.error('❌ Erreur téléchargement:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors du téléchargement de la facture'
      );
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2>Factures</h2>
      </div>

      {/* Filtres */}
      <Card style={{ marginBottom: 20 }}>
        <Row gutter={16}>
          <Col span={8}>
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Date début', 'Date fin']}
              onChange={(dates) => setFilters({ 
                ...filters, 
                dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] 
              })}
              format="DD/MM/YYYY"
            />
          </Col>
          <Col span={8}>
            <Select
              placeholder="Statut"
              style={{ width: '100%' }}
              onChange={(value) => setFilters({ ...filters, status: value })}
              allowClear
            >
              <Option value="draft">Brouillon</Option>
              <Option value="sent">Envoyée</Option>
              <Option value="paid">Payée</Option>
              <Option value="overdue">En retard</Option>
              <Option value="cancelled">Annulée</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Button 
              type="primary" 
              onClick={fetchInvoices}
              loading={loading}
              block
            >
              Filtrer
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tableau */}
      <Card>
        <Table
          columns={columns}
          dataSource={invoices}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} facture${total > 1 ? 's' : ''}`
          }}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucune facture trouvée'
          }}
        />
      </Card>
    </div>
  );
};

export default InvoicesPage;