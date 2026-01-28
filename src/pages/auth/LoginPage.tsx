import React, { useState } from 'react';
import { 
  Form, 
  Input, 
  Button, 
  Card, 
  Typography, 
  Divider, 
  Alert,
  Row, 
  Col,
  Space
} from 'antd';
import { 
  UserOutlined, 
  LockOutlined, 
  FacebookOutlined, 
  GoogleOutlined,
  TwitterOutlined
} from '@ant-design/icons';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-hot-toast';

import { login, clearError, selectAuthLoading, selectAuthError } from '../../store/slices/authSlice';

const { Title, Text } = Typography;

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Etats de chargement et d'erreur
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);
  
  const [form] = Form.useForm();
  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const onFinish = async (values: any) => {
    try {
      await dispatch(login(values)).unwrap();
      toast.success('Connexion réussie !');
      navigate(from, { replace: true });
    } catch (error: any) {
      toast.error(error || 'Échec de connexion');
    }
    finally { form.setFieldsValue({ password: '' }); }
  };

  const handleSocialLogin = (provider: string) => {
    toast.info(`Connexion ${provider} en développement`);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Row justify="center" style={{ width: '100%', maxWidth: 1200 }}>
        <Col xs={24} lg={12}>
          <div style={{ padding: '40px', color: 'white' }}>
            <Title level={1} style={{ color: 'white', marginBottom: 20 }}>
              AquaGestion
            </Title>
            <Title level={3} style={{ color: 'white', fontWeight: 'normal' }}>
              Système de gestion complète pour poissonnerie
            </Title>
            
            <div style={{ marginTop: 40 }}>
              {[
                'Gestion des stocks en temps réel',
                'Transactions MTN, Moov, Celtis',
                'Facturation automatique',
                'Tableaux de bord interactifs',
                'Rapports détaillés',
                'Interface responsive'
              ].map((feature, index) => (
                <div key={index} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  marginBottom: 12 
                }}>
                  <div style={{
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12
                  }}>
                    <Text style={{ color: 'white', fontSize: 12 }}>✓</Text>
                  </div>
                  <Text style={{ color: 'white', fontSize: 16 }}>{feature}</Text>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 60, opacity: 0.8 }}>
              <Text style={{ color: 'white', fontSize: 14 }}>
                Version 2.0.2 • Développé par LIFERO
              </Text>
            </div>
          </div>
        </Col>

        <Col xs={24} lg={12}>
          <Card style={{
            borderRadius: 12,
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <div style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
                <UserOutlined style={{ fontSize: 36, color: 'white' }} />
              </div>
              
              <Title level={2} style={{ marginBottom: 8 }}>
                Bienvenue
              </Title>
              <Text type="secondary">
                Connectez-vous à votre compte
              </Text>
            </div>

            {error && (
              <Alert
                message="Erreur de connexion"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: 24 }}
                closable
                onClose={() => dispatch(clearError())}
              />
            )}

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: 'Email invalide' }
                ]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Email"
                  autoComplete="email"
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: 'Veuillez saisir votre mot de passe' },
                  { min: 6, message: 'Minimum 6 caractères' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Mot de passe"
                  autoComplete="current-password"
                />
              </Form.Item>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                marginBottom: 24 
              }}>
                <Form.Item name="remember" valuePropName="checked" style={{ margin: 0 }}>
                  <label>
                    <input type="checkbox" style={{ marginRight: 8 }} />
                    Se souvenir de moi
                  </label>
                </Form.Item>
                
                <Link to="/forgot-password" style={{ color: '#1890ff' }}>
                  Mot de passe oublié ?
                </Link>
              </div>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  /*loading={loading}*/
                  block
                  size="large"
                >
                  Se connecter
                </Button>
              </Form.Item>
            </Form>

            <Divider plain>Ou connectez-vous avec</Divider>

            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                icon={<FacebookOutlined />}
                onClick={() => handleSocialLogin('Facebook')}
                block
                size="large"
                style={{ background: '#1877f2', color: 'white', border: 'none' }}
              >
                Facebook
              </Button>
              
              <Button
                icon={<GoogleOutlined />}
                onClick={() => handleSocialLogin('Google')}
                block
                size="large"
                style={{ background: '#db4437', color: 'white', border: 'none' }}
              >
                Google
              </Button>
              
              <Button
                icon={<TwitterOutlined />}
                onClick={() => handleSocialLogin('Twitter')}
                block
                size="large"
                style={{ background: '#1da1f2', color: 'white', border: 'none' }}
              >
                Twitter
              </Button>
            </Space>

            <div style={{ textAlign: 'center', marginTop: 30 }}>
              <Text type="secondary">
                Pas encore de compte ?{' '}
                <Link to="/register" style={{ color: '#1890ff', fontWeight: 500 }}>
                  S'inscrire
                </Link>
              </Text>
            </div>

            <div style={{ 
              textAlign: 'center', 
              marginTop: 20, 
              paddingTop: 20, 
              borderTop: '1px solid #f0f0f0' 
            }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                En vous connectant, vous acceptez nos{' '}
                <Link to="/terms" style={{ color: '#1890ff' }}>conditions d'utilisation</Link>
                {' '}et notre{' '}
                <Link to="/privacy" style={{ color: '#1890ff' }}>politique de confidentialité</Link>
              </Text>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage;