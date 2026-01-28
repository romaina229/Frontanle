// src/pages/suppliers/SuppliersPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Tag, Card, Space, Statistic, 
  Row, Col, message, Typography, Empty, Spin, Rate
} from 'antd';
import { 
  PlusOutlined, PhoneOutlined, MailOutlined, 
  UserOutlined, EnvironmentOutlined, ShopOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { extractApiData, handleApiError } from '../../utils/apiHelpers';

const { Title, Text } = Typography;
const { Search } = Input;

interface Supplier {
  id: number;
  name: string;
  contact_person?: string;
  telephone?: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;
  type_produits?: string;
  delai_livraison?: number;
  conditions_paiement?: string;
  evaluation?: number;
  actif: boolean;
  notes?: string;
  created_at?: string;
}

const SuppliersPage: React.FC = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Fournisseur',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string, record: Supplier) => (
        <div>
          <div 
            style={{ fontWeight: 600, fontSize: 14, cursor: 'pointer', color: '#1890ff' }}
            onClick={() => navigate(`/suppliers/${record.id}/edit`)}
          >
            {text}
          </div>
          {record.contact_person && (
            <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
              <UserOutlined style={{ marginRight: 4 }} />
              {record.contact_person}
            </div>
          )}
          {record.type_produits && (
            <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
              {record.type_produits.length > 35 
                ? `${record.type_produits.substring(0, 35)}...` 
                : record.type_produits}
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Contacts',
      key: 'contacts',
      width: 200,
      render: (text: string, record: Supplier) => (
        <div style={{ lineHeight: '1.8' }}>
          {record.telephone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PhoneOutlined style={{ fontSize: 12, color: '#52c41a' }} />
              <Text style={{ fontSize: 12 }}>{record.telephone}</Text>
            </div>
          )}
          {record.email && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <MailOutlined style={{ fontSize: 12, color: '#1890ff' }} />
              <Text style={{ fontSize: 12 }} title={record.email}>
                {record.email.length > 25 
                  ? `${record.email.substring(0, 25)}...` 
                  : record.email}
              </Text>
            </div>
          )}
          {record.city && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <EnvironmentOutlined style={{ fontSize: 12, color: '#faad14' }} />
              <Text style={{ fontSize: 12 }}>{record.city}</Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Délai',
      dataIndex: 'delai_livraison',
      key: 'delai_livraison',
      width: 100,
      align: 'center' as const,
      render: (jours: number | undefined) => {
        if (!jours) return <Text type="secondary">N/A</Text>;
        
        let color = 'green';
        if (jours > 7) color = 'orange';
        if (jours > 14) color = 'red';
        
        return (
          <Tag color={color} icon={<ClockCircleOutlined />}>
            {jours}j
          </Tag>
        );
      },
    },
    {
      title: 'Évaluation',
      dataIndex: 'evaluation',
      key: 'evaluation',
      width: 120,
      align: 'center' as const,
      render: (rating: number | undefined) => (
        <Rate disabled value={rating || 0} style={{ fontSize: 14 }} />
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      width: 90,
      align: 'center' as const,
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value: any, record: Supplier) => record.actif === value,
      render: (actif: boolean) => (
        <Tag color={actif ? 'success' : 'error'}>
          {actif ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      align: 'center' as const,
      render: (text: string, record: Supplier) => (
        <Button
          type="link"
          size="small"
          onClick={() => navigate(`/suppliers/${record.id}/edit`)}
        >
          Éditer
        </Button>
      ),
    },
  ];

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      console.log('[Suppliers] Fetching...');
      const response = await api.get('/suppliers');
      console.log('[Suppliers] API Response:', response.data);
      
      // Extraction robuste des données
      const suppliersData = extractApiData<Supplier>(response);
      console.log(`[Suppliers] Loaded: ${suppliersData.length} items`);
      
      setSuppliers(Array.isArray(suppliersData) ? suppliersData : []);
      
    } catch (error: any) {
      console.error('[Suppliers] Fetch error:', error);
      const errorMessage = handleApiError(error, 'Erreur chargement fournisseurs');
      message.error(errorMessage);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchText) return true;
    
    const searchLower = searchText.toLowerCase();
    return (
      (supplier.name?.toLowerCase().includes(searchLower)) ||
      (supplier.contact_person?.toLowerCase().includes(searchLower)) ||
      (supplier.email?.toLowerCase().includes(searchLower)) ||
      (supplier.telephone?.toLowerCase().includes(searchLower)) ||
      (supplier.type_produits?.toLowerCase().includes(searchLower)) ||
      (supplier.city?.toLowerCase().includes(searchLower))
    );
  });

  // Calcul des stats
  const stats = {
    total: suppliers.length,
    actifs: suppliers.filter(s => s.actif).length,
    moyenne_delai: suppliers.length > 0 
      ? Math.round(
          suppliers
            .filter(s => s.delai_livraison)
            .reduce((sum, s) => sum + (s.delai_livraison || 0), 0) / 
          suppliers.filter(s => s.delai_livraison).length || 1
        )
      : 0,
    moyenne_eval: suppliers.length > 0
      ? (suppliers.reduce((sum, s) => sum + (s.evaluation || 0), 0) / suppliers.length).toFixed(1)
      : 0
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Title level={2} style={{ margin: 0 }}>Gestion des Fournisseurs</Title>
            <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
              {suppliers.length} fournisseur{suppliers.length !== 1 ? 's' : ''} trouvé{suppliers.length !== 1 ? 's' : ''}
            </Text>
          </Col>
          <Col>
            <Link to="/suppliers/new">
              <Button type="primary" icon={<PlusOutlined />} size="large">
                Nouveau Fournisseur
              </Button>
            </Link>
          </Col>
        </Row>
      </div>

      {/* Statistiques */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Total Fournisseurs" 
              value={stats.total} 
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic 
              title="Actifs" 
              value={stats.actifs} 
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${stats.total}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Délai Moyen"
              value={stats.moyenne_delai}
              suffix="jours"
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: stats.moyenne_delai > 7 ? '#faad14' : '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Évaluation Moyenne"
              value={stats.moyenne_eval}
              suffix="/ 5"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Recherche */}
      <Card style={{ marginBottom: 24 }}>
        <Search
          placeholder="Rechercher par nom, contact, email, ville..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: '100%' }}
          size="large"
          allowClear
        />
      </Card>

      {/* Tableau */}
      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Spin size="large" tip="Chargement des fournisseurs..." />
          </div>
        ) : filteredSuppliers.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              searchText 
                ? "Aucun fournisseur trouvé pour cette recherche" 
                : "Aucun fournisseur enregistré"
            }
          >
            {!searchText && (
              <Button type="primary" onClick={() => navigate('/suppliers/new')}>
                Ajouter un fournisseur
              </Button>
            )}
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={filteredSuppliers}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} sur ${total} fournisseurs`,
            }}
            scroll={{ x: 1000 }}
            locale={{
              emptyText: 'Aucun fournisseur'
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default SuppliersPage;