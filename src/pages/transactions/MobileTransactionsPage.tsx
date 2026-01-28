import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Input,
  Select,
  DatePicker,
  Tag,
  Space,
  Modal,
  message,
  Tooltip,
  Badge,
  Row,
  Col,
  Statistic
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilterOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

import api from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';

const { RangePicker } = DatePicker;
const { Option } = Select;

interface Transaction {
  id: number;
  reference: string;
  operator: 'MTN' | 'MOOV' | 'CELTIS' | 'ORANGE';
  amount: number;
  client_name: string;
  client_phone: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer';
  external_reference?: string;
  notes?: string;
  created_at: string;
  user: {
    name: string;
  };
}

const MobileTransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useState({
    search: '',
    operator: '',
    status: '',
    type: '',
    date_from: '',
    date_to: ''
  });
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // Fetch transactions
  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', searchParams],
    queryFn: () =>
      api.get('/mobile-transactions', { params: searchParams }).then(res => res.data.data),
    placeholderData: (previousData) => previousData,
  });

  // Fetch statistics
  const { data: statistics } = useQuery({
    queryKey: ['transactions-statistics'],
    queryFn: () =>
    api.get('/mobile-transactions/statistics/summary').then(res => res.data.data),
  });


  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/mobile-transactions/${id}`),
    onSuccess: () => {
      message.success('Transaction supprimée avec succès');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setDeleteModalVisible(false);
    },
    onError: () => {
      message.error('Erreur lors de la suppression');
    },
  });


  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.post(`/mobile-transactions/${id}/status`, { status }),
    onSuccess: () => {
      message.success('Statut mis à jour avec succès');
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
    onError: () => {
      message.error('Erreur lors de la mise à jour');
    },
  });


  const handleSearch = (key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value }));
  };

  const handleDelete = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDeleteModalVisible(true);
  };

  const confirmDelete = () => {
    if (selectedTransaction) {
      deleteMutation.mutate(selectedTransaction.id);
    }
  };

  const handleStatusChange = (id: number, status: string) => {
    Modal.confirm({
      title: 'Changer le statut',
      content: `Voulez-vous vraiment marquer cette transaction comme ${status} ?`,
      onOk: () => updateStatusMutation.mutate({ id, status })
    });
  };

  const exportToExcel = () => {
    message.info('Export en cours...');
    // Implement export logic here
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string) => (
        <span style={{ fontWeight: 500, color: '#1890ff' }}>
          {text}
        </span>
      ),
    },
    {
      title: 'Opérateur',
      dataIndex: 'operator',
      key: 'operator',
      render: (operator: string) => {
        const colors: any = {
          MTN: { bg: '#ffcc00', text: '#000' },
          MOOV: { bg: '#00a859', text: '#fff' },
          CELTIS: { bg: '#e30613', text: '#fff' },
          ORANGE: { bg: '#ff6600', text: '#fff' }
        };
        const color = colors[operator] || { bg: '#d9d9d9', text: '#000' };
        return (
          <Tag
            style={{
              backgroundColor: color.bg,
              color: color.text,
              border: 'none',
              fontWeight: 'bold',
              minWidth: 80,
              textAlign: 'center'
            }}
          >
            {operator}
          </Tag>
        );
      },
    },
    {
      title: 'Montant',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => formatCurrency(amount),
      sorter: (a: Transaction, b: Transaction) => a.amount - b.amount,
    },
    {
      title: 'Client',
      key: 'client',
      render: (_: any, record: Transaction) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.client_name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{record.client_phone}</div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeLabels: any = {
          deposit: 'Dépôt',
          withdrawal: 'Retrait',
          payment: 'Paiement',
          transfer: 'Transfert'
        };
        return typeLabels[type] || type;
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusConfig: any = {
          pending: { 
            color: 'warning', 
            icon: <ClockCircleOutlined />, 
            text: 'En attente' 
          },
          completed: { 
            color: 'success', 
            icon: <CheckCircleOutlined />, 
            text: 'Complété' 
          },
          failed: { 
            color: 'error', 
            icon: <CloseCircleOutlined />, 
            text: 'Échoué' 
          },
          cancelled: { 
            color: 'default', 
            icon: <CloseCircleOutlined />, 
            text: 'Annulé' 
          }
        };
        const config = statusConfig[status] || { color: 'default', text: status };
        return (
          <Tag icon={config.icon} color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date, 'dd/MM/yyyy HH:mm'),
      sorter: (a: Transaction, b: Transaction) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Transaction) => (
        <Space size="small">
          <Tooltip title="Voir détails">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/transactions/${record.id}/view`)}
            />
          </Tooltip>
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/transactions/${record.id}/edit`)}
            />
          </Tooltip>
          <Tooltip title="Supprimer">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Transactions Mobile Money</h1>
        <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
          Gestion des transactions mobiles (MTN, Moov, Celtis, Orange Money)
        </p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Transactions"
              value={statistics?.total_transactions || 0}
              prefix={<FilterOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Montant Total"
              value={statistics?.total_amount || 0}
              prefix="FCFA"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Taux de Réussite"
              value={statistics?.success_rate || 0}
              suffix="%"
              precision={1}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="En Attente"
              value={statistics?.pending_count || 0}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Input
              placeholder="Rechercher..."
              prefix={<SearchOutlined />}
              value={searchParams.search}
              onChange={e => handleSearch('search', e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Opérateur"
              style={{ width: '100%' }}
              value={searchParams.operator || undefined}
              onChange={value => handleSearch('operator', value)}
              allowClear
            >
              <Option value="MTN">MTN</Option>
              <Option value="MOOV">Moov</Option>
              <Option value="CELTIS">Celtis</Option>
              <Option value="ORANGE">Orange</Option>
            </Select>
          </Col>
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Statut"
              style={{ width: '100%' }}
              value={searchParams.status || undefined}
              onChange={value => handleSearch('status', value)}
              allowClear
            >
              <Option value="pending">En attente</Option>
              <Option value="completed">Complété</Option>
              <Option value="failed">Échoué</Option>
              <Option value="cancelled">Annulé</Option>
            </Select>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={(dates, dateStrings) => {
                handleSearch('date_from', dateStrings[0]);
                handleSearch('date_to', dateStrings[1]);
              }}
            />
          </Col>
          <Col xs={24} sm={12} md={2}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setSearchParams({
                search: '',
                operator: '',
                status: '',
                type: '',
                date_from: '',
                date_to: ''
              })}
              style={{ width: '100%' }}
            >
              Réinitialiser
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: 16 
      }}>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/transactions/new')}
            style={{ marginRight: 8 }}
          >
            Nouvelle Transaction
          </Button>
          <Button
            icon={<DownloadOutlined />}
            onClick={exportToExcel}
            disabled={selectedRowKeys.length === 0}
          >
            Exporter ({selectedRowKeys.length})
          </Button>
        </div>
        <div>
          <Badge
            count={transactionsData?.total || 0}
            showZero
            style={{ backgroundColor: '#1890ff' }}
          />
          <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
            transactions trouvées
          </span>
        </div>
      </div>

      {/* Transactions Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={transactionsData?.data || []}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total: transactionsData?.total || 0,
            pageSize: transactionsData?.per_page || 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} transactions`
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Delete Modal */}
      <Modal
        title="Confirmer la suppression"
        open={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={() => setDeleteModalVisible(false)}
        confirmLoading={deleteMutation.isPending}
        okText="Supprimer"
        okType="danger"
        cancelText="Annuler"
      >
        <p>Êtes-vous sûr de vouloir supprimer la transaction {selectedTransaction?.reference} ?</p>
        <p style={{ color: '#ff4d4f' }}>
          Cette action est irréversible. Toutes les données associées seront supprimées.
        </p>
      </Modal>
    </div>
  );
};

export default MobileTransactionsPage;