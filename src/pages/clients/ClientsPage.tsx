// src/pages/clients/ClientsPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Space, Card, Statistic, Row, Col, 
  Avatar, Popconfirm, message, Modal 
} from 'antd';
import { 
  PlusOutlined, SearchOutlined, UserOutlined, 
  EditOutlined, DeleteOutlined, EyeOutlined 
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Search } = Input;

interface Client {
  id: number;
  name: string;
  telephone: string;
  email: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
}

interface ClientStats {
  total_clients: number;
  active_clients: number;
  inactive_clients: number;
  new_clients_this_month: number;
}

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [stats, setStats] = useState<ClientStats>({
    total_clients: 0,
    active_clients: 0,
    inactive_clients: 0,
    new_clients_this_month: 0
  });
  const navigate = useNavigate();

  const columns = [
    {
      title: 'Client',
      dataIndex: 'name',
      render: (text: string, record: Client) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar 
            style={{ backgroundColor: '#1890ff', marginRight: 10 }}
            icon={<UserOutlined />}
          >
            {text?.charAt(0)?.toUpperCase() || 'C'}
          </Avatar>
          <div>
            <strong>{text || 'Non renseigné'}</strong>
            {record.email && (
              <div style={{ fontSize: 12, color: '#666' }}>{record.email}</div>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      render: (text: string) => text || '—'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (email: string) => email || '—',
    },
    {
      title: 'Adresse',
      dataIndex: 'address',
      render: (address: string) => address || '—',
    },
    {
      title: 'Actions',
      render: (_: any, record: Client) => (
        <Space>
          <Button 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => navigate(`/clients/${record.id}`)}
          />
          <Button 
            size="small" 
            icon={<EditOutlined />}
            onClick={() => navigate(`/clients/${record.id}/edit`)}
          />
          <Popconfirm
            title="Supprimer ce client?"
            description="Êtes-vous sûr de vouloir supprimer ce client ?"
            onConfirm={() => handleDelete(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okType="danger"
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchClients();
    fetchStats();
  }, []);

  const fetchClients = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (searchText) {
        params.search = searchText;
      }
      
      console.log('🔍 Chargement des clients...');
      const response = await api.get('/clients', { params });
      console.log('📦 Réponse API clients:', response);
      
      // NOUVELLE APPROCHE - Plus simple et robuste
      let clientsData: Client[] = [];
      
      // Essayez d'extraire les données de différentes manières
      const data = response.data;
      
      if (Array.isArray(data)) {
        // Cas 1: La réponse est directement un tableau
        clientsData = data;
        console.log('✅ Format: tableau direct');
      } 
      else if (data && Array.isArray(data.data)) {
        // Cas 2: Structure Laravel standard {data: [...]}
        clientsData = data.data;
        console.log('✅ Format: data.data');
      }
      else if (data && data.data && Array.isArray(data.data.data)) {
        // Cas 3: Structure paginée
        clientsData = data.data.data;
        console.log('✅ Format: pagination data.data.data');
      }
      else if (data && data.success && Array.isArray(data.data)) {
        // Cas 4: Structure avec success flag
        clientsData = data.data;
        console.log('✅ Format: success.data');
      }
      else if (data && data.clients) {
        // Cas 5: Structure avec clé clients
        clientsData = Array.isArray(data.clients) ? data.clients : [];
        console.log('✅ Format: data.clients');
      }
      else {
        console.warn('⚠️ Aucune donnée de client trouvée dans la réponse:', data);
        clientsData = [];
      }
      
      // Vérifiez la structure des données pour debug
      if (clientsData.length > 0) {
        console.log('📋 Premier client:', clientsData[0]);
        console.log('📋 Structure des clés:', Object.keys(clientsData[0]));
      }
      
      console.log(`✅ ${clientsData.length} clients chargés`);
      setClients(clientsData);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des clients:', error);
      console.error('Status:', error.response?.status);
      console.error('Data:', error.response?.data);
      
      message.error(
        error.response?.data?.message || 
        'Erreur lors du chargement des clients'
      );
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('📊 Chargement des statistiques...');
      const response = await api.get('/clients/statistics/summary');
      console.log('📊 Réponse stats:', response.data);
      
      // Extraction robuste des stats
      let statsData = {
        total_clients: 0,
        active_clients: 0,
        inactive_clients: 0,
        new_clients_this_month: 0
      };

      if (response.data) {
        if (response.data.data) {
          statsData = { ...statsData, ...response.data.data };
        } else if (response.data.success && response.data.data) {
          statsData = { ...statsData, ...response.data.data };
        } else {
          statsData = { ...statsData, ...response.data };
        }
      }
      
      console.log('✅ Stats chargées:', statsData);
      setStats(statsData);
      
    } catch (error: any) {
      console.error('❌ Erreur lors du chargement des stats:', error);
      // Ne pas afficher de message d'erreur pour les stats, juste logger
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/clients/${id}`);
      message.success('Client supprimé avec succès');
      fetchClients();
      fetchStats();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    fetchClients();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2>Gestion des Clients</h2>
        <Link to="/clients/new">
          <Button type="primary" icon={<PlusOutlined />}>
            Nouveau Client
          </Button>
        </Link>
      </div>

      {/* Statistiques */}
      <Row gutter={16} style={{ marginBottom: 20 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Total Clients"
              value={stats.total_clients}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Clients Actifs"
              value={stats.active_clients}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Clients Inactifs"
              value={stats.inactive_clients}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Nouveaux ce mois"
              value={stats.new_clients_this_month}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filtres */}
      <Card style={{ marginBottom: 20 }}>
        <Space>
          <Search
            placeholder="Rechercher client..."
            style={{ width: 300 }}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={handleSearch}
            allowClear
          />
          <Button type="primary" onClick={fetchClients} loading={loading}>
            Rechercher
          </Button>
        </Space>
      </Card>

      {/* Tableau */}
      <Card>
        <Table
          columns={columns}
          dataSource={clients}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} client${total > 1 ? 's' : ''}`
          }}
          locale={{
            emptyText: loading ? 'Chargement...' : 'Aucun client trouvé'
          }}
        />
      </Card>
    </div>
  );
};

export default ClientsPage;