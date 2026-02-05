// src/pages/settings/SettingsPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Card, Switch, Select, App, Spin } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { settingsService } from '../../services/settingsService';
import { profilService } from '../../services/profileService';

const { Option } = Select;
const { TextArea } = Input;

const SettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [notificationsForm] = Form.useForm();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setPageLoading(true);
    try {
      // Charger les données du profil
      const profileResponse = await profilService.getProfile();
      if (profileResponse?.data) {
        profileForm.setFieldsValue(profileResponse.data);
      }

      // Charger les paramètres de l'application
      try {
        const settingsResponse = await settingsService.getAll();
        if (settingsResponse?.data) {
          settingsForm.setFieldsValue(settingsResponse.data);
        }
      } catch (error) {
        console.log('Paramètres non disponibles, utilisation des valeurs par défaut');
      }

    } catch (error: any) {
      console.error('Erreur chargement données:', error);
      message.warning('Certaines données n\'ont pas pu être chargées');
    } finally {
      setPageLoading(false);
    }
  };

  const handleProfileSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('💾 Mise à jour profil:', values);
      await profilService.updateProfile(values);
      message.success('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('❌ Erreur profil:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors de la mise à jour du profil'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('⚙️ Mise à jour paramètres:', values);
      await settingsService.update(values);
      message.success('Paramètres sauvegardés avec succès');
    } catch (error: any) {
      console.error('❌ Erreur paramètres:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors de la sauvegarde des paramètres'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('🔔 Mise à jour notifications:', values);
      // Implémenter l'enregistrement des préférences de notifications
      await settingsService.update({ notifications: values });
      message.success('Préférences de notifications sauvegardées');
    } catch (error: any) {
      console.error('❌ Erreur notifications:', error);
      message.error(
        error.response?.data?.message || 
        'Erreur lors de la sauvegarde des préférences'
      );
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: 'Mon Profil',
      children: (
        <Card>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileSubmit}
          >
            <Form.Item
              label="Nom complet *"
              name="name"
              rules={[{ required: true, message: 'Nom requis' }]}
            >
              <Input placeholder="Votre nom complet" />
            </Form.Item>
            
            <Form.Item
              label="Email *"
              name="email"
              rules={[
                { required: true, message: 'Email requis' },
                { type: 'email', message: 'Email invalide' }
              ]}
            >
              <Input type="email" placeholder="votre.email@exemple.com" />
            </Form.Item>
            
            <Form.Item 
              label="Téléphone" 
              name="telephone"
            >
              <Input placeholder="+229 XX XX XX XX" />
            </Form.Item>

            <Form.Item 
              label="Adresse" 
              name="adresse"
            >
              <Input placeholder="Votre adresse" />
            </Form.Item>

            <Form.Item 
              label="Bio / À propos" 
              name="bio"
            >
              <TextArea 
                rows={3} 
                placeholder="Une brève description de vous..."
                maxLength={500}
                showCount
              />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Enregistrer le profil
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'app',
      label: 'Application',
      children: (
        <Card>
          <Form
            form={settingsForm}
            layout="vertical"
            onFinish={handleSettingsSubmit}
            initialValues={{
              app_name: 'AquaGestion',
              currency: 'FCFA',
              items_per_page: 10,
              timezone: 'Africa/Porto-Novo'
            }}
          >
            <Form.Item 
              label="Nom de l'application" 
              name="app_name"
              rules={[{ required: true, message: 'Nom requis' }]}
            >
              <Input placeholder="Nom de votre application" />
            </Form.Item>
            
            <Form.Item 
              label="Devise *" 
              name="currency"
              rules={[{ required: true, message: 'Devise requise' }]}
            >
              <Select>
                <Option value="FCFA">FCFA (Franc CFA)</Option>
                <Option value="EUR">EUR (Euro)</Option>
                <Option value="USD">USD (Dollar)</Option>
                <Option value="GBP">GBP (Livre Sterling)</Option>
              </Select>
            </Form.Item>
            
            <Form.Item 
              label="Fuseau horaire" 
              name="timezone"
            >
              <Select>
                <Option value="Africa/Porto-Novo">Afrique/Porto-Novo (GMT+1)</Option>
                <Option value="Europe/Paris">Europe/Paris (GMT+1)</Option>
                <Option value="UTC">UTC (GMT+0)</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              label="Éléments par page" 
              name="items_per_page"
              rules={[{ required: true, message: 'Valeur requise' }]}
            >
              <Select>
                <Option value={5}>5</Option>
                <Option value={10}>10</Option>
                <Option value={20}>20</Option>
                <Option value={50}>50</Option>
                <Option value={100}>100</Option>
              </Select>
            </Form.Item>

            <Form.Item 
              label="Langue de l'interface" 
              name="language"
              initialValue="fr"
            >
              <Select>
                <Option value="fr">Français</Option>
                <Option value="en">English</Option>
              </Select>
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Enregistrer les paramètres
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      key: 'notifications',
      label: 'Notifications',
      children: (
        <Card>
          <Form
            form={notificationsForm}
            layout="vertical"
            onFinish={handleNotificationsSubmit}
            initialValues={{
              stock_alerts: true,
              new_sales: true,
              low_stock_threshold: 10,
              email_notifications: true,
              push_notifications: false
            }}
          >
            <Form.Item 
              label="Alertes de stock faible" 
              name="stock_alerts" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item 
              label="Notifications des nouvelles ventes" 
              name="new_sales" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              label="Seuil d'alerte de stock" 
              name="low_stock_threshold"
              help="Quantité en dessous de laquelle vous serez alerté"
            >
              <Input 
                type="number" 
                min={1} 
                max={100}
                addonAfter="unités"
              />
            </Form.Item>

            <Form.Item 
              label="Notifications par email" 
              name="email_notifications" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item 
              label="Notifications push (navigateur)" 
              name="push_notifications" 
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Sauvegarder les préférences
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    }
  ];

  if (pageLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '60vh' 
      }}>
        <Spin size="large" tip="Chargement des paramètres..." />
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Paramètres</h2>
      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
};

export default SettingsPage;