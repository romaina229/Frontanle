import React from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Typography,
  Divider,
  Space,
  Button,
  Row,
  Col,
  Alert,
  Timeline,
  Statistic,
} from 'antd';
import {
  ArrowLeftOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency, formatDate } from '../../utils/formatters';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;

// Interface pour la transaction
interface Transaction {
  id: string;
  reference: string;
  operator: 'MTN' | 'MOOV' | 'CELTIS' | 'ORANGE';
  amount: number;
  fees: number;
  net_amount: number;
  client_name: string;
  client_phone: string;
  external_reference?: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
  created_by?: {
    id: string;
    name: string;
    email: string;
  };
}

// Mapping des statuts
const statusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  pending: {
    color: 'orange',
    icon: <ClockCircleOutlined />,
    label: 'En attente',
  },
  completed: {
    color: 'green',
    icon: <CheckCircleOutlined />,
    label: 'Complété',
  },
  failed: {
    color: 'red',
    icon: <CloseCircleOutlined />,
    label: 'Échoué',
  },
  cancelled: {
    color: 'gray',
    icon: <ExclamationCircleOutlined />,
    label: 'Annulé',
  },
};

// Mapping des types
const typeConfig: Record<string, { color: string; label: string }> = {
  deposit: {
    color: 'blue',
    label: 'Dépôt',
  },
  withdrawal: {
    color: 'volcano',
    label: 'Retrait',
  },
  payment: {
    color: 'green',
    label: 'Paiement',
  },
  transfer: {
    color: 'purple',
    label: 'Transfert',
  },
};

// Mapping des opérateurs
const operatorConfig: Record<string, { color: string; label: string }> = {
  MTN: {
    color: '#ffcc00',
    label: 'MTN Money',
  },
  MOOV: {
    color: '#00a859',
    label: 'Moov Money',
  },
  CELTIS: {
    color: '#e30613',
    label: 'Celtis Money',
  },
  ORANGE: {
    color: '#ff6600',
    label: 'Orange Money',
  },
};

const TransactionViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [copied, setCopied] = React.useState(false);

  // Fetch transaction data
  const { data: transaction, isLoading, error } = useQuery<Transaction>({
    queryKey: ['transaction', id],
    queryFn: () => api.get(`/mobile-transactions/${id}`).then(res => res.data.data),
    enabled: !!id,
  });

  // Copy reference to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Title level={3}>Chargement...</Title>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div style={{ padding: 50, textAlign: 'center' }}>
        <Alert
          message="Erreur"
          description="Impossible de charger les détails de la transaction."
          type="error"
          showIcon
        />
        <Button
          type="primary"
          onClick={() => navigate('/transactions')}
          style={{ marginTop: 20 }}
        >
          Retour à la liste
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Space align="center" style={{ marginBottom: 16 }}>
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/transactions')}
          >
            Retour
          </Button>
          <Button
            icon={<PrinterOutlined />}
            onClick={() => window.print()}
          >
            Imprimer
          </Button>
          <Button
            icon={<DownloadOutlined />}
          >
            Télécharger
          </Button>
        </Space>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2} style={{ margin: '8px 0' }}>
              Détails de la Transaction
            </Title>
            <Space>
              <Text type="secondary">
                Référence: {transaction.reference}
              </Text>
              <Button
                size="small"
                icon={<CopyOutlined />}
                onClick={() => copyToClipboard(transaction.reference)}
              >
                {copied ? 'Copié!' : 'Copier'}
              </Button>
            </Space>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Tag
              color={statusConfig[transaction.status].color}
              icon={statusConfig[transaction.status].icon}
              style={{ fontSize: 14, padding: '4px 12px' }}
            >
              {statusConfig[transaction.status].label}
            </Tag>
            <div style={{ marginTop: 8 }}>
              <Text type="secondary">
                Créé le: {formatDate(transaction.created_at)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* Left Column - Transaction Details */}
        <Col xs={24} lg={16}>
          <Card title="Informations Générales" style={{ marginBottom: 24 }}>
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
              <Descriptions.Item label="Opérateur" span={1}>
                <Tag color={operatorConfig[transaction.operator].color}>
                  {operatorConfig[transaction.operator].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Type de Transaction" span={1}>
                <Tag color={typeConfig[transaction.type].color}>
                  {typeConfig[transaction.type].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Statut" span={1}>
                <Tag
                  color={statusConfig[transaction.status].color}
                  icon={statusConfig[transaction.status].icon}
                >
                  {statusConfig[transaction.status].label}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Montant Total" span={1}>
                <Text strong>{formatCurrency(transaction.amount)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Frais" span={1}>
                <Text type="secondary">{formatCurrency(transaction.fees)}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Montant Net" span={1}>
                <Text strong type="success">
                  {formatCurrency(transaction.net_amount)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Client Information */}
          <Card title="Informations Client" style={{ marginBottom: 24 }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card size="small" title="Nom du Client">
                  <Space>
                    <UserOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{transaction.client_name}</Text>
                  </Space>
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card size="small" title="Numéro de Téléphone">
                  <Space>
                    <PhoneOutlined style={{ color: '#1890ff' }} />
                    <Text strong>{transaction.client_phone}</Text>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Card>

          {/* Additional Information */}
          <Card title="Informations Supplémentaires">
            {transaction.external_reference && (
              <>
                <Descriptions column={1} style={{ marginBottom: 16 }}>
                  <Descriptions.Item label="Référence Externe">
                    <Space>
                      <BankOutlined style={{ color: '#1890ff' }} />
                      <Text strong>{transaction.external_reference}</Text>
                    </Space>
                  </Descriptions.Item>
                </Descriptions>
                <Divider />
              </>
            )}

            {transaction.notes && (
              <>
                <Title level={5}>Notes:</Title>
                <Paragraph style={{ 
                  backgroundColor: '#fafafa', 
                  padding: 16, 
                  borderRadius: 6,
                  whiteSpace: 'pre-wrap'
                }}>
                  {transaction.notes}
                </Paragraph>
              </>
            )}

            {!transaction.notes && (
              <Text type="secondary">Aucune note supplémentaire</Text>
            )}
          </Card>
        </Col>

        {/* Right Column - Summary and Actions */}
        <Col xs={24} lg={8}>
          {/* Amount Summary */}
          <Card title="Résumé Financier" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Statistic
                title="Montant Total"
                value={transaction.amount}
                prefix={<DollarOutlined />}
                suffix="FCFA"
                valueStyle={{ color: '#3f8600' }}
              />
              <Divider style={{ margin: '12px 0' }} />
              <div style={{ textAlign: 'center' }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Détails des montants
                </Text>
                <div style={{ 
                  padding: 16, 
                  backgroundColor: '#f6ffed', 
                  borderRadius: 6,
                  marginTop: 8 
                }}>
                  <Row gutter={[8, 8]}>
                    <Col span={12}>
                      <Text>Montant:</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text strong>{formatCurrency(transaction.amount)}</Text>
                    </Col>
                    <Col span={12}>
                      <Text>Frais:</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text strong>- {formatCurrency(transaction.fees)}</Text>
                    </Col>
                    <Divider style={{ margin: '8px 0' }} />
                    <Col span={12}>
                      <Text strong>Net:</Text>
                    </Col>
                    <Col span={12} style={{ textAlign: 'right' }}>
                      <Text strong type="success">
                        {formatCurrency(transaction.net_amount)}
                      </Text>
                    </Col>
                  </Row>
                </div>
              </div>
            </Space>
          </Card>

          {/* Audit Trail */}
          <Card title="Journal d'Activité">
            <Timeline>
              <Timeline.Item
                color="green"
                dot={<CheckCircleOutlined />}
              >
                <Space direction="vertical" size={2}>
                  <Text strong>Transaction créée</Text>
                  <Text type="secondary">{formatDate(transaction.created_at)}</Text>
                  {transaction.created_by && (
                    <Text type="secondary">
                      Par: {transaction.created_by.name}
                    </Text>
                  )}
                </Space>
              </Timeline.Item>
              <Timeline.Item
                color="blue"
                dot={<ClockCircleOutlined />}
              >
                <Space direction="vertical" size={2}>
                  <Text strong>Dernière mise à jour</Text>
                  <Text type="secondary">{formatDate(transaction.updated_at)}</Text>
                </Space>
              </Timeline.Item>
            </Timeline>
          </Card>

          {/* Actions */}
          <Card title="Actions" style={{ marginTop: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="primary"
                block
                onClick={() => navigate(`/transactions/${transaction.id}/edit`)}
              >
                Modifier la Transaction
              </Button>
              {transaction.status === 'pending' && (
                <>
                  <Button
                    type="default"
                    block
                    onClick={() => {
                      // Implement complete transaction
                      console.log('Complete transaction:', transaction.id);
                    }}
                  >
                    Marquer comme Complété
                  </Button>
                  <Button
                    danger
                    block
                    onClick={() => {
                      // Implement cancel transaction
                      console.log('Cancel transaction:', transaction.id);
                    }}
                  >
                    Annuler la Transaction
                  </Button>
                </>
              )}
              <Button
                type="dashed"
                block
                onClick={() => navigate('/transactions')}
              >
                Retour à la Liste
              </Button>
            </Space>
          </Card>

          {/* Alert */}
          {transaction.status === 'pending' && (
            <Alert
              message="Transaction en attente"
              description="Cette transaction nécessite une action de votre part."
              type="warning"
              showIcon
              style={{ marginTop: 24 }}
            />
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TransactionViewPage;