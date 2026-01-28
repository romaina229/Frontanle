// src/pages/sales/SaleFormPage.tsx - VERSION FINALE CORRIGÉE
import React, { useState, useEffect } from 'react';
import {
  Form, Input, Select, Button, Card, Table, InputNumber,
  Row, Col, message, Space, Divider, Modal, AutoComplete,
  Typography, Alert
} from 'antd';
import {
  SaveOutlined, ArrowLeftOutlined, PlusOutlined,
  DeleteOutlined, ShoppingCartOutlined, UserOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Option } = Select;
const { Text } = Typography;
const { TextArea } = Input;

interface Product {
  id: number;
  name: string;
  unit_price: number;
  stock_quantity: number;
  unit: string;
}

interface Client {
  id: number;
  name: string;
  telephone: string;
}

interface SaleItem {
  key: string;
  product_id: number;
  product_name: string;
  unit_price: number;
  quantity: number;
  subtotal: number;
  available_stock: number;
  unit: string;
}

const SaleFormPage: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [clientModalVisible, setClientModalVisible] = useState(false);
  const [newClientForm] = Form.useForm();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [clientSearchOptions, setClientSearchOptions] = useState<any[]>([]);

  useEffect(() => {
    fetchProducts();
    fetchClients();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { per_page: 1000 } });
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      const availableProducts = Array.isArray(data) ? data.filter((p: Product) => p.stock_quantity > 0) : [];
      setProducts(availableProducts);
      if (availableProducts.length === 0) message.warning('Aucun produit disponible');
    } catch (error: any) {
      console.error('[Sales] Products error:', error);
      message.error(error.response?.data?.message || 'Erreur chargement produits');
      setProducts([]);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients', { params: { per_page: 1000 } });
      const data = response.data?.data?.data || response.data?.data || response.data || [];
      setClients(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.error('[Sales] Clients error:', error);
      message.error('Erreur chargement clients');
      setClients([]);
    }
  };

  const handleClientSearch = (value: string) => {
    if (value.length >= 2) {
      const filtered = clients.filter(c =>
        c.telephone?.includes(value) ||
        c.name?.toLowerCase().includes(value.toLowerCase())
      );
      setClientSearchOptions(filtered.map(c => ({
        value: c.id.toString(),
        label: `${c.name} - ${c.telephone}`
      })));
    } else {
      setClientSearchOptions([]);
    }
  };

  const handleClientSelect = (value: string) => {
    const clientId = parseInt(value);
    const client = clients.find(c => c.id === clientId);
    if (client) {
      setSelectedClientId(clientId);
      form.setFieldsValue({
        client_id: clientId,
        client_name: client.name,
        client_phone: client.telephone
      });
      message.success(`Client: ${client.name}`);
    }
  };

  const handleCreateClient = async (values: any) => {
    try {
      const response = await api.post('/clients', {
        name: values.name,
        telephone: values.telephone,
        email: values.email || null,
        address: values.address || null,
        contact: values.name
      });
      const newClient = response.data?.data || response.data;
      message.success('Client créé');
      setClients([...clients, newClient]);
      setSelectedClientId(newClient.id);
      form.setFieldsValue({
        client_id: newClient.id,
        client_name: newClient.name,
        client_phone: newClient.telephone
      });
      setClientModalVisible(false);
      newClientForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur création client');
    }
  };

  const handleAddProduct = () => {
    if (!selectedProduct) {
      message.warning('Sélectionnez un produit');
      return;
    }
    if (quantity <= 0 || quantity > selectedProduct.stock_quantity) {
      message.error(`Stock: ${selectedProduct.stock_quantity} ${selectedProduct.unit}`);
      return;
    }

    const existing = saleItems.find(item => item.product_id === selectedProduct.id);
    if (existing) {
      const newQty = existing.quantity + quantity;
      if (newQty > selectedProduct.stock_quantity) {
        message.error('Stock insuffisant');
        return;
      }
      setSaleItems(saleItems.map(item =>
        item.product_id === selectedProduct.id
          ? { ...item, quantity: newQty, subtotal: item.unit_price * newQty }
          : item
      ));
    } else {
      setSaleItems([...saleItems, {
        key: `${selectedProduct.id}-${Date.now()}`,
        product_id: selectedProduct.id,
        product_name: selectedProduct.name,
        unit_price: selectedProduct.unit_price,
        quantity,
        subtotal: selectedProduct.unit_price * quantity,
        available_stock: selectedProduct.stock_quantity,
        unit: selectedProduct.unit
      }]);
    }
    setSelectedProduct(null);
    setQuantity(1);
  };

  const handleSubmit = async (values: any) => {
    if (saleItems.length === 0) {
      message.warning('Ajoutez au moins un produit');
      return;
    }

    const saleData: any = {
      payment_method: values.payment_method || 'cash',
      payment_reference: values.payment_reference || null,
      notes: values.notes || null,
      items: saleItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    if (selectedClientId) {
      saleData.client_id = selectedClientId;
    } else if (values.client_name && values.client_phone) {
      saleData.client_name = values.client_name;
      saleData.client_phone = values.client_phone;
    } else {
      saleData.client_name = 'Client anonyme';
      saleData.client_phone = 'N/A';
    }

    console.log('[Sales] Sending:', saleData);
    setLoading(true);
    try {
      const response = await api.post('/sales', saleData);
      const sale = response.data?.data?.sale || response.data?.data || response.data;
      message.success('Vente enregistrée!');
      Modal.success({
        title: 'Succès',
        content: `Référence: ${sale.reference || 'N/A'}`,
        onOk: () => navigate('/sales')
      });
    } catch (error: any) {
      console.error('[Sales] Error:', error.response?.data);
      message.error(error.response?.data?.message || 'Erreur enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'Produit', dataIndex: 'product_name', key: 'product_name' },
    { title: 'Prix', dataIndex: 'unit_price', key: 'unit_price', render: (p: number) => `${p.toLocaleString()} FCFA` },
    {
      title: 'Quantité',
      key: 'quantity',
      render: (_: any, record: SaleItem) => (
        <InputNumber
          min={1}
          max={record.available_stock}
          value={record.quantity}
          onChange={(val) => {
            const updated = saleItems.map(i =>
              i.key === record.key
                ? { ...i, quantity: val || 1, subtotal: i.unit_price * (val || 1) }
                : i
            );
            setSaleItems(updated);
          }}
          addonAfter={record.unit}
        />
      )
    },
    { title: 'Sous-total', dataIndex: 'subtotal', key: 'subtotal', render: (s: number) => <Text strong>{s.toLocaleString()} FCFA</Text> },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: SaleItem) => (
        <Button type="text" danger icon={<DeleteOutlined />} onClick={() => setSaleItems(saleItems.filter(i => i.key !== record.key))}>
          Retirer
        </Button>
      )
    }
  ];

  const total = saleItems.reduce((sum, item) => sum + item.subtotal, 0);

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1><ShoppingCartOutlined /> Nouvelle Vente</h1>
          <p style={{ color: '#666' }}>Enregistrez une transaction</p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/sales')}>Retour</Button>
      </div>

      <Form form={form} layout="vertical" onFinish={handleSubmit} initialValues={{ payment_method: 'cash' }}>
        <Row gutter={24}>
          <Col xs={24} lg={10}>
            <Card title={<><UserOutlined /> Client</>} style={{ marginBottom: 16 }}>
              <Form.Item label="Rechercher">
                <AutoComplete
                  options={clientSearchOptions}
                  onSearch={handleClientSearch}
                  onSelect={handleClientSelect}
                  placeholder="Nom ou téléphone..."
                  allowClear
                />
              </Form.Item>
              <Button type="dashed" icon={<PlusOutlined />} onClick={() => setClientModalVisible(true)} block style={{ marginBottom: 16 }}>
                Nouveau client
              </Button>
              <Divider>OU</Divider>
              <Form.Item name="client_id" hidden><Input /></Form.Item>
              <Form.Item label="Nom" name="name">
                <Input placeholder="Optionnel" disabled={!!selectedClientId} />
              </Form.Item>
              <Form.Item label="Téléphone" name="telephone">
                <Input placeholder="Optionnel" disabled={!!selectedClientId} />
              </Form.Item>
              {selectedClientId && (
                <Alert message="Client sélectionné" type="success" closable onClose={() => {
                  setSelectedClientId(null);
                  form.setFieldsValue({ client_id: null, client_name: '', client_phone: '' });
                }} />
              )}
            </Card>

            <Card title="Paiement">
              <Form.Item label="Méthode" name="payment_method" rules={[{ required: true }]}>
                <Select>
                  <Option value="cash">Espèces</Option>
                  <Option value="mobile_money">Mobile Money</Option>
                  <Option value="card">Carte</Option>
                  <Option value="credit">Crédit</Option>
                </Select>
              </Form.Item>
              <Form.Item label="Référence" name="payment_reference">
                <Input placeholder="Optionnel" />
              </Form.Item>
              <Form.Item label="Notes" name="notes">
                <TextArea rows={3} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} lg={14}>
            <Card title={<><ShoppingCartOutlined /> Produits</>}>
              <Row gutter={16} style={{ marginBottom: 16 }}>
                <Col xs={24} md={12}>
                  <Select
                    showSearch
                    style={{ width: '100%' }}
                    placeholder="Produit..."
                    value={selectedProduct?.id}
                    onChange={(val) => setSelectedProduct(products.find(p => p.id === val) || null)}
                    filterOption={(input, option: any) => option?.children?.toLowerCase().includes(input.toLowerCase())}
                  >
                    {products.map(p => (
                      <Option key={p.id} value={p.id}>
                        {p.name} - {p.unit_price} FCFA ({p.stock_quantity} {p.unit})
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col xs={24} md={6}>
                  <InputNumber
                    min={1}
                    max={selectedProduct?.stock_quantity || 1}
                    value={quantity}
                    onChange={(val) => setQuantity(val || 1)}
                    style={{ width: '100%' }}
                    addonAfter={selectedProduct?.unit}
                  />
                </Col>
                <Col xs={24} md={6}>
                  <Button type="primary" icon={<PlusOutlined />} onClick={handleAddProduct} disabled={!selectedProduct} block>
                    Ajouter
                  </Button>
                </Col>
              </Row>

              <Table
                columns={columns}
                dataSource={saleItems}
                pagination={false}
                locale={{ emptyText: 'Panier vide' }}
                summary={() => (
                  <Table.Summary>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}><Text strong>Total</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={1}><Text strong style={{ fontSize: 18, color: '#1890ff' }}>{total.toLocaleString()} FCFA</Text></Table.Summary.Cell>
                      <Table.Summary.Cell index={2} />
                    </Table.Summary.Row>
                  </Table.Summary>
                )}
              />

              <Divider />
              <Space>
                <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading} disabled={saleItems.length === 0} size="large">
                  Enregistrer
                </Button>
                <Button onClick={() => navigate('/sales')} size="large">Annuler</Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </Form>

      <Modal title="Nouveau Client" open={clientModalVisible} onCancel={() => setClientModalVisible(false)} footer={null}>
        <Form form={newClientForm} layout="vertical" onFinish={handleCreateClient}>
          <Form.Item label="Nom" name="name" rules={[{ required: true, min: 2 }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Téléphone" name="telephone" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Email" name="email" rules={[{ type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Adresse" name="address">
            <TextArea rows={2} />
          </Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">Créer</Button>
            <Button onClick={() => setClientModalVisible(false)}>Annuler</Button>
          </Space>
        </Form>
      </Modal>
    </div>
  );
};

export default SaleFormPage;