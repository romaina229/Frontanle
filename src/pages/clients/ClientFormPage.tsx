import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Row, Col } from 'antd';
import { SaveOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';
import { message } from 'antd';

const { TextArea } = Input;

const ClientFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchClient(id);
    }
  }, [id]);

  const fetchClient = async (clientId: string) => {
    try {
      const response = await api.get(`/clients/${clientId}`);
      if (response.data.success && response.data.data) {
        form.setFieldsValue(response.data.data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    const formData = {
      name: values.name,
      telephone: values.telephone,
      email: values.email || null,
      address: values.address || null,
      contact: values.contact || null,
    };

    try {
      if (id) {
        await api.put(`/clients/${id}`, formData);
        message.success('Client modifié avec succès');
      } else {
        await api.post('/clients', formData);
        message.success('Client créé avec succès');
      }

      
      setTimeout(() => {
        navigate('/clients'); // Redirection après succès
      }, 500);
      
    } catch (error: any) {
      console.error('Erreur:', error);
      
      if (error.response?.data?.error) {
        const errorMsg = error.response.data.error;
        const shortError = errorMsg.split('(')[0] || errorMsg;
        message.error(`Erreur: ${shortError}`);
      } else if (error.response?.data?.message) {
        message.error(`Erreur: ${error.response.data.message}`);
      } else {
        message.error('Erreur lors de l\'enregistrement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <h2>{id ? 'Modifier le Client' : 'Nouveau Client'}</h2>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/clients')}>
          Retour
        </Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Nom complet *"
                name="name"
                rules={[{ required: true, message: 'Ce champ est requis' }]}
              >
                <Input placeholder="Nom du client" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Téléphone *"
                name="telephone"
                rules={[{ required: true, message: 'Ce champ est requis' }]}
              >
                <Input placeholder="Téléphone" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[{ type: 'email', message: 'Email invalide' }]}
              >
                <Input type="email" placeholder="Email" />
              </Form.Item>
            </Col>

                        <Col span={12}>
              <Form.Item
                label="Personne de contact"
                name="contact"
                rules={[{ type: 'string', message: 'Nom invalide' }]}
              >
                <Input placeholder="Nom de la personne de contact" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Adresse"
                name="address"
              >
                <Input placeholder="Adresse" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />}>
              Enregistrer
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ClientFormPage;