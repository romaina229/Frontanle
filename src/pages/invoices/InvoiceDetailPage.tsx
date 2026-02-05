// src/pages/invoices/InvoiceDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Tag, Button, Descriptions, Spin, 
  message, Timeline, Space, Divider, Statistic, Alert 
} from 'antd';
import { 
  ArrowLeftOutlined, PrinterOutlined, DownloadOutlined, 
  EditOutlined, ShareAltOutlined, FilePdfOutlined,
  CheckCircleOutlined, ClockCircleOutlined, DollarOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';

const InvoiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchInvoiceDetails();
    }
  }, [id]);

  const fetchInvoiceDetails = async () => {
    setLoading(true);
    try {
      console.log('🔍 Chargement détails facture:', id);
      
      // Charger la facture
      const response = await api.get(`/invoices/${id}`);
      const invoiceData = response.data.data || response.data;
      
      setInvoice(invoiceData);
      
      // Charger les articles si disponible
      if (invoiceData.items) {
        setItems(invoiceData.items);
      } else {
        // Sinon, charger séparément
        try {
          const itemsResponse = await api.get(`/invoices/${id}/items`);
          setItems(itemsResponse.data.data || itemsResponse.data || []);
        } catch (err) {
          console.warn('Articles non disponibles');
        }
      }
      
      // Charger l'historique des paiements
      try {
        const paymentsResponse = await api.get(`/invoices/${id}/payments`);
        setPaymentHistory(paymentsResponse.data.data || paymentsResponse.data || []);
      } catch (err) {
        console.warn('Historique des paiements non disponible');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur chargement détails:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors du chargement des détails de la facture'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      'draft': { color: 'default', label: 'Brouillon', icon: <ClockCircleOutlined /> },
      'sent': { color: 'blue', label: 'Envoyée', icon: <ClockCircleOutlined /> },
      'paid': { color: 'green', label: 'Payée', icon: <CheckCircleOutlined /> },
      'overdue': { color: 'orange', label: 'En retard', icon: <ClockCircleOutlined /> },
      'cancelled': { color: 'red', label: 'Annulée', icon: <ClockCircleOutlined /> },
    };
    return configs[status] || { color: 'default', label: status };
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => 
      sum + (item.quantity * item.unit_price), 0
    );
    const tax = invoice?.tax_amount || 0;
    const discount = invoice?.discount_amount || 0;
    const total = subtotal + tax - discount;
    
    return { subtotal, tax, discount, total };
  };

  const handlePrint = () => {
    window.open(`/invoices/${id}/print`, '_blank');
  };

  const handleDownload = () => {
    window.open(`/invoices/${id}/download`, '_blank');
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '50vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <Alert
        message="Facture introuvable"
        description="La facture demandée n'existe pas ou vous n'avez pas les permissions nécessaires."
        type="error"
        action={
          <Button type="primary" onClick={() => navigate('/invoices')}>
            Retour aux factures
          </Button>
        }
      />
    );
  }

  const statusConfig = getStatusConfig(invoice.status);
  const totals = calculateTotals();

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto' }}>
      {/* En-tête */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/invoices')}
          >
            Retour aux factures
          </Button>
        </Col>
        <Col>
          <Space>
            <Tag color={statusConfig.color} icon={statusConfig.icon}>
              {statusConfig.label}
            </Tag>
            <Button icon={<EditOutlined />}>Modifier</Button>
            <Button icon={<PrinterOutlined />} onClick={handlePrint}>
              Imprimer
            </Button>
            <Button 
              icon={<DownloadOutlined />} 
              type="primary"
              onClick={handleDownload}
            >
              Télécharger PDF
            </Button>
          </Space>
        </Col>
      </Row>

      <Row gutter={24}>
        {/* Colonne gauche - Informations principales */}
        <Col span={16}>
          <Card title={`Facture ${invoice.invoice_number}`} style={{ marginBottom: 24 }}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Date de facturation" span={2}>
                {dayjs(invoice.invoice_date).format('DD/MM/YYYY HH:mm')}
              </Descriptions.Item>
              <Descriptions.Item label="Date d'échéance">
                {invoice.due_date ? dayjs(invoice.due_date).format('DD/MM/YYYY') : 'Non définie'}
              </Descriptions.Item>
              <Descriptions.Item label="Termes de paiement">
                {invoice.payment_terms || 'À réception'}
              </Descriptions.Item>
              
              {invoice.sale && (
                <>
                  <Descriptions.Item label="Vente associée" span={2}>
                    <Tag color="blue">Vente #{invoice.sale.id}</Tag>
                    {invoice.sale.client && (
                      <div style={{ marginTop: 8 }}>
                        <strong>Client:</strong> {invoice.sale.client.name}
                        <br />
                        <strong>Téléphone:</strong> {invoice.sale.client.telephone}
                      </div>
                    )}
                  </Descriptions.Item>
                </>
              )}
              
              <Descriptions.Item label="Notes" span={2}>
                {invoice.notes || 'Aucune note'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Articles de la facture */}
          <Card title="Articles">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Quantité</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Prix unitaire</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>
                      <div><strong>{item.name || item.description}</strong></div>
                      {item.description && item.description !== item.name && (
                        <div style={{ color: '#666', fontSize: '12px' }}>
                          {item.description}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {item.quantity}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      {new Intl.NumberFormat('fr-FR').format(item.unit_price)} FCFA
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <strong>
                        {new Intl.NumberFormat('fr-FR').format(
                          item.quantity * item.unit_price
                        )} FCFA
                      </strong>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totaux */}
            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Row justify="end">
                <Col span={8}>
                  <div style={{ padding: '8px 0' }}>
                    <span style={{ marginRight: 16 }}>Sous-total:</span>
                    <span>{new Intl.NumberFormat('fr-FR').format(totals.subtotal)} FCFA</span>
                  </div>
                  {totals.tax > 0 && (
                    <div style={{ padding: '8px 0' }}>
                      <span style={{ marginRight: 16 }}>Taxe:</span>
                      <span>+ {new Intl.NumberFormat('fr-FR').format(totals.tax)} FCFA</span>
                    </div>
                  )}
                  {totals.discount > 0 && (
                    <div style={{ padding: '8px 0' }}>
                      <span style={{ marginRight: 16 }}>Remise:</span>
                      <span>- {new Intl.NumberFormat('fr-FR').format(totals.discount)} FCFA</span>
                    </div>
                  )}
                  <Divider style={{ margin: '12px 0' }} />
                  <div style={{ padding: '8px 0', fontSize: '18px', fontWeight: 'bold' }}>
                    <span style={{ marginRight: 16 }}>Total:</span>
                    <span style={{ color: '#52c41a' }}>
                      {new Intl.NumberFormat('fr-FR').format(totals.total)} FCFA
                    </span>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Colonne droite - Informations supplémentaires */}
        <Col span={8}>
          {/* Montant et statut */}
          <Card style={{ marginBottom: 24 }}>
            <Statistic
              title="Montant total"
              value={invoice.total_amount || totals.total}
              suffix="FCFA"
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: 16 }}>
              <div style={{ color: '#999', fontSize: 12 }}>Montant payé</div>
              <div style={{ fontSize: 24, fontWeight: 'bold' }}>
                {new Intl.NumberFormat('fr-FR').format(invoice.paid_amount || 0)} FCFA
              </div>
            </div>
            <div style={{ marginTop: 8 }}>
              <div style={{ color: '#999', fontSize: 12 }}>Solde dû</div>
              <div style={{ fontSize: 20, fontWeight: 'bold', color: totals.total - (invoice.paid_amount || 0) > 0 ? '#faad14' : '#52c41a' }}>
                {new Intl.NumberFormat('fr-FR').format(
                  totals.total - (invoice.paid_amount || 0)
                )} FCFA
              </div>
            </div>
          </Card>

          {/* Historique des paiements */}
          {paymentHistory.length > 0 && (
            <Card title="Historique des paiements" style={{ marginBottom: 24 }}>
              <Timeline>
                {paymentHistory.map((payment, index) => (
                  <Timeline.Item
                    key={index}
                    color="green"
                    dot={<DollarOutlined />}
                  >
                    <div>
                      <strong>{new Intl.NumberFormat('fr-FR').format(payment.amount)} FCFA</strong>
                      <div style={{ fontSize: 12, color: '#999' }}>
                        {dayjs(payment.payment_date).format('DD/MM/YYYY HH:mm')}
                      </div>
                      {payment.method && (
                        <Tag color="blue" style={{ marginTop: 4 }}>
                          {payment.method}
                        </Tag>
                      )}
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          )}

          {/* Actions rapides */}
          <Card title="Actions">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                block 
                icon={<FilePdfOutlined />}
                onClick={handleDownload}
              >
                Télécharger PDF
              </Button>
              <Button 
                block 
                icon={<PrinterOutlined />}
                onClick={handlePrint}
              >
                Imprimer
              </Button>
              <Button 
                block 
                icon={<ShareAltOutlined />}
              >
                Partager
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default InvoiceDetailPage;