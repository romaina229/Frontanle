// src/pages/products/ProductFormPage.tsx - VERSION OPTIMISÉE
import React, { useState, useEffect } from 'react';
import {
  Form, Input, InputNumber, Select, Button, Card,
  Row, Col, message, Divider, Tag, Space
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined,
  WarningOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

const { TextArea } = Input;
const { Option } = Select;

const ProductFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [margin, setMargin] = useState<number>(0);

  const units = [
    { value: 'kg', label: 'Kilogramme (kg)' },
    { value: 'g', label: 'Gramme (g)' },
    { value: 'piece', label: 'Pièce' },
    { value: 'litre', label: 'Litre (L)' },
    { value: 'carton', label: 'Carton' },
    { value: 'sac', label: 'Sac' }
  ];

  useEffect(() => {
    fetchCategories();
    if (id) fetchProduct(id);
  }, [id]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      const categoriesData = Array.isArray(data) ? data : [];
      console.log('[Product] Categories loaded:', categoriesData.length);
      setCategories(categoriesData);
      if (categoriesData.length === 0) {
        message.warning({
          content: 'Aucune catégorie. Créez-en une d\'abord dans le menu Catégories!',
          duration: 5,
          icon: <WarningOutlined style={{ color: '#faad14' }} />
        });
      }
    } catch (error: any) {
      console.error('[Product] Categories error:', error);
      message.error('Erreur chargement catégories');
      setCategories([]);
    }
  };

  const fetchProduct = async (productId: string) => {
    setLoading(true);
    try {
      const response = await api.get(`/products/${productId}`);
      const product = response.data?.data || response.data;
      form.setFieldsValue(product);
      if (product.unit_price > 0) calculateMargin(product.unit_price, product.unit_price);
    } catch (error: any) {
      message.error('Erreur chargement produit');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const calculateMargin = (achat: number, vente: number) => {
    if (achat > 0) {
      const marge = ((vente - achat) / achat) * 100;
      setMargin(Number(marge.toFixed(2)));
    } else {
      setMargin(0);
    }
  };

  const handleSubmit = async (values: any) => {
    console.log('[Product] Submitting:', values);

    if (categories.length === 0) {
      message.error('Créez d\'abord une catégorie!');
      return;
    }

    setLoading(true);
    const productData = {
      name: values.name,
      description: values.description || null,
      category_id: values.category_id,
      unit_price: values.unit_price,
      stock_quantity: values.stock_quantity,
      unit: values.unit,
      alert_threshold: values.alert_threshold,
      status: values.stock_quantity > 0 ? 'available' : 'out_of_stock'
    };

    console.log('[Product] Sending:', productData);

    try {
      if (id) {
        await api.put(`/products/${id}`, productData);
        message.success('Produit modifié');
      } else {
        await api.post('/products', productData);
        message.success('Produit créé');
      }
      navigate('/products');
    } catch (error: any) {
      console.error('[Product] Error:', error.response?.data);
      message.error(error.response?.data?.message || 'Erreur enregistrement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1>{id ? 'Modifier' : 'Nouveau'} Produit</h1>
          <p style={{ color: '#666' }}>{id ? 'Mise à jour' : 'Ajout'} d'un produit</p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>Retour</Button>
      </div>

      <Card>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={() => {
            const values = form.getFieldsValue();
            if (values.unit_price) calculateMargin(values.unit_price, values.unit_price);
          }}
          initialValues={{
            stock_quantity: 0,
            alert_threshold: 5,
            unit: 'kg',
            unit_price: 0
          }}
        >
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Nom *" name="name" rules={[{ required: true, min: 2 }]}>
                <Input placeholder="Ex: Tilapia frais" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Catégorie *" name="category_id" rules={[{ required: true }]}>
                <Select
                  size="large"
                  placeholder="Sélectionnez"
                  showSearch
                  optionFilterProp="children"
                  notFoundContent={categories.length === 0 ? 'Créez une catégorie d\'abord!' : 'Aucune catégorie'}
                  disabled={categories.length === 0}
                >
                  {categories.map(cat => (
                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Description" name="description">
            <TextArea rows={3} placeholder="Description..." maxLength={500} />
          </Form.Item>

          <Divider orientation="left">Informations vente</Divider>
          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item label="Prix (FCFA) *" name="unit_price" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  formatter={val => `${val}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Unité *" name="unit" rules={[{ required: true }]}>
                <Select size="large">
                  {units.map(u => <Option key={u.value} value={u.value}>{u.label}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item label="Marge">
                <div style={{ padding: 11, border: '1px solid #d9d9d9', borderRadius: 6, background: '#fafafa' }}>
                  <Tag color={margin > 0 ? 'success' : 'default'}>{margin}%</Tag>
                </div>
              </Form.Item>
            </Col>
          </Row>

          <Divider orientation="left">Stock</Divider>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item label="Quantité *" name="stock_quantity" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item label="Seuil d'alerte *" name="alert_threshold" rules={[{ required: true, type: 'number', min: 0 }]}>
                <InputNumber style={{ width: '100%' }} size="large" min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} size="large">
              {id ? 'Enregistrer' : 'Créer'}
            </Button>
            <Button onClick={() => navigate('/products')} size="large">Annuler</Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default ProductFormPage;