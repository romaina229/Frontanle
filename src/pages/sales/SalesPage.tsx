// src/pages/sales/SalesPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Space,
  Row, Col, message, DatePicker, Statistic, Tooltip,
  Popconfirm, Badge
} from 'antd';
import {
  PlusOutlined, EyeOutlined, DeleteOutlined,
  DollarOutlined, ShoppingCartOutlined,
  UserOutlined, CalendarOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { extractApiData, handleApiError, formatCurrency, formatDateTime, extractStatsData } from '../../utils/apiHelpers';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;

interface Sale {
  id: number;
  reference: string;
  total_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    name: string;
    telephone: string;
  };
  items?: Array<{
    product: {
      name: string;
    };
    quantity: number;
  }>;
}

interface Stats {
  total_sales: number;
  total_revenue: number;
  avg_ticket: number;
}

const SalesPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_sales: 0,
    total_revenue: 0,
    avg_ticket: 0
  });
  
  const [searchParams, setSearchParams] = useState({
    search: '',
    status: '',
    payment_method: '',
    date_from: '',
    date_to: '',
    page: 1,
    per_page: 15
  });

  useEffect(() => {
    fetchSales();
    fetchStats();
  }, [searchParams]);

  const fetchSales = async () => {
    setLoading(true);
    try {
      const params = { ...searchParams };
      const response = await api.get('/sales', { params });
      //console.log('[Sales] API Response:', response.data);
      
      // Extraction robuste des données
      const salesData = extractApiData<Sale>(response);
      //console.log(`[Sales] Loaded: ${salesData.length} items`);
      
      setSales(Array.isArray(salesData) ? salesData : []);
      
    } catch (error: any) {
      //console.error('[Sales] Fetch error:', error);
      const errorMessage = handleApiError(error, 'Erreur chargement ventes');
      message.error(errorMessage);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/sales/statistics/summary', {
        params: { period: 'today' }
      });
      //console.log('[Sales] Stats Response:', response.data);
      
      // Extraction des statistiques
      const statsData = extractStatsData(response);
      //console.log('[Sales] Stats extracted:', statsData);
      
      setStats({
        total_sales: statsData.total_sales || 0,
        total_revenue: statsData.total_revenue || 0,
        avg_ticket: statsData.avg_ticket || 0
      });
      
    } catch (error: any) {
      //console.error('[Sales] Stats error:', error);
      // Ne pas afficher d'erreur pour les stats
      setStats({ total_sales: 0, total_revenue: 0, avg_ticket: 0 });
    }
  };

  const handleSearch = (key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDateRangeChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setSearchParams(prev => ({
        ...prev,
        date_from: dates[0].format('YYYY-MM-DD'),
        date_to: dates[1].format('YYYY-MM-DD'),
        page: 1
      }));
    } else {
      setSearchParams(prev => ({
        ...prev,
        date_from: '',
        date_to: '',
        page: 1
      }));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.post(`/sales/${id}/cancel`);
      message.success('Vente annulée avec succès');
      fetchSales();
      fetchStats();
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Erreur annulation vente');
      message.error(errorMessage);
    }
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'completed': { text: 'Complétée', color: 'success' },
      'pending': { text: 'En attente', color: 'warning' },
      'cancelled': { text: 'Annulée', color: 'error' }
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  const formatPaymentMethod = (method: string) => {
    const methodMap: Record<string, string> = {
      'cash': 'Espèces',
      'mobile_money': 'Mobile Money',
      'card': 'Carte',
      'credit': 'Crédit'
    };
    return methodMap[method] || method;
  };

  const columns = [
    {
      title: 'Référence',
      dataIndex: 'reference',
      key: 'reference',
      render: (text: string, record: Sale) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff', cursor: 'pointer' }}
               onClick={() => navigate(`/sales/${record.id}`)}>
            {text || `#${record.id}`}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {formatDateTime(record.created_at)}
          </div>
        </div>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client',
      key: 'client',
      render: (client: any) => (
        <div>
          <div>{client?.name || 'Client anonyme'}</div>
          {client?.telephone && (
            <div style={{ fontSize: 12, color: '#8c8c8c' }}>
              {client.telephone}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Montant',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => (
        <span style={{ fontWeight: 500, color: '#52c41a' }}>
          {formatCurrency(amount || 0)}
        </span>
      ),
    },
    {
      title: 'Paiement',
      dataIndex: 'payment_method',
      key: 'payment_method',
      render: (method: string) => formatPaymentMethod(method),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const { text, color } = formatStatus(status);
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Sale) => (
        <Space size="small">
          <Tooltip title="Voir détails">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/sales/${record.id}`)}
            />
          </Tooltip>
          
          {record.status !== 'cancelled' && (
            <Tooltip title="Annuler">
              <Popconfirm
                title="Annuler la vente"
                description="Êtes-vous sûr ? Le stock sera restauré."
                onConfirm={() => handleDelete(record.id)}
                okText="Annuler la vente"
                cancelText="Retour"
                okType="danger"
              >
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Gestion des Ventes</h1>
        <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
          Gérez vos transactions et consultez les statistiques
        </p>
      </div>

      {/* Statistiques */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ventes aujourd'hui"
              value={stats.total_sales}
              prefix={<ShoppingCartOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chiffre d'affaires"
              value={stats.total_revenue}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix="FCFA"
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Ticket moyen"
              value={stats.avg_ticket}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="FCFA"
            />
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Rechercher..."
              value={searchParams.search}
              onChange={e => handleSearch('search', e.target.value)}
              onSearch={() => fetchSales()}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Statut"
              style={{ width: '100%' }}
              value={searchParams.status || undefined}
              onChange={value => handleSearch('status', value)}
              allowClear
            >
              <Option value="completed">Complétée</Option>
              <Option value="pending">En attente</Option>
              <Option value="cancelled">Annulée</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Paiement"
              style={{ width: '100%' }}
              value={searchParams.payment_method || undefined}
              onChange={value => handleSearch('payment_method', value)}
              allowClear
            >
              <Option value="cash">Espèces</Option>
              <Option value="mobile_money">Mobile Money</Option>
              <Option value="card">Carte</Option>
              <Option value="credit">Crédit</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={6}>
            <RangePicker
              style={{ width: '100%' }}
              onChange={handleDateRangeChange}
              format="DD/MM/YYYY"
            />
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchParams({
                  search: '',
                  status: '',
                  payment_method: '',
                  date_from: '',
                  date_to: '',
                  page: 1,
                  per_page: 15
                });
              }}
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/sales/new')}
        >
          Nouvelle Vente
        </Button>
        
        <div>
          <Badge
            count={sales.length}
            showZero
            style={{ backgroundColor: '#1890ff' }}
          />
          <span style={{ marginLeft: 8, color: '#8c8c8c' }}>
            ventes trouvées
          </span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={Array.isArray(sales) ? sales : []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.per_page,
            total: sales.length,
            showSizeChanger: true,
            showTotal: (total) => `${total} ventes`,
            onChange: (page, pageSize) => {
              handleSearch('page', page);
              handleSearch('per_page', pageSize);
            }
          }}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucune vente trouvée'
          }}
        />
      </Card>
    </div>
  );
};

export default SalesPage;