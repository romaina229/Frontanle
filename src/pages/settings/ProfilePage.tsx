// src/pages/settings/ProfilePage.tsx - VERSION FINALE CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Tag, Spin, Alert } from 'antd';
import { 
  Card, Form, Input, Button, Avatar, Row, Col, 
  Divider, message, Upload, Tabs, Modal, App 
} from 'antd';
import { 
  UserOutlined, MailOutlined, PhoneOutlined, 
  SaveOutlined, LockOutlined, CameraOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { profilService } from '../../services/profileService';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ProfilePage: React.FC = () => {
  const [form] = Form.useForm();
  const { message: messageApi } = App.useApp();
  const [passwordForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Récupérer les infos utilisateur depuis Redux comme fallback
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setPageLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Chargement du profil...');
      
      // Essayer plusieurs endpoints possibles
      let response;
      let profileData = null;
      
      try {
        // Endpoint 1: /profile
        response = await profilService.getProfile();
        console.log('📦 Réponse /profile:', response);
      } catch (err: any) {
        console.warn('⚠️ /profile échoué, essai /user/profile');
        
        // Endpoint 2: /user/profile
        try {
          response = await profilService.getProfile(); // Utilise l'endpoint configuré dans le service
        } catch (err2: any) {
          console.warn('⚠️ /user/profile échoué, essai /me');
          
          // Endpoint 3: /me
          try {
            const api = (await import('../../services/api')).default;
            response = await api.get('/me');
          } catch (err3) {
            throw err3;
          }
        }
      }
      
      // Extraction des données
      if (response) {
        if (response.data?.data) {
          profileData = response.data.data;
        } else if (response.data) {
          profileData = response.data;
        }
      }
      
      // Si aucune donnée du serveur, utiliser les données Redux
      if (!profileData && user) {
        console.log('ℹ️ Utilisation des données Redux comme fallback');
        profileData = {
          nom: user.name,
          email: user.email,
          role: user.role,
          telephone: user.telephone || '',
         // adresse: user.address || '',
          bio: '',
          actif: true,
          created_at: user.created_at || new Date().toISOString()
        };
      }
      
      if (profileData) {
        console.log('✅ Profil chargé:', profileData);
        setProfile(profileData);
        form.setFieldsValue(profileData);
      } else {
        throw new Error('Aucune donnée de profil disponible');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur chargement profil:', error);
      console.error('Détails:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Impossible de charger le profil';
      
      setError(errorMessage);
      
      // Utiliser les données Redux comme dernier recours
      if (user) {
        const fallbackData = {
          nom: user.name,
          email: user.email,
          role: user.role,
          telephone: '',
          adresse: '',
          actif: true
        };
        setProfile(fallbackData);
        form.setFieldsValue(fallbackData);
        messageApi.warning('Profil chargé en mode hors ligne');
      } else {
        messageApi.error(errorMessage);
      }
    } finally {
      setPageLoading(false);
    }
  };

  const handleProfileUpdate = async (values: any) => {
    setLoading(true);
    try {
      console.log('💾 Mise à jour du profil:', values);
      await profilService.updateProfile(values);
      messageApi.success('Profil mis à jour avec succès');
      await fetchProfile();
    } catch (error: any) {
      console.error('❌ Erreur mise à jour profil:', error);
      messageApi.error(
        error.response?.data?.message || 
        'Erreur lors de la mise à jour'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: any) => {
    setLoading(true);
    try {
      console.log('🔐 Changement de mot de passe');
      await profilService.changePassword(values);
      messageApi.success('Mot de passe modifié avec succès');
      passwordForm.resetFields();
    } catch (error: any) {
      console.error('❌ Erreur changement mot de passe:', error);
      messageApi.error(
        error.response?.data?.message || 
        'Erreur lors du changement de mot de passe'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: any) => {
    setAvatarLoading(true);
    try {
      console.log('📸 Upload avatar');
      const formData = new FormData();
      formData.append('avatar', file);
      
      await profilService.updateProfile(formData);
      messageApi.success('Photo de profil mise à jour');
      await fetchProfile();
    } catch (error: any) {
      console.error('❌ Erreur upload avatar:', error);
      messageApi.error(
        error.response?.data?.message || 
        'Erreur lors du téléchargement de la photo'
      );
    } finally {
      setAvatarLoading(false);
    }
    
    return false;
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
                    name="name"
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
                  <Form.Item label="Adresse" name="address">
                    <Input placeholder="Adresse" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item label="À propos" name="bio">
                <TextArea rows={3} placeholder="Une brève description..." maxLength={500} showCount />
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
                  <div style={{ fontWeight: 'bold' }}>
                    {profile?.role?.toUpperCase() || 'NON DÉFINI'}
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ color: '#999', fontSize: 12 }}>Membre depuis</div>
                  <div style={{ fontWeight: 'bold' }}>
                    {profile?.created_at 
                      ? dayjs(profile.created_at).format('DD/MM/YYYY') 
                      : '—'
                    }
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
        </>
      )
    }
  ];

  if (pageLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <div>Chargement du profil...</div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px' }}>
        <Alert
          message="Erreur de chargement"
          description={error}
          type="error"
          showIcon
          action={
            <Button 
              size="small" 
              type="primary"
              icon={<ReloadOutlined />}
              onClick={fetchProfile}
            >
              Réessayer
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {error && (
        <Alert
          message="Mode dégradé"
          description="Certaines fonctionnalités peuvent être limitées"
          type="warning"
          closable
          style={{ marginBottom: 20 }}
        />
      )}
      
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
            {profile?.nom?.substring(0, 2).toUpperCase() || 'U'}
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
        <h2 style={{ marginTop: 16, marginBottom: 4 }}>
          {profile?.nom || user?.name || 'Utilisateur'}
        </h2>
        <p style={{ color: '#666', marginBottom: 8 }}>
          {profile?.email || user?.email || 'email@example.com'}
        </p>
        <Tag color="blue" style={{ textTransform: 'uppercase' }}>
          {profile?.role || user?.role || 'UTILISATEUR'}
        </Tag>
      </div>

      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
};

export default ProfilePage;