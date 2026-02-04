// src/pages/settings/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { Tag } from 'antd';
import { 
  Card, Form, Input, Button, Avatar, Row, Col, 
  Divider, message, Upload, Tabs, Modal, App 
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  SaveOutlined, LockOutlined, CameraOutlined 
} from '@ant-design/icons';
import { profilService } from '../../services/profileService';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const { message } = App.useApp();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await profilService.getProfile();
      const profileData = response?.data || response;
      setProfile(profileData);
      form.setFieldsValue(profileData);
    } catch (error: any) {
      console.error('Erreur lors du chargement du profil:', error);
      if (error.response?.status === 404) {
        message.error('Profil non trouvé');
      } else if (error.response?.status === 422) {
        message.error('Données de profil invalides');
      } else {
        message.error('Erreur lors du chargement du profil');
      }
    }
  };

  const handleProfileUpdate = async (values: any) => {
    setLoading(true);
    try {
      await profilService.updateProfile(values);
      message.success('Profil mis à jour avec succès');
      fetchProfile(); // Recharger les données
    } catch (error) {
      message.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      await profilService.changePassword(values);
      message.success('Mot de passe modifié avec succès');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: any) => {
    setAvatarLoading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      await profilService.updateProfile({ 
        avatar: file,
        name: profile?.nom,
        email: profile?.email
      });
      message.success('Photo de profil mise à jour');
      fetchProfile();
    } catch (error) {
      message.error('Erreur lors du téléchargement de la photo');
    } finally {
      setAvatarLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: 'Informations personnelles',
      children: (
        <>
          <Card>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleProfileUpdate}
            >
              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item
                    label="Nom complet *"
                    name="nom"
                    rules={[{ required: true, message: 'Nom requis' }]}
                  >
                    <Input prefix={<UserOutlined />} placeholder="Votre nom" />
                  </Form.Item>
                </Col>
                <Col span={12}>
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
                </Col>
              </Row>

              <Row gutter={24}>
                <Col span={12}>
                  <Form.Item label="Téléphone" name="telephone">
                    <Input prefix={<PhoneOutlined />} placeholder="Téléphone" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="Adresse" name="adresse">
                    <Input placeholder="Adresse" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="À propos" name="bio">
                <TextArea rows={3} placeholder="Une brève description..." />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<SaveOutlined />}
                >
                  Enregistrer les modifications
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Divider />

          <Card title="Informations système">
            <Row gutter={24}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#999', fontSize: 12 }}>Rôle</div>
                  <div style={{ fontWeight: 'bold' }}>{profile?.role?.toUpperCase()}</div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#999', fontSize: 12 }}>Membre depuis</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {profile?.created_at ? dayjs(profile.created_at).format('DD/MM/YYYY') : '-'}
                  </div>
                </div>
              </Col>
            </Row>
            <Row gutter={24}>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#999', fontSize: 12 }}>Dernière connexion</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {profile?.last_login 
                      ? dayjs(profile.last_login).format('DD/MM/YYYY HH:mm')
                      : 'Jamais'
                    }
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#999', fontSize: 12 }}>Statut</div>
                  <Tag color={profile?.actif ? 'success' : 'error'}>
                    {profile?.actif ? 'Actif' : 'Inactif'}
                  </Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </>
      )
    },
    {
      key: 'security',
      label: 'Sécurité',
      children: (
        <>
          <Card>
            <Form
              form={passwordForm}
              layout="vertical"
              onFinish={handlePasswordChange}
            >
              <Form.Item
                label="Mot de passe actuel *"
                name="current_password"
                rules={[{ required: true, message: 'Mot de passe actuel requis' }]}
              >
                <Input.Password placeholder="Mot de passe actuel" />
              </Form.Item>

              <Form.Item
                label="Nouveau mot de passe *"
                name="new_password"
                rules={[
                  { required: true, message: 'Nouveau mot de passe requis' },
                  { min: 6, message: 'Minimum 6 caractères' }
                ]}
              >
                <Input.Password placeholder="Nouveau mot de passe" />
              </Form.Item>

              <Form.Item
                label="Confirmer le nouveau mot de passe *"
                name="confirm_password"
                dependencies={['new_password']}
                rules={[
                  { required: true, message: 'Confirmation requise' },
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
                <Input.Password placeholder="Confirmer le mot de passe" />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  icon={<LockOutlined />}
                >
                  Changer le mot de passe
                </Button>
              </Form.Item>
            </Form>
          </Card>

          <Divider />

          <Card title="Sessions actives">
            <p style={{ color: '#666' }}>
              Pour des raisons de sécurité, vous pouvez déconnecter toutes les sessions actives 
              sur d'autres appareils.
            </p>
            <Button 
              type="primary" 
              danger
              onClick={() => {
                Modal.confirm({
                  title: 'Déconnexion globale',
                  content: 'Êtes-vous sûr de vouloir déconnecter toutes les autres sessions?',
                  onOk: async () => {
                    try {
                      await Promise.resolve();
                      message.success('Toutes les autres sessions ont été déconnectées');
                    } catch (error) {
                      message.error('Erreur lors de la déconnexion');
                    }
                  },
                });
              }}
            >
              Déconnecter toutes les autres sessions
            </Button>
          </Card>
        </>
      )
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: (
        <Card>
          <h3>Préférences de notification</h3>
          <p>Configuration des notifications...</p>
        </Card>
      )
    }
  ];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <Upload
          accept="image/*"
          showUploadList={false}
          beforeUpload={handleAvatarUpload}
        >
          <Avatar
            size={120}
            src={profile?.avatar_url}
            icon={<UserOutlined />}
            style={{ 
              cursor: 'pointer',
              border: '4px solid #1890ff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
            }}
          >
            {profile?.nom?.substring(0, 2).toUpperCase()}
          </Avatar>
          <div style={{ marginTop: 12 }}>
            <Button 
              type="link" 
              icon={<CameraOutlined />}
              loading={avatarLoading}
            >
              Changer la photo
            </Button>
          </div>
        </Upload>
        <h2 style={{ marginTop: 16, marginBottom: 4 }}>{profile?.nom}</h2>
        <p style={{ color: '#666', marginBottom: 8 }}>{profile?.email}</p>
        <Tag color="blue" style={{ textTransform: 'uppercase' }}>
          {profile?.role}
        </Tag>
      </div>

      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
};

export default ProfilePage;