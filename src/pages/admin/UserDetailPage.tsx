// src/pages/admin/UserDetailPage.tsx
import React, { useState } from 'react';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Switch } from '@mui/material';
import { Meta } from 'antd/es/list/Item';
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Tag, 
  Button, 
  Space, 
  Descriptions, 
  Timeline, 
  Table, 
  Avatar,
  Badge,
  Divider,
  Tabs,
  Modal,
  Form,
  Input,
  message,
  Statistic,
  Tooltip,
  Popconfirm
} from 'antd';
import { 
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  HistoryOutlined,
  LockOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser, useToggleUserStatus, useResetPassword } from '../../hooks/useUsers';
import { useUserSales } from '../../hooks/useUserSales';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { USER_ROLES } from '../../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const UserDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const userId = parseInt(id || '0');
  
  const { data: userData, isLoading, refetch } = useUser(userId);
  const { data: salesData } = useUserSales(userId);
  const toggleMutation = useToggleUserStatus();
  const resetPasswordMutation = useResetPassword();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  const user = userData?.data;

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return (
      <Card>
        <Title level={4}>Utilisateur non trouvé</Title>
        <Button 
          type="primary" 
          onClick={() => navigate('/users')}
          icon={<ArrowLeftOutlined />}
        >
          Retour à la liste
        </Button>
      </Card>
    );
  }

  const handleToggleStatus = () => {
    toggleMutation.mutate(user.id, {
      onSuccess: () => {
        refetch();
        message.success(`Utilisateur ${user.active ? 'désactivé' : 'activé'} avec succès`);
      }
    });
  };

  const handleResetPassword = (values: { new_password: string; new_password_confirmation: string }) => {
    resetPasswordMutation.mutate(
      { id: user.id, passwordData: values },
      {
        onSuccess: () => {
          message.success('Mot de passe réinitialisé avec succès');
          setIsPasswordModalOpen(false);
        }
      }
    );
  };

  const handleDelete = () => {
    // Implémentez la suppression ici
    message.success('Utilisateur supprimé avec succès');
    setDeleteModalOpen(false);
    navigate('/users');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'blue';
      case 'gestionnaire': return 'green';
      case 'caissier': return 'orange';
      default: return 'default';
    }
  };

  const salesColumns = [
    {
      title: 'ID Vente',
      dataIndex: 'id',
      key: 'id',
      width: 100,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      render: (text: string, record: any) => text || 'Non spécifié',
    },
    {
      title: 'Montant',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : 'processing'}>
          {status === 'completed' ? 'Terminée' : 'En cours'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />}
          onClick={() => navigate(`/sales/${record.id}`)}
        >
          Voir
        </Button>
      ),
    },
  ];

  const activityTimeline = [
    {
      color: 'green',
      children: (
        <>
          <Text strong>Compte créé</Text>
          <br />
          <Text type="secondary">{formatDate(user.created_at)}</Text>
        </>
      ),
    },
    ...(user.last_login ? [{
      color: 'blue',
      children: (
        <>
          <Text strong>Dernière connexion</Text>
          <br />
          <Text type="secondary">{formatDate(user.last_login)}</Text>
        </>
      ),
    }] : []),
  ];

  return (
    <div>
      {/* En-tête avec boutons */}
      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/users')}
              >
                Retour
              </Button>
              <Title level={3} style={{ margin: 0 }}>
                <UserOutlined /> {user.name}
              </Title>
              <Tag color={getRoleColor(user.role)}>
                {USER_ROLES[user.role as keyof typeof USER_ROLES]}
              </Tag>
              <Badge 
                status={user.active ? 'success' : 'error'} 
                text={user.active ? 'Actif' : 'Inactif'} 
              />
            </Space>
          </Col>
          <Col>
            <Space>
              <Button 
                icon={<EditOutlined />}
                onClick={() => setIsEditModalOpen(true)}
              >
                Modifier
              </Button>
              
              <Button 
                icon={<LockOutlined />}
                onClick={() => setIsPasswordModalOpen(true)}
              >
                Réinitialiser MDP
              </Button>
              
              <Button 
                type={user.active ? 'default' : 'primary'}
                danger={user.active}
                icon={user.active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
                onClick={handleToggleStatus}
                loading={toggleMutation.isPending}
              >
                {user.active ? 'Désactiver' : 'Activer'}
              </Button>
              
              {user.role !== 'admin' && (
                <Popconfirm
                  title="Êtes-vous sûr de vouloir supprimer cet utilisateur ?"
                  onConfirm={handleDelete}
                  okText="Oui"
                  cancelText="Non"
                  icon={<ExclamationCircleOutlined style={{ color: 'red' }} />}
                >
                  <Button 
                    type="primary" 
                    danger 
                    icon={<DeleteOutlined />}
                  >
                    Supprimer
                  </Button>
                </Popconfirm>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]}>
        {/* Colonne gauche : Informations utilisateur */}
        <Col span={8}>
          <Card title="Informations Personnelles">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar 
                size={120} 
                src={user.avatar_url}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: user.active ? '#1890ff' : '#999',
                  marginBottom: 16 
                }}
              />
              <Title level={4}>{user.name}</Title>
              <Text type="secondary">{user.email}</Text>
            </div>

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Email" labelStyle={{ width: 120 }}>
                <Space>
                  <MailOutlined />
                  {user.email}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Téléphone">
                <Space>
                  <PhoneOutlined />
                  {user.telephone || 'Non renseigné'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Adresse">
                <Space>
                  <HomeOutlined />
                  {user.address || 'Non renseignée'}
                </Space>
              </Descriptions.Item>
              
              <Descriptions.Item label="Rôle">
                <Tag color={getRoleColor(user.role)}>
                  {USER_ROLES[user.role as keyof typeof USER_ROLES]}
                </Tag>
              </Descriptions.Item>
              
              <Descriptions.Item label="Statut">
                <Badge 
                  status={user.active ? 'success' : 'error'} 
                  text={user.active ? 'Actif' : 'Inactif'} 
                />
              </Descriptions.Item>
              
              <Descriptions.Item label="Date de création">
                <Space>
                  <CalendarOutlined />
                  {formatDate(user.created_at)}
                </Space>
              </Descriptions.Item>
              
              {user.last_login && (
                <Descriptions.Item label="Dernière connexion">
                  <Space>
                    <HistoryOutlined />
                    {formatDate(user.last_login)}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>

          {/* Statistiques */}
          <Card title="Statistiques" style={{ marginTop: 16 }}>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Statistic 
                  title="Total Ventes" 
                  value={salesData?.data?.length || 0}
                  prefix={<ShoppingCartOutlined />}
                />
              </Col>
              <Col span={12}>
                <Statistic 
                  title="Chiffre d'affaires" 
                  value={salesData?.data?.reduce((sum: number, sale: any) => sum + (sale.total_amount || 0), 0) || 0}
                  prefix={<DollarOutlined />}
                  suffix="FCFA"
                />
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Colonne droite : Historique et activités */}
        <Col span={16}>
          <Tabs defaultActiveKey="sales">
            <TabPane 
              tab={
                <span>
                  <ShoppingCartOutlined />
                  Ventes Récentes
                </span>
              } 
              key="sales"
            >
              <Card>
                <Table
                  columns={salesColumns}
                  dataSource={salesData?.data || []}
                  rowKey="id"
                  pagination={{
                    pageSize: 5,
                    showSizeChanger: false,
                  }}
                  size="small"
                />
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <HistoryOutlined />
                  Activités
                </span>
              } 
              key="activity"
            >
              <Card>
                <Timeline items={activityTimeline} />
              </Card>
            </TabPane>
            
            <TabPane 
              tab={
                <span>
                  <LockOutlined />
                  Permissions
                </span>
              } 
              key="permissions"
            >
              <Card>
                <Title level={5}>Permissions accordées</Title>
                <Space wrap style={{ marginTop: 16 }}>
                  {user.permissions?.map((permission: string, index: number) => (
                    <Tag color="blue" key={index}>
                      {permission}
                    </Tag>
                  ))}
                  {(!user.permissions || user.permissions.length === 0) && (
                    <Text type="secondary">Aucune permission spécifique</Text>
                  )}
                </Space>
                
                <Divider />
                
                <Title level={5}>Ressources accessibles</Title>
                <Row gutter={[8, 8]} style={{ marginTop: 16 }}>
                  {['products', 'sales', 'clients', 'suppliers', 'reports', 'invoices'].map(resource => (
                    <Col key={resource}>
                      <Tooltip title={resource}>
                        <Tag color="green">
                          {resource}
                        </Tag>
                      </Tooltip>
                    </Col>
                  ))}
                </Row>
              </Card>
            </TabPane>
          </Tabs>
        </Col>
      </Row>

      {/* Modal de modification */}
      <Modal
        title="Modifier l'utilisateur"
        open={isEditModalOpen}
        onCancel={() => setIsEditModalOpen(false)}
        footer={null}
        width={600}
      >
        <Form
          layout="vertical"
          initialValues={{
            name: user.name,
            email: user.email,
            telephone: user.telephone,
            address: user.address,
            role: user.role,
            active: user.active,
          }}
          onFinish={(values) => {
            // Implémentez la mise à jour ici
            console.log('Update values:', values);
            message.success('Utilisateur mis à jour avec succès');
            setIsEditModalOpen(false);
            refetch();
          }}
        >
          <Form.Item
            name="name"
            label="Nom complet"
            rules={[{ required: true, message: 'Veuillez saisir le nom' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir l\'email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="telephone"
            label="Téléphone"
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="address"
            label="Adresse"
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          
          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
          >
            <Select>
              {Object.entries(USER_ROLES).map(([value, label]) => (
                <Select key={value} value={value}>
                  {label}
                </Select>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="active"
            label="Statut"
            valuePropName="checked"
          >
            {/*<Switch checkedChildren="Actif" unCheckedChildren="Inactif" />*/}
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsEditModalOpen(false)}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                Enregistrer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal de réinitialisation de mot de passe */}
      <Modal
        title="Réinitialiser le mot de passe"
        open={isPasswordModalOpen}
        onCancel={() => setIsPasswordModalOpen(false)}
        footer={null}
        width={400}
      >
        <Form
          layout="vertical"
          onFinish={handleResetPassword}
        >
          <Form.Item
            name="new_password"
            label="Nouveau mot de passe"
            rules={[
              { required: true, message: 'Veuillez saisir le nouveau mot de passe' },
              { min: 6, message: 'Le mot de passe doit avoir au moins 6 caractères' }
            ]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item
            name="new_password_confirmation"
            label="Confirmer le mot de passe"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Veuillez confirmer le mot de passe' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsPasswordModalOpen(false)}>
                Annuler
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={resetPasswordMutation.isPending}
              >
                Réinitialiser
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDetailPage;