// src/pages/invoices/InvoicesPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Tag, DatePicker, Select, Row, Col, message } from 'antd';
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
    console.log('👁️ Affichage détails facture:', id);
    navigate(`/invoices/${id}`);
  };

  // Imprimer la facture
  const handlePrintInvoice = async (id: number) => {
    try {
      console.log('🖨️ Impression facture:', id);
      message.loading({ content: 'Préparation de l\'impression...', key: 'print' });
      
      const response = await api.get(`/invoices/${id}/print`, {
        responseType: 'blob'
      });
      
      // Vérifier si la réponse contient des données
      let blobData;
      if (response.data && response.data.data) {
        blobData = response.data.data;
      } else {
        blobData = response.data;
      }
      
      // Vérifier si nous avons des données blob valides
      if (!blobData || blobData.size === 0) {
        throw new Error('Aucune donnée PDF reçue');
      }
      
      // Créer un blob
      const blob = new Blob([blobData], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      
      // Créer un iframe pour l'impression
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
      
      iframe.onload = () => {
        try {
          iframe.contentWindow?.print();
          message.success({ content: 'Impression lancée', key: 'print' });
        } catch (e) {
          console.warn('Impression échouée, ouverture PDF:', e);
          // Si l'impression échoue, ouvrir le PDF
          window.open(url, '_blank');
        }
        
        // Nettoyage après 1 seconde
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          window.URL.revokeObjectURL(url);
        }, 1000);
      };
      
      iframe.src = url;
      
    } catch (error: any) {
      console.error('❌ Erreur impression:', error);
      
      // Solution de secours : redirection vers une page d'impression
      const fallbackUrl = `/invoices/${id}/print`;
      const newWindow = window.open(fallbackUrl, '_blank');
      
      if (!newWindow) {
        message.error({ 
          content: 'Popup bloqué. Veuillez autoriser les popups pour cette page.',
          key: 'print'
        });
      } else {
        message.info({ 
          content: 'Redirection vers la page d\'impression',
          key: 'print'
        });
      }
    }
  };

  // Télécharger la facture - Version améliorée
  const handleDownloadInvoice = async (id: number) => {
    try {
      console.log('⬇️ Téléchargement facture:', id);
      message.loading({ content: 'Téléchargement en cours...', key: 'download' });
      
      const response = await api.get(`/invoices/${id}/download`, {
        responseType: 'blob'
      });
      
      // Extraction du nom de fichier depuis les headers ou création d'un nom par défaut
      const contentDisposition = response.headers['content-disposition'];
      let filename = `facture-${id}.pdf`;
      
      if (contentDisposition) {
        const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
        if (matches && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
      
      // Créer le blob
      const blobData = response.data.data || response.data;
      if (!blobData || blobData.size === 0) {
        throw new Error('Aucune donnée PDF reçue');
      }
      
      const blob = new Blob(
        [blobData], 
        { type: response.headers['content-type'] || 'application/pdf' }
      );
      
      // Télécharger
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Nettoyage
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      message.success({ 
        content: `Facture téléchargée : ${filename}`, 
        key: 'download' 
      });
      
    } catch (error: any) {
      console.error('❌ Erreur téléchargement:', error);
      
      // Tentative de secours avec une URL directe
      const fallbackUrl = `/api/invoices/${id}/download`;
      const link = document.createElement('a');
      link.href = fallbackUrl;
      link.download = `facture-${id}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      message.warning({ 
        content: 'Tentative de téléchargement direct',
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