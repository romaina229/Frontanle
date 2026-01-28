// src/pages/CategoriesPage.tsx - Version corrigée
import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Input, Tag, Card, Space, Popconfirm, 
  message, Modal, Form, Spin, Row, Col 
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { categoryService } from '../../services/categoryService';
import ColorPicker from '../../components/common/ColorPicker';

const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  const columns = [
    {
      title: 'Couleur',
      dataIndex: 'couleur',
      key: 'couleur',
      width: 80,
      render: (color: string) => (
        <div style={{
          width: 24,
          height: 24,
          backgroundColor: color || '#1890ff',
          borderRadius: 4,
          border: '1px solid #ddd'
        }} />
      ),
    },
    {
      title: 'Nom',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text: string) => 
        text ? (text.length > 50 ? `${text.substring(0, 50)}...` : text) : '-',
    },
    {
      title: 'Statut',
      dataIndex: 'actif',
      key: 'actif',
      width: 100,
      render: (actif: boolean) => (
        <Tag color={actif ? 'green' : 'red'}>
          {actif ? 'Actif' : 'Inactif'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (text: string, record: any) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => editCategory(record)}
          />
          <Popconfirm
            title="Supprimer cette catégorie?"
            description="Êtes-vous sûr de vouloir supprimer cette catégorie ? Cette action est irréversible."
            onConfirm={() => deleteCategory(record.id)}
            okText="Supprimer"
            cancelText="Annuler"
            okType="danger"
          >
            <Button 
              size="small" 
              danger 
              icon={<DeleteOutlined />} 
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoryService.getAll();
      console.log('Réponse API:', response);
      
      // Essayer différentes structures de réponse
      let categoriesData: any[] = [];
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        categoriesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        categoriesData = response.data;
      } else if (Array.isArray(response)) {
        categoriesData = response;
      }
      
      console.log('Catégories extraites:', categoriesData);
      setCategories(categoriesData);
      
    } catch (error) {
      console.error('Erreur complète:', error);
      message.error('Erreur lors du chargement des catégories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const editCategory = (category: any) => {
    console.log('Modification catégorie:', category);
    setEditingCategory(category);
    
    // Pré-remplir le formulaire avec les données de la catégorie
    // Note: Laravel retourne 'name' mais nous affichons 'nom' dans le frontend
    form.setFieldsValue({
      nom: category.nom || category.name, // Support les deux formats
      description: category.description || '',
      couleur: category.couleur || '#1890ff',
      actif: category.actif !== undefined ? category.actif : true,
    });
    
    setModalVisible(true);
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.delete(id);
      message.success('Catégorie supprimée avec succès');
      fetchCategories();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    
    try {
      console.log('Valeurs du formulaire:', values);
      
      // Formater les données pour l'API Laravel
      const formData: any = {
        name: values.nom, // Laravel attend 'name'
      };
      
      if (values.description) formData.description = values.description;
      if (values.couleur) formData.couleur = values.couleur;
      if (values.actif !== undefined) formData.actif = values.actif;
      
      console.log('Données envoyées à l\'API:', formData);

      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        message.success('Catégorie modifiée avec succès');
      } else {
        await categoryService.create(formData);
        message.success('Catégorie créée avec succès');
      }
      
      // Réinitialiser et fermer
      setModalVisible(false);
      setEditingCategory(null);
      form.resetFields();
      fetchCategories();
      
    } catch (error: any) {
      console.error('Erreur d\'enregistrement:', error);
      
      // Afficher les erreurs de validation
      if (error.response?.status === 422 && error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          const errorMessages = errors[key];
          if (Array.isArray(errorMessages)) {
            errorMessages.forEach(msg => {
              message.error(`${key}: ${msg}`);
            });
          }
        });
      } else {
        message.error(error.response?.data?.message || 'Erreur lors de l\'enregistrement');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingCategory(null);
    form.resetFields();
  };

  // Afficher pendant le chargement initial
  if (loading && categories.length === 0) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large">
          <div style={{ padding: '50px', textAlign: 'center' }}>
            Chargement des catégories...
          </div>
        </Spin>
      </div>
    );
  }

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <h1 style={{ margin: 0 }}>Gestion des Catégories</h1>
          <p style={{ color: '#666', margin: 0 }}>
            {categories.length} catégorie(s) trouvée(s)
          </p>
        </Col>
        <Col>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingCategory(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Nouvelle Catégorie
          </Button>
        </Col>
      </Row>

      <Card>
        <Table
          columns={columns}
          dataSource={categories}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `${total} catégorie(s)`,
          }}
        />
      </Card>

      {/* Modal pour créer/modifier une catégorie */}
      <Modal
        title={editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
        open={modalVisible}
        onCancel={handleModalClose}
        onOk={() => form.submit()}
        okText={editingCategory ? 'Modifier' : 'Créer'}
        cancelText="Annuler"
        confirmLoading={submitting}
        forceRender
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            couleur: '#1890ff',
            actif: true,
          }}
        >
          <Form.Item
            label="Nom"
            name="nom"
            rules={[
              { required: true, message: 'Le nom est requis' },
              { min: 2, message: 'Minimum 2 caractères' },
              { max: 100, message: 'Maximum 100 caractères' }
            ]}
          >
            <Input placeholder="Ex: Poissons frais" />
          </Form.Item>
          
          <Form.Item
            label="Description"
            name="description"
          >
            <Input.TextArea 
              placeholder="Description de la catégorie..." 
              rows={3} 
              maxLength={500}
              showCount
            />
          </Form.Item>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Couleur"
                name="couleur"
              >
                <ColorPicker />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Statut"
                name="actif"
                valuePropName="checked"
              >
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Tag color="green">Actif</Tag>
                    <Tag color="red">Inactif</Tag>
                  </div>
                </div>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoriesPage;