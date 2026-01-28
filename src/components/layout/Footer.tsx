import React from 'react';
import { Layout, Row, Col, Typography, Space } from 'antd';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined, 
  LinkedinOutlined,
  WhatsAppOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

const Footer: React.FC = () => {
  return (
    <AntFooter
      style={{
        background: '#141414',
        color: '#fff',
        padding: '48px 0 24px',
        marginTop: 'auto'
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
              À PROPOS
            </Title>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', marginBottom: 12 }}>
              AquaGestion - Solution de gestion pour poissonneries modernes
            </Text>
            <Text style={{ color: 'rgba(255, 255, 255, 0.65)', display: 'block', marginBottom: 16 }}>
              Système sécurisé et intuitif pour la gestion complète de votre activité
            </Text>
            <Space size="middle">
              <a href="#" style={{ color: '#69c0ff', fontSize: 20 }}>
                <FacebookOutlined />
              </a>
              <a href="#" style={{ color: '#69c0ff', fontSize: 20 }}>
                <TwitterOutlined />
              </a>
              <a href="#" style={{ color: '#69c0ff', fontSize: 20 }}>
                <InstagramOutlined />
              </a>
              <a href="#" style={{ color: '#69c0ff', fontSize: 20 }}>
                <LinkedinOutlined />
              </a>
              <a href="#" style={{ color: '#69c0ff', fontSize: 20 }}>
                <WhatsAppOutlined />
              </a>
            </Space>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
              SERVICES
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                'Gestion des stocks',
                'Suivi des ventes',
                'Facturation automatique',
                'Gestion clients',
                'Rapports détaillés',
                'Alertes stock',
                'Transactions mobiles',
                'Tableaux de bord'
              ].map((service, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    • {service}
                  </Text>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
              LIENS RAPIDES
            </Title>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {[
                { name: 'Tableau de bord', path: '/dashboard' },
                { name: 'Produits', path: '/products' },
                { name: 'Stock', path: '/products?filter=stock' },
                { name: 'Ventes', path: '/sales' },
                { name: 'Clients', path: '/clients' },
                { name: 'Fournisseurs', path: '/suppliers' },
                { name: 'Rapports', path: '/reports' },
                { name: 'Paramètres', path: '/settings' }
              ].map((link, index) => (
                <li key={index} style={{ marginBottom: 8 }}>
                  <a 
                    href={link.path} 
                    style={{ 
                      color: 'rgba(255, 255, 255, 0.65)',
                      textDecoration: 'none',
                      transition: 'color 0.3s',
                      ':hover': {
                        color: '#1890ff'
                      }
                    }}
                  >
                    • {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <Title level={4} style={{ color: '#fff', marginBottom: 16 }}>
              CONTACT
            </Title>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <PhoneOutlined style={{ color: '#69c0ff', marginTop: 4 }} />
                <div>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    +229 01 69 35 17 66
                  </Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MailOutlined style={{ color: '#69c0ff', marginTop: 4 }} />
                <div>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    liferopro@gmail.com
                  </Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <EnvironmentOutlined style={{ color: '#69c0ff', marginTop: 4 }} />
                <div>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    Bénin, Abomey-Calavi
                  </Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <ClockCircleOutlined style={{ color: '#69c0ff', marginTop: 4 }} />
                <div>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.65)' }}>
                    Lun-Ven: 8h-18h
                  </Text>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 12, display: 'block' }}>
                    Soutien technique disponible
                  </Text>
                </div>
              </div>
            </Space>
          </Col>
        </Row>

        <Row 
          style={{ 
            marginTop: 48, 
            paddingTop: 24, 
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}
        >
          <Col span={24}>
            <Text style={{ color: 'rgba(255, 255, 255, 0.45)', fontSize: 14 }}>
              © {new Date().getFullYear()} AquaGestion - Version 2.0.2 |
              Tous droits réservés
            </Text>
          </Col>
        </Row>
      </div>
    </AntFooter>
  );
};

export default Footer;