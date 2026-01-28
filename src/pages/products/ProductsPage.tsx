// src/pages/products/ProductsPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import {
  Card, Table, Button, Input, Select, Tag, Space,
  message, Tooltip, Row, Col, Badge, Popconfirm
} from 'antd';
import {
  PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined,
  ShoppingCartOutlined, ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { extractApiData, handleApiError, formatCurrency } from '../../utils/apiHelpers';

const { Option } = Select;
const { Search } = Input;

interface Product {
  id: number;
  name: string;
  category: {
    id: number;
    name: string;
  };
  unit_price: number;
  stock_quantity: number;
  unit: string;
  alert_threshold: number;
  status: 'available' | 'out_of_stock' | 'discontinued';
  description?: string;
  created_at: string;
}

const ProductsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({
    search: '',
    category_id: '',
    status: '',
    low_stock: false,
    page: 1,
    per_page: 15
  });
  
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [searchParams]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: any = { ...searchParams };
      
      const response = await api.get('/products', { params });
      console.log('[Products] API Response:', response.data);
      
      // Extraction robuste des données
      const productsData = extractApiData<Product>(response);
      console.log(`[Products] Loaded: ${productsData.length} items`);
      
      setProducts(Array.isArray(productsData) ? productsData : []);
      
    } catch (error: any) {
      console.error('[Products] Fetch error:', error);
      const errorMessage = handleApiError(error, 'Erreur chargement produits');
      message.error(errorMessage);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      console.log('[Products] Categories Response:', response.data);
      
      const categoriesData = extractApiData(response);
      console.log('[Products] Categories loaded:', categoriesData.length);
      
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error: any) {
      console.error('[Products] Categories error:', error);
      setCategories([]);
    }
  };

  const handleSearch = (key: string, value: any) => {
    setSearchParams(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      message.success('Produit supprimé');
      fetchProducts();
    } catch (error: any) {
      const errorMessage = handleApiError(error, 'Erreur suppression');
      message.error(errorMessage);
    }
  };

  const formatQuantity = (quantity: number, unit: string) => {
    return `${quantity || 0} ${unit || 'unité'}`;
  };

  const formatStatus = (status: string) => {
    const statusMap: Record<string, { text: string; color: string }> = {
      'available': { text: 'Disponible', color: 'success' },
      'out_of_stock': { text: 'Rupture', color: 'error' },
      'discontinued': { text: 'Discontinué', color: 'default' }
    };
    return statusMap[status] || { text: status, color: 'default' };
  };

  const columns = [
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Product) => (
        <div>
          <div style={{ fontWeight: 500, color: '#1890ff', cursor: 'pointer' }}
               onClick={() => navigate(`/products/${record.id}/edit`)}>
            {text || 'N/A'}
          </div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>
            {record.category?.name || 'Sans catégorie'}
          </div>
        </div>
      ),
    },
    {
      title: 'Prix',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => formatCurrency(price || 0),
    },
    {
      title: 'Stock',
      dataIndex: 'stock_quantity',
      key: 'stock_quantity',
      render: (quantity: number, record: Product) => {
        const percentage = record.alert_threshold > 0 ? (quantity / record.alert_threshold) * 100 : 0;
        let status = 'normal';
        
        if (quantity <= 0) {
          status = 'out_of_stock';
        } else if (percentage <= 30) {
          status = 'critical';
        } else if (percentage <= 60) {
          status = 'warning';
        }
        
        const statusColors: any = {
          normal: '#52c41a',
          warning: '#faad14',
          critical: '#ff4d4f',
          out_of_stock: '#8c8c8c'
        };
        
        return (
          <div>
            <span style={{ color: statusColors[status], fontWeight: 500 }}>
              {formatQuantity(quantity || 0, record.unit || 'unité')}
            </span>
            {record.alert_threshold > 0 && (
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>
                Seuil: {formatQuantity(record.alert_threshold, record.unit || 'unité')}
              </div>
            )}
          </div>
        );
      },
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
      render: (_: any, record: Product) => (
        <Space size="small">
          <Tooltip title="Modifier">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => navigate(`/products/${record.id}/edit`)}
            />
          </Tooltip>
          
          <Tooltip title="Supprimer">
            <Popconfirm
              title="Supprimer le produit"
              description="Êtes-vous sûr ?"
              onConfirm={() => handleDelete(record.id)}
              okText="Supprimer"
              cancelText="Annuler"
              okType="danger"
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1>Gestion des Produits</h1>
        <p style={{ color: '#8c8c8c' }}>Gérez votre inventaire</p>
      </div>

      {/* Filtres */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={8} md={6}>
            <Search
              placeholder="Rechercher..."
              value={searchParams.search}
              onChange={e => handleSearch('search', e.target.value)}
              onSearch={() => fetchProducts()}
              allowClear
            />
          </Col>
          
          <Col xs={24} sm={8} md={4}>
            <Select
              placeholder="Catégorie"
              style={{ width: '100%' }}
              value={searchParams.category_id || undefined}
              onChange={value => handleSearch('category_id', value)}
              allowClear
            >
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
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
              <Option value="available">Disponible</Option>
              <Option value="out_of_stock">Rupture</Option>
              <Option value="discontinued">Discontinué</Option>
            </Select>
          </Col>
          
          <Col xs={24} sm={12} md={4}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => setSearchParams({
                search: '',
                category_id: '',
                status: '',
                low_stock: false,
                page: 1,
                per_page: 15
              })}
              style={{ width: '100%' }}
            >
              Réinitialiser
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/products/new')}
        >
          Nouveau Produit
        </Button>
        
        <div>
          <Badge count={products.length} showZero style={{ backgroundColor: '#1890ff' }} />
          <span style={{ marginLeft: 8, color: '#8c8c8c' }}>produits</span>
        </div>
      </div>

      {/* Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={Array.isArray(products) ? products : []}
          rowKey="id"
          loading={loading}
          pagination={{
            current: searchParams.page,
            pageSize: searchParams.per_page,
            total: products.length,
            showSizeChanger: true,
            showTotal: (total) => `${total} produits`
          }}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucun produit'
          }}
        />
      </Card>
    </div>
  );
};

export default ProductsPage;