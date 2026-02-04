// src/pages/SettingsPage.tsx
import React, { useState } from 'react';
import { Tabs, Form, Input, Button, Card, Switch, Select, App } from 'antd';
import { SaveOutlined, LockOutlined, NotificationOutlined } from '@ant-design/icons';
import { settingsService } from '../../services/settingsService';
import { profilService } from '../../services/profileService';

const { Option } = Select;
const { TextArea } = Input;

const SettingsPage: React.FC = () => {
  const { message } = App.useApp(); // AJOUTER CETTE LIGNE
  const [loading, setLoading] = useState(false);
  const [profileForm] = Form.useForm();
  const [settingsForm] = Form.useForm();

  const handleProfileSubmit = async (values: any) => {
    setLoading(true);
    try {
      await profilService.updateProfile(values);
      message.success('Profil mis à jour');
    } catch (error) {
      message.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSubmit = async (values: any) => {
    setLoading(true);
    try {
      await settingsService.update(values);
      message.success('Paramètres sauvegardés');
    } catch (error) {
      message.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const tabItems = [
    {
      key: 'profile',
      label: 'Profil',
      children: (
        <Card>
          <Form
            form={profileForm}
            layout="vertical"
            onFinish={handleProfileSubmit}
          >
            <Form.Item
              label="Nom complet"
              name="nom"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item
              label="Email"
              name="email"
              rules={[{ required: true, type: 'email' }]}
            >
              <Input />
            </Form.Item>
            
            <Form.Item label="Téléphone" name="telephone">
              <Input />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Enregistrer
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
          >
            <Form.Item label="Nom de l'application" name="app_name">
              <Input />
            </Form.Item>
            
            <Form.Item label="Devise" name="currency">
              <Select>
                <Option value="FCFA">FCFA</Option>
                <Option value="EUR">EUR</Option>
                <Option value="USD">USD</Option>
              </Select>
            </Form.Item>
            
            <Form.Item label="Éléments par page" name="items_per_page">
              <Input type="number" min={5} max={100} />
            </Form.Item>
            
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<SaveOutlined />}
              >
                Enregistrer
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
          <Form layout="vertical">
            <Form.Item label="Alertes stock" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            
            <Form.Item label="Nouvelles ventes" valuePropName="checked">
              <Switch defaultChecked />
            </Form.Item>
            
            <Button type="primary" icon={<SaveOutlined />}>
              Sauvegarder
            </Button>
          </Form>
        </Card>
      )
    }
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 20 }}>Paramètres</h2>
      <Tabs defaultActiveKey="profile" items={tabItems} />
    </div>
  );
};

export default SettingsPage;