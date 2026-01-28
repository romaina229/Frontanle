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
      render: (invoiceNumber: string) => invoiceNumber,
    },
    {
      title: 'Date',
      dataIndex: 'invoice_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
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
        <strong>{new Intl.NumberFormat('fr-FR').format(amount)} FCFA</strong>
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
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
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
  }, [filters]);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = {};
      
      if (filters.dateRange) {
        params.date_from = filters.dateRange[0].format('YYYY-MM-DD');
        params.date_fin = filters.dateRange[1].format('YYYY-MM-DD');
      }
      
      if (filters.status) {
        params.status = filters.status;
      }
      
      const response = await api.get('/invoices', { params });
      const data = response.data.data || response.data;
      // S'assurer que c'est bien un tableau
      setInvoices(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur:', error);
      message.error('Erreur lors du chargement des factures');
      setInvoices([]); // Initialiser avec un tableau vide en cas d'erreur
    } finally {
      setLoading(false);
    }
  };

  const handlePrintInvoice = async (id: number) => {
    try {
      const response = await api.get(`/invoices/${id}/print`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      message.error('Erreur lors du téléchargement de la facture');
    }
  };

  const handleDownloadInvoice = async (id: number) => {
    try {
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
    } catch (error) {
      message.error('Erreur lors du téléchargement de la facture');
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
              onChange={(dates) => setFilters({ ...filters, dateRange: dates as [dayjs.Dayjs, dayjs.Dayjs] })}
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
            <Button type="primary" onClick={fetchInvoices}>
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
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  );
};

export default InvoicesPage;