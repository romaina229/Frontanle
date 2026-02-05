// src/pages/invoices/InvoicesPage.tsx - VERSION FINALE CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, DatePicker, Select, Row, Col, message, Modal } from 'antd';
import { EyeOutlined, PrinterOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
      render: (invoiceNumber: string) => (
        <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
          {invoiceNumber || 'N/A'}
        </span>
      ),
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
          <div style={{ fontWeight: 500 }}>
            {record.sale?.client?.name || 'Non renseigné'}
          </div>
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
        <strong style={{ color: '#52c41a' }}>
          {amount ? new Intl.NumberFormat('fr-FR').format(amount) : '0'} FCFA
        </strong>
      ),
      align: 'right' as const,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      render: (status: string) => {
        const configs: any = {
          'draft': { color: 'default', label: 'Brouillon' },
          'sent': { color: 'blue', label: 'Envoyée' },
          'paid': { color: 'green', label: 'Payée' },
          'overdue': { color: 'orange', label: 'En retard' },
          'cancelled': { color: 'red', label: 'Annulée' },
        };
        const config = configs[status] || { color: 'default', label: status || 'draft' };
        return <Tag color={config.color}>{config.label}</Tag>;
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
              title="Voir les détails"
              onClick={() => handleViewInvoice(record.id)}
            />
          </Col>
          <Col>
            <Button 
              icon={<PrinterOutlined />} 
              size="small"
              title="Imprimer"
              onClick={() => handlePrintInvoice(record.id)}
            />
          </Col>
          <Col>
            <Button 
              icon={<DownloadOutlined />} 
              size="small"
              title="Télécharger PDF"
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
        if (response.data.data && Array.isArray(response.data.data)) {
          invoicesData = response.data.data;
        } else if (Array.isArray(response.data)) {
          invoicesData = response.data;
        } else if (response.data.success && Array.isArray(response.data.data)) {
          invoicesData = response.data.data;
        } else if (response.data.data && response.data.data.data && Array.isArray(response.data.data.data)) {
          invoicesData = response.data.data.data;
        }
      }
      
      console.log(`✅ ${invoicesData.length} factures chargées`);
      setInvoices(invoicesData);
      
    } catch (error: any) {
      console.error('❌ Erreur chargement factures:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors du chargement des factures'
      );
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  // Voir les détails de la facture
  const handleViewInvoice = (id: number) => {
    console.log('👁️ Affichage facture:', id);
    
    // Option 1: Ouvrir dans un modal
    Modal.info({
      title: `Facture #${id}`,
      content: (
        <div style={{ padding: '20px 0' }}>
          <p>Les détails de la facture seront affichés ici.</p>
          {/*<p>Vous pouvez créer une page de détails ou afficher dans un modal.</p>*/}
        </div>
      ),
      width: 800,
      okText: 'Fermer'
    });

    // Option 2: Naviguer vers une page de détails (si elle existe)
    // navigate(`/invoices/${id}`);
    
    // Option 3: Ouvrir dans un nouvel onglet
    // window.open(`/invoices/${id}`, '_blank');
  };

  // Imprimer la facture
  const handlePrintInvoice = async (id: number) => {
    try {
      console.log('🖨️ Impression facture:', id);
      message.loading({ content: 'Préparation de l\'impression...', key: 'print' });
      
      const response = await api.get(`/invoices/${id}/print`, {
        responseType: 'blob'
      });
      
      // Créer un blob depuis la réponse
      const blob = response.data.data || response.data;
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      
      // Ouvrir dans une nouvelle fenêtre pour impression
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
        message.success({ content: 'Fenêtre d\'impression ouverte', key: 'print' });
      } else {
        // Si le popup est bloqué, télécharger le fichier
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `facture-${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        message.success({ content: 'Facture téléchargée', key: 'print' });
      }
      
      // Nettoyer l'URL
      setTimeout(() => window.URL.revokeObjectURL(url), 100);
      
    } catch (error: any) {
      console.error('❌ Erreur impression:', error);
      message.error({ 
        content: error.response?.data?.message || 'Erreur lors de l\'impression',
        key: 'print'
      });
    }
  };

  // Télécharger la facture
  const handleDownloadInvoice = async (id: number) => {
    try {
      console.log('⬇️ Téléchargement facture:', id);
      message.loading({ content: 'Téléchargement en cours...', key: 'download' });
      
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob'
      });
      
      // Créer un blob et un lien de téléchargement
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Nettoyer l'URL
      window.URL.revokeObjectURL(url);
      
      message.success({ content: 'Facture téléchargée avec succès', key: 'download' });
      
    } catch (error: any) {
      console.error('❌ Erreur téléchargement:', error);
      message.error({ 
        content: error.response?.data?.message || 'Erreur lors du téléchargement',
        key: 'download'
      });
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
          <Col xs={24} sm={8}>
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
          <Col xs={24} sm={8}>
            <Select
              placeholder="Filtrer par statut"
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
          <Col xs={24} sm={8}>
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
            showTotal: (total) => `${total} facture${total > 1 ? 's' : ''}`,
            pageSizeOptions: ['10', '20', '50']
          }}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucune facture trouvée'
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default InvoicesPage;