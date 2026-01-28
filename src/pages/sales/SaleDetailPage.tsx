// src/pages/sales/SaleDetailPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Tag, Button, Descriptions, Table, 
  Statistic, Space, Modal, message, Alert,
  Divider, Typography, Avatar, Tooltip, Spin, Result
} from 'antd';
import { 
  ArrowLeftOutlined, PrinterOutlined, DownloadOutlined,
  UserOutlined, ShoppingOutlined, CreditCardOutlined,
  PhoneOutlined, MailOutlined, EnvironmentOutlined, 
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined,
  ExclamationCircleOutlined, FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';
import { extractApiData, handleApiError, formatCurrency } from '../../utils/apiHelpers';

const { Title, Text, Paragraph } = Typography;

interface SaleDetail {
  id: number;
  reference: string;
  total_amount: number;
  tax_amount?: number;
  discount_amount?: number;
  status: string;
  payment_method: string;
  payment_reference?: string;
  notes?: string;
  created_at: string;
  client?: {
    id: number;
    name: string;
    telephone: string;
    email?: string;
    address?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items: Array<{
    id: number;
    product?: {
      id: number;
      name: string;
      unit?: string;
    };
    quantity: number;
    unit_price: number;
    subtotal: number;
  }>;
  invoice?: {
    id: number;
    invoice_number: string;
    invoice_date: string;
  };
}

const SaleDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [sale, setSale] = useState<SaleDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSaleDetail(id);
    }
  }, [id]);

  const fetchSaleDetail = async (saleId: string) => {
    setLoading(true);
    try {
      //console.log('[SaleDetail] Fetching sale:', saleId);
      const response = await api.get(`/sales/${saleId}`);
      //console.log('[SaleDetail] Response:', response.data);
      
      // Extraction robuste des données
      const saleData = response.data?.data || response.data;
      
      // Transformation pour correspondre à l'interface
      const transformedSale: SaleDetail = {
        ...saleData,
        items: saleData.details || saleData.items || []
      };
      
      console.log('[SaleDetail] Transformed sale:', transformedSale);
      setSale(transformedSale);
      
    } catch (error: any) {
      //console.error('[SaleDetail] Error:', error);
      const errorMessage = handleApiError(error, 'Erreur chargement détails');
      message.error(errorMessage);
      
      if (error.response?.status === 404) {
        navigate('/sales');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSale = async () => {
    if (!id) return;

    Modal.confirm({
      title: 'Annuler cette vente',
      content: (
        <div>
          <p>Êtes-vous sûr de vouloir annuler cette vente ?</p>
          <Alert
            type="warning"
            message="Attention"
            description="Cette action remettra les produits en stock."
            showIcon
            style={{ marginTop: 16 }}
          />
        </div>
      ),
      okText: 'Oui, annuler',
      okType: 'danger',
      cancelText: 'Non',
      async onOk() {
        try {
          await api.post(`/sales/${id}/cancel`);
          message.success('Vente annulée avec succès');
          fetchSaleDetail(id);
        } catch (error) {
          const errorMessage = handleApiError(error, 'Erreur annulation');
          message.error(errorMessage);
        }
      },
    });
  };

  const handlePrintInvoice = () => {
    if (!sale?.invoice) {
      message.warning('Aucune facture associée');
      return;
    }
    window.print();
  };

  const getStatusConfig = (status: string) => {
    const configs: Record<string, { color: string; icon: JSX.Element; text: string }> = {
      'completed': {
        color: 'success',
        icon: <CheckCircleOutlined />,
        text: 'TERMINÉE'
      },
      'pending': {
        color: 'warning',
        icon: <ClockCircleOutlined />,
        text: 'EN ATTENTE'
      },
      'cancelled': {
        color: 'error',
        icon: <CloseCircleOutlined />,
        text: 'ANNULÉE'
      }
    };
    return configs[status] || { color: 'default', icon: <ExclamationCircleOutlined />, text: status.toUpperCase() };
  };

  const getPaymentMethodConfig = (method: string) => {
    const configs: Record<string, { icon: string | JSX.Element; text: string }> = {
      'cash': { icon: '💵', text: 'Espèces' },
      'card': { icon: <CreditCardOutlined />, text: 'Carte bancaire' },
      'mobile_money': { icon: '📱', text: 'Mobile Money' },
      'credit': { icon: '💳', text: 'Crédit' }
    };
    return configs[method] || { icon: '💰', text: method };
  };

  const columns = [
    {
      title: 'Produit',
      key: 'product',
      render: (_: any, record: any) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            shape="square" 
            size="large"
            style={{ backgroundColor: '#1890ff', marginRight: 12 }}
          >
            {(record.product?.name || 'P').substring(0, 2).toUpperCase()}
          </Avatar>
          <div>
            <div style={{ fontWeight: 500 }}>
              {record.product?.name || 'Produit inconnu'}
            </div>
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              Unité: {record.product?.unit || 'unité'}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Prix unitaire',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => formatCurrency(price || 0),
    },
    {
      title: 'Quantité',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number, record: any) => (
        <Tag color="blue">
          {qty} {record.product?.unit || 'unité'}
        </Tag>
      ),
    },
    {
      title: 'Sous-total',
      dataIndex: 'subtotal',
      key: 'subtotal',
      render: (subtotal: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {formatCurrency(subtotal || 0)}
        </Text>
      ),
    },
  ];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!sale) {
    return (
      <Result
        status="404"
        title="Vente non trouvée"
        subTitle="La vente demandée n'existe pas ou a été supprimée."
        extra={
          <Button type="primary" onClick={() => navigate('/sales')}>
            Retour aux ventes
          </Button>
        }
      />
    );
  }

  const statusConfig = getStatusConfig(sale.status);
  const paymentConfig = getPaymentMethodConfig(sale.payment_method);

  return (
    <div style={{ padding: 24 }}>
      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/sales')}
          style={{ marginBottom: 16 }}
        >
          Retour aux ventes
        </Button>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              Vente {sale.reference}
            </Title>
            <Text type="secondary">
              Créée le {dayjs(sale.created_at).format('DD/MM/YYYY à HH:mm')}
            </Text>
          </div>
          
          <Space>
            <Tag 
              color={statusConfig.color} 
              icon={statusConfig.icon}
              style={{ fontSize: 14, padding: '6px 12px' }}
            >
              {statusConfig.text}
            </Tag>
          </Space>
        </div>
      </div>

      {/* Actions */}
      <Card style={{ marginBottom: 24 }}>
        <Space wrap>
          {sale.status === 'completed' && (
            <>
              <Button 
                type="primary" 
                icon={<PrinterOutlined />}
                onClick={handlePrintInvoice}
              >
                Imprimer
              </Button>
              <Button icon={<DownloadOutlined />}>
                Télécharger PDF
              </Button>
            </>
          )}
          
          {sale.status !== 'cancelled' && (
            <Button 
              danger 
              icon={<CloseCircleOutlined />}
              onClick={handleCancelSale}
            >
              Annuler la vente
            </Button>
          )}
        </Space>
      </Card>

      <Row gutter={24}>
        {/* Colonne gauche */}
        <Col xs={24} lg={16}>
          {/* Informations client */}
          {sale.client && (
            <Card 
              title={<><UserOutlined /> Client</>}
              style={{ marginBottom: 24 }}
            >
              <Descriptions bordered column={2}>
                <Descriptions.Item label="Nom" span={2}>
                  <Space>
                    <Avatar style={{ backgroundColor: '#1890ff' }}>
                      {sale.client.name.substring(0, 2).toUpperCase()}
                    </Avatar>
                    <Text strong>{sale.client.name}</Text>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Téléphone">
                  <Space>
                    <PhoneOutlined />
                    {sale.client.telephone}
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {sale.client.email ? (
                    <Space>
                      <MailOutlined />
                      {sale.client.email}
                    </Space>
                  ) : (
                    <Text type="secondary">Non renseigné</Text>
                  )}
                </Descriptions.Item>
                {sale.client.address && (
                  <Descriptions.Item label="Adresse" span={2}>
                    <Space>
                      <EnvironmentOutlined />
                      {sale.client.address}
                    </Space>
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* Produits */}
          <Card 
            title={<><ShoppingOutlined /> Produits vendus</>}
            extra={
              <Text strong>
                {sale.items.length} produit{sale.items.length > 1 ? 's' : ''}
              </Text>
            }
          >
            <Table
              columns={columns}
              dataSource={sale.items}
              rowKey="id"
              pagination={false}
              summary={(pageData) => {
                const totalQuantity = pageData.reduce((sum, item) => sum + (item.quantity || 0), 0);
                const totalAmount = pageData.reduce((sum, item) => sum + (item.subtotal || 0), 0);
                
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={2}>
                      <Text strong>Total</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={2}>
                      <Text strong>{totalQuantity} unités</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={3}>
                      <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                        {formatCurrency(totalAmount)}
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        </Col>

        {/* Colonne droite */}
        <Col xs={24} lg={8}>
          {/* Récapitulatif financier */}
          <Card title="Récapitulatif financier" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 16 }}>
              <Statistic
                title="Montant total"
                value={sale.total_amount}
                precision={0}
                suffix="FCFA"
                valueStyle={{ color: '#1890ff', fontSize: 24 }}
              />
            </div>

            <Divider />

            <div style={{ marginBottom: 16 }}>
              <div style={{ marginBottom: 8 }}>
                <Text strong>Mode de paiement:</Text>
              </div>
              <Tag color="blue" style={{ fontSize: 14, padding: '6px 12px' }}>
                <Space>
                  {typeof paymentConfig.icon === 'string' 
                    ? <span>{paymentConfig.icon}</span>
                    : paymentConfig.icon
                  }
                  {paymentConfig.text}
                </Space>
              </Tag>
              
              {sale.payment_reference && (
                <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
                  Réf: {sale.payment_reference}
                </div>
              )}
            </div>
          </Card>

          {/* Facture */}
          {sale.invoice && (
            <Card 
              title={<><FileTextOutlined /> Facture</>}
              extra={<Tag color="green">GÉNÉRÉE</Tag>}
              style={{ marginBottom: 24 }}
            >
              <Descriptions column={1}>
                <Descriptions.Item label="Numéro">
                  <Text strong>{sale.invoice.invoice_number}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {dayjs(sale.invoice.invoice_date).format('DD/MM/YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          )}

          {/* Caissier */}
          {sale.user && (
            <Card title="Caissier" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Avatar size="large" style={{ backgroundColor: '#52c41a', marginRight: 12 }}>
                  {sale.user.name.substring(0, 2).toUpperCase()}
                </Avatar>
                <div>
                  <div style={{ fontWeight: 'bold' }}>{sale.user.name}</div>
                  <div style={{ color: '#666', fontSize: 12 }}>
                    {sale.user.email}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Notes */}
          {sale.notes && (
            <Card title="Notes">
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {sale.notes}
              </Paragraph>
            </Card>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default SaleDetailPage;