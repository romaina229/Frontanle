// src/pages/settings/UsersPage.tsx
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Modal, Form, Input, Select, Tag, 
  Card, Space, Popconfirm, message, Switch, Tooltip, App 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UserOutlined, MailOutlined, PhoneOutlined 
} from '@ant-design/icons';
import { userService } from '../../services/userService';

const { Option } = Select;
const { Search } = Input;

interface User {
  id: number;
  nom: string;
  email: string;
  telephone: string;
  role: 'admin' | 'gestionnaire' | 'caissier';
  actif: boolean;
  created_at: string;
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Utilisateur',
      render: (text: string, record: User) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: '#1890ff',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
            fontSize: 16,
            fontWeight: 'bold'
          }}>
            {record.nom.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 'bold' }}>{record.nom}</div>
            <div style={{ color: '#999', fontSize: 12 }}>{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Contact',
      render: (text: string, record: User) => (
        <div>
          {record.telephone && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <PhoneOutlined style={{ color: '#999' }} />
              <span>{record.telephone}</span>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <MailOutlined style={{ color: '#999' }} />
            <span>{record.email}</span>
          </div>
        </div>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      render: (role: string) => {
        const roleColors: any = {
          admin: 'red',
          gestionnaire: 'blue',
          caissier: 'green',
        };
        return (
          <Tag color={roleColors[role] || 'default'}>
            {role.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      render: (actif: boolean) => (
        <Tag color={actif ? 'success' : 'error'}>
          {actif ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Date création',
      dataIndex: 'created_at',
      render: (date: string) => new Date(date).toLocaleDateString('fr-FR'),
    },
    {
      title: 'Actions',
      render: (text: string, record: User) => (
        <Space>
          <Tooltip title="Modifier">
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => editUser(record)}
            />
          </Tooltip>
          <Tooltip title={record.actif ? 'Désactiver' : 'Activer'}>
            <Switch
              size="small"
              checked={record.actif}
              onChange={() => toggleUserStatus(record.id, !record.actif)}
            />
          </Tooltip>
          {record.role !== 'admin' && (
            <Popconfirm
              title="Supprimer cet utilisateur?"
              onConfirm={() => deleteUser(record.id)}
              okText="Oui"
              cancelText="Non"
            >
              <Tooltip title="Supprimer">
                <Button
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                />
              </Tooltip>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAll();
      const data = response?.data || response;
      //setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      setUsers([]);
      message.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const editUser = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const toggleUserStatus = async (id: number, actif: boolean) => {
    try {
      await userService.toggleStatus(id);
      message.success(`Utilisateur ${actif ? 'activé' : 'désactivé'}`);
      fetchUsers();
    } catch (error) {
      message.error('Erreur lors du changement de statut');
    }
  };

  const deleteUser = async (id: number) => {
    try {
      await userService.delete(id);
      message.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      message.error('Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingUser) {
        await userService.update(editingUser.id, values);
        message.success('Utilisateur modifié');
      } else {
        await userService.create(values);
        message.success('Utilisateur créé');
      }
      setModalVisible(false);
      form.resetFields();
      fetchUsers();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleResetPassword = async (userId: number) => {
    Modal.confirm({
      title: 'Réinitialiser le mot de passe',
      content: 'Un nouveau mot de passe temporaire sera envoyé par email.',
      onOk: async () => {
        try {
          const newPassword = 'Temp123!';  
          await userService.resetPassword(userId, {
            new_password: newPassword,
            new_password_confirmation: newPassword
          });
          message.success('Mot de passe réinitialisé et envoyé par email');
        } catch (error) {
          message.error('Erreur lors de la réinitialisation');
        }
      },
    });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2>Gestion des Utilisateurs</h2>
        <div style={{ display: 'flex', gap: 16 }}>
          <Search
            placeholder="Rechercher utilisateur..."
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingUser(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Nouvel Utilisateur
          </Button>
        </div>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="Nom complet *"
            name="nom"
            rules={[
              { required: true, message: 'Nom requis' },
              { min: 2, message: 'Minimum 2 caractères' }
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nom complet" />
          </Form.Item>

          <Form.Item
            label="Email *"
            name="email"
            rules={[
              { required: true, message: 'Email requis' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item label="Téléphone" name="telephone">
            <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
          </Form.Item>

          <Form.Item
            label="Rôle *"
            name="role"
            rules={[{ required: true, message: 'Rôle requis' }]}
          >
            <Select placeholder="Sélectionner un rôle">
              <Option value="caissier">Caissier</Option>
              <Option value="gestionnaire">Gestionnaire</Option>
              <Option value="admin">Administrateur</Option>
            </Select>
          </Form.Item>

          {!editingUser && (
            <Form.Item
              label="Mot de passe *"
              name="password"
              rules={[
                { required: true, message: 'Mot de passe requis' },
                { min: 6, message: 'Minimum 6 caractères' }
              ]}
            >
              <Input.Password placeholder="Mot de passe" />
            </Form.Item>
          )}

          <Form.Item
            label="Statut"
            name="actif"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <Button onClick={() => setModalVisible(false)}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit">
                {editingUser ? 'Modifier' : 'Créer'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UsersPage;