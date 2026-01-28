// src/pages/admin/UsersPage.tsx
import React, { useState } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Input, 
  Select, 
  Space, 
  Modal, 
  Tag, 
  Tooltip,
  Row, 
  Col,
  Statistic,
  Badge,
  Popconfirm,
  message,
  Typography
} from 'antd';
import { 
  PlusOutlined, 
  SearchOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  ReloadOutlined,
  FilterOutlined,
  UserOutlined,
  TeamOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { 
  useUsers, 
  useDeleteUser, 
  useToggleUserStatus,
  useUserStats 
} from '../../hooks/useUsers';
import UserForm from '../../components/forms/UserForm';
import { USER_ROLES } from '../../types';


const { Title } = Typography;
const { Option } = Select;

const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    active: undefined
  });
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  const { data, isLoading, refetch } = useUsers(filters, page, 10);
  const { data: stats } = useUserStats();
  const deleteMutation = useDeleteUser();
  const toggleMutation = useToggleUserStatus();

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
      sorter: true,
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <Space>
          {record.avatar_url ? (
            <img 
              src={record.avatar_url} 
              alt={text} 
              style={{ width: 32, height: 32, borderRadius: '50%' }}
            />
          ) : (
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: record.role === 'admin' ? '#1890ff' : 
                         record.role === 'gestionnaire' ? '#52c41a' : '#fa8c16',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {record.initials}
            </div>
          )}
          <div>
            <div>{text}</div>
            <div style={{ fontSize: '12px', color: '#999' }}>{record.email}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const color = role === 'admin' ? 'blue' : 
                     role === 'gestionnaire' ? 'green' : 'orange';
        return <Tag color={color}>{USER_ROLES[role as keyof typeof USER_ROLES]}</Tag>;
      },
      filters: Object.entries(USER_ROLES).map(([value, label]) => ({
        text: label,
        value: value
      })),
      onFilter: (value: string, record: any) => record.role === value,
    },
    {
      title: 'Téléphone',
      dataIndex: 'telephone',
      key: 'telephone',
      render: (text: string) => text || 'Non renseigné',
    },
    {
      title: 'Statut',
      dataIndex: 'active',
      key: 'active',
      render: (active: boolean) => (
        <Badge 
          status={active ? 'success' : 'error'} 
          text={active ? 'Actif' : 'Inactif'} 
        />
      ),
      filters: [
        { text: 'Actif', value: true },
        { text: 'Inactif', value: false },
      ],
      onFilter: (value: boolean, record: any) => record.active === value,
    },
    {
      title: 'Dernière connexion',
      dataIndex: 'last_login',
      key: 'last_login',
      render: (date: string) => date 
        ? new Date(date).toLocaleDateString('fr-FR')
        : 'Jamais connecté',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Voir les détails">
            <Button 
              type="text" 
              icon={<EyeOutlined />}
              onClick={() => navigate(`/users/${record.id}`)}
            />
          </Tooltip>
          
          <Tooltip title="Modifier">
            <Button 
              type="text" 
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          
          <Tooltip title={record.active ? 'Désactiver' : 'Activer'}>
            <Popconfirm
              title={`Voulez-vous ${record.active ? 'désactiver' : 'activer'} cet utilisateur ?`}
              onConfirm={() => toggleMutation.mutate(record.id)}
            >
              <Button 
                type="text" 
                icon={record.active ? <DeleteOutlined /> : <PlusOutlined />}
                danger={record.active}
              />
            </Popconfirm>
          </Tooltip>
          
          {record.role !== 'admin' && (
            <Tooltip title="Supprimer">
              <Popconfirm
                title="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
                onConfirm={() => deleteMutation.mutate(record.id)}
              >
                <Button 
                  type="text" 
                  icon={<DeleteOutlined />} 
                  danger
                />
              </Popconfirm>
            </Tooltip>
          )}
        </Space>
      ),
    },
  ];

  const handleSearch = (value: string) => {
    setFilters({ ...filters, search: value });
    setPage(1);
  };

  const handleRoleFilter = (value: string) => {
    setFilters({ ...filters, role: value });
    setPage(1);
  };

  const handleStatusFilter = (value: boolean | undefined) => {
    setFilters({ ...filters, active: value });
    setPage(1);
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (user: any) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      // Ici, vous utiliserez useCreateUser ou useUpdateUser
      message.success(`Utilisateur ${modalMode === 'create' ? 'créé' : 'mis à jour'} avec succès`);
      setIsModalOpen(false);
      refetch();
    } catch (error) {
      message.error('Erreur lors de l\'enregistrement');
    }
  };

  return (
    <div>
      <Title level={2}>
        <TeamOutlined /> Gestion des Utilisateurs
      </Title>

      {/* Statistiques */}
      {stats && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Total Utilisateurs" 
                value={stats.data.total} 
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Utilisateurs Actifs" 
                value={stats.data.active} 
                prefix={<UserOutlined />}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Inactifs" 
                value={stats.data.inactive} 
                valueStyle={{ color: '#cf1322' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Nouveaux (30j)" 
                value={stats.data.lastMonthRegistrations}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtres */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col flex="auto">
            <Input
              placeholder="Rechercher par nom, email ou téléphone..."
              prefix={<SearchOutlined />}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
          </Col>
          <Col>
            <Select
              placeholder="Filtrer par rôle"
              style={{ width: 150 }}
              onChange={handleRoleFilter}
              allowClear
            >
              {Object.entries(USER_ROLES).map(([value, label]) => (
                <Option key={value} value={value}>{label}</Option>
              ))}
            </Select>
          </Col>
          <Col>
            <Select
              placeholder="Statut"
              style={{ width: 120 }}
              onChange={handleStatusFilter}
              allowClear
            >
              <Option value="true">Actif</Option>
              <Option value="false">Inactif</Option>
            </Select>
          </Col>
          <Col>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={() => refetch()}
            >
              Actualiser
            </Button>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Nouvel Utilisateur
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tableau */}
      <Card>
        <Table
          columns={columns}
          dataSource={data?.data || []}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 10,
            total: data?.meta?.total || 0,
            onChange: (newPage) => setPage(newPage),
            showSizeChanger: false,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} sur ${total} utilisateurs`,
          }}
        />
      </Card>

      {/* Modal de création/édition */}
      <Modal
        title={modalMode === 'create' ? 'Nouvel Utilisateur' : 'Modifier Utilisateur'}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
        destroyOnClose
      >
        <UserForm
          initialValues={selectedUser}
          onSubmit={handleSubmit}
          mode={modalMode}
        />
      </Modal>
    </div>
  );
};

export default UsersPage;