// src/pages/settings/SettingsPage.tsx - VERSION FINALE CORRIGÉE
import React, { useState, useEffect } from 'react';
import { Tabs, Form, Input, Button, Card, Switch, Select, App, Spin, Alert } from 'antd';
import { SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { settingsService } from '../../services/settingsService';
import { profilService } from '../../services/profileService';

const { Option } = Select;
const { TextArea } = Input;

const SettingsPage: React.FC = () => {
  const { message } = App.useApp();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [profileForm] = Form.useForm();
  const [settingsForm] = Form.useForm();
  const [notificationsForm] = Form.useForm();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setPageLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Chargement des données initiales...');
      
      // Charger les données du profil
      try {
        const profileResponse = await profilService.getProfile();
        console.log('📦 Profil:', profileResponse);
        
        if (profileResponse?.data) {
          profileForm.setFieldsValue(profileResponse.data);
        } else if (user) {
          // Utiliser les données Redux comme fallback
          profileForm.setFieldsValue({
            nom: user.name,
            email: user.email,
            telephone: user.telephone || '',
           // adresse: user.address || ''
          });
        }
      } catch (profileError: any) {
        console.warn('⚠️ Erreur chargement profil:', profileError);
        
        // Utiliser les données Redux
        if (user) {
          profileForm.setFieldsValue({
            nom: user.name,
            email: user.email,
            telephone: user.telephone || '',
            //adresse: user.address || ''
          });
        }
      }

      // Charger les paramètres de l'application
      try {
        const settingsResponse = await settingsService.getAll();
        console.log('⚙️ Paramètres:', settingsResponse);
        
        if (settingsResponse?.data) {
          settingsForm.setFieldsValue(settingsResponse.data);
        }
      } catch (settingsError: any) {
        console.warn('⚠️ Paramètres non disponibles:', settingsError);
        // Utiliser les valeurs par défaut (déjà définies dans initialValues)
      }

      console.log('✅ Données chargées');
      
    } catch (error: any) {
      console.error('❌ Erreur chargement données:', error);
      const errorMsg = error.response?.data?.message || 
                      'Certaines données n\'ont pas pu être chargées';
      setError(errorMsg);
      message.warning(errorMsg);
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
      
      // Vérifier si le service settings existe
      if (settingsService && typeof settingsService.update === 'function') {
        await settingsService.update(values);
        message.success('Paramètres sauvegardés avec succès');
      } else {
        // Alternative: sauvegarder via une autre méthode
        console.warn('⚠️ Service settings non disponible, sauvegarde locale');
        localStorage.setItem('app_settings', JSON.stringify(values));
        message.success('Paramètres sauvegardés localement');
      }
    } catch (error: any) {
      console.error('❌ Erreur paramètres:', error);
      
      // Si l'API échoue, sauvegarder localement
      try {
        localStorage.setItem('app_settings', JSON.stringify(values));
        message.warning('Paramètres sauvegardés localement (serveur indisponible)');
      } catch (localError) {
        message.error('Erreur lors de la sauvegarde des paramètres');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsSubmit = async (values: any) => {
    setLoading(true);
    try {
      console.log('🔔 Mise à jour notifications:', values);
      
      // Sauvegarder les préférences
      if (settingsService && typeof settingsService.update === 'function') {
        await settingsService.update({ notifications: values });
        message.success('Préférences de notifications sauvegardées');
      } else {
        localStorage.setItem('notification_settings', JSON.stringify(values));
        message.success('Préférences sauvegardées localement');
      }
    } catch (error: any) {
      console.error('❌ Erreur notifications:', error);
      
      // Fallback local
      try {
        localStorage.setItem('notification_settings', JSON.stringify(values));
        message.warning('Préférences sauvegardées localement');
      } catch (localError) {
        message.error('Erreur lors de la sauvegarde');
      }
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
              name="nom"
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
            
            <Form.Item label="Téléphone" name="telephone">
              <Input placeholder="+229 XX XX XX XX" />
            </Form.Item>

            <Form.Item label="Adresse" name="address">
              <Input placeholder="Votre adresse" />
            </Form.Item>

            <Form.Item label="Bio / À propos" name="bio">
              <TextArea 
                rows={3} 
                placeholder="Une brève description..."
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
              timezone: 'Africa/Porto-Novo',
              language: 'fr'
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
            
            <Form.Item label="Fuseau horaire" name="timezone">
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

            <Form.Item label="Langue de l'interface" name="language">
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
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 16
      }}>
        <Spin size="large" />
        <div>Chargement des paramètres...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ margin: 0 }}>Paramètres</h2>
        <Button 
          icon={<ReloadOutlined />}
          onClick={loadInitialData}
          loading={pageLoading}
        >
          Actualiser
        </Button>
      </div>
      
      {error && (
        <Alert
          message="Mode dégradé"
          description="Certaines fonctionnalités peuvent être limitées. Les modifications seront sauvegardées localement."
          type="warning"
          closable
          style={{ marginBottom: 20 }}
        />
      )}
      
      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
};

export default SettingsPage;