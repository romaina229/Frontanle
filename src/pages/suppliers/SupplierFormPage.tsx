// src/pages/suppliers/SupplierFormPage.tsx - VERSION FINALE CORRIGÉE
import React, { useState, useEffect } from 'react';
import {
  Form, Input, Button, Card, Row, Col, message,
  InputNumber, Select, Switch, Space, Divider, Rate
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined,
  ShopOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const SupplierFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (id) fetchSupplier(id);
  }, [id]);

  const fetchSupplier = async (supplierId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/suppliers/${supplierId}`);
      const supplier = response.data?.data || response.data;
      form.setFieldsValue(supplier);
    } catch (error: any) {
      message.error('Erreur chargement fournisseur');
      navigate('/suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    console.log('[Supplier] Submitting:', values);
    setLoading(true);

    // CORRECTION: Nettoyer les données avant envoi
    const supplierData: any = {
      name: values.name?.trim(),
      contact_person: values.contact_person?.trim(),
      telephone: values.telephone?.trim(),
      actif: values.actif !== undefined ? Boolean(values.actif) : true,
    };

    // Ajouter les champs optionnels seulement s'ils ont une valeur
    if (values.email?.trim()) {
      supplierData.email = values.email.trim();
    }
    
    if (values.address?.trim()) {
      supplierData.address = values.address.trim();
    }
    
    if (values.city?.trim()) {
      supplierData.city = values.city.trim();
    }
    
    if (values.country?.trim()) {
      supplierData.country = values.country.trim();
    }
    
    if (values.type_produits?.trim()) {
      supplierData.type_produits = values.type_produits.trim();
    }
    
    if (values.delai_livraison) {
      supplierData.delai_livraison = Number(values.delai_livraison);
    }
    
    if (values.conditions_paiement?.trim()) {
      supplierData.conditions_paiement = values.conditions_paiement.trim();
    }
    
    // CORRECTION CRITIQUE: evaluation doit être un entier entre 1 et 5
    if (values.evaluation !== undefined && values.evaluation !== null) {
      // Arrondir et s'assurer que c'est entre 1 et 5
      const evalValue = Math.round(Number(values.evaluation));
      if (evalValue >= 1 && evalValue <= 5) {
        supplierData.evaluation = evalValue;
      }
    }
    
    if (values.notes?.trim()) {
      supplierData.notes = values.notes.trim();
    }

    console.log('[Supplier] Cleaned data:', supplierData);

    try {
      if (id) {
        await api.put(`/suppliers/${id}`, supplierData);
        message.success('Fournisseur modifié');
      } else {
        await api.post('/suppliers', supplierData);
        message.success('Fournisseur créé');
      }
      navigate('/suppliers');
    } catch (error: any) {
      console.error('[Supplier] Error details:', error.response?.data);
      
      // Afficher les erreurs de validation spécifiques
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(field => {
          message.error(`${field}: ${errors[field][0]}`);
        });
      } else {
        message.error(error.response?.data?.message || 'Erreur enregistrement');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1><ShopOutlined /> {id ? 'Modifier' : 'Nouveau'} Fournisseur</h1>
          <p style={{ color: '#666' }}>{id ? 'Mise à jour' : 'Ajout'} d'un fournisseur</p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/suppliers')}>Retour</Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ country: 'Bénin', evaluation: 3, actif: true, delai_livraison: 7 }}
        >
          <Divider orientation="left">Informations générales</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Nom du fournisseur *" name="name" rules={[{ required: true, min: 2 }]}>
                <Input placeholder="Ex: Poissons Frais SA" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Personne de contact *" name="contact_person" rules={[{ required: true }]}>
                <Input placeholder="Nom du responsable" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Téléphone *" name="telephone" rules={[{ required: true }]}>
                <Input placeholder="+229 XX XX XX XX" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
                <Input placeholder="contact@fournisseur.com" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Pays" name="country">
                <Input placeholder="Bénin" size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Ville" name="city">
                <Input placeholder="Cotonou" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Adresse" name="address">
                <Input placeholder="Quartier, rue..." size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Informations commerciales</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Type de produits fournis" name="type_produits">
                <Input placeholder="Ex: Poissons d'eau douce, crustacés..." size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Délai de livraison (jours)" name="delai_livraison">
                <InputNumber min={1} max={90} style={{ width: '100%' }} size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Conditions de paiement" name="conditions_paiement">
                <Select size="large" placeholder="Sélectionnez">
                  <Option value="Paiement à la livraison">Paiement à la livraison</Option>
                  <Option value="30 jours">30 jours</Option>
                  <Option value="60 jours">60 jours</Option>
                  <Option value="Avance 50%">Avance 50%</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Évaluation" name="evaluation">
                <Rate allowHalf count={5} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Notes / Remarques" name="notes">
            <TextArea rows={4} placeholder="Informations complémentaires..." />
          </Form.Item>

          <Form.Item label="Fournisseur actif" name="actif" valuePropName="checked">
            <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
          </Form.Item>

          <Divider />
          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
              {id ? 'Enregistrer modifications' : 'Créer fournisseur'}
            </Button>
            <Button onClick={() => navigate('/suppliers')} size="large">Annuler</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default SupplierFormPage;