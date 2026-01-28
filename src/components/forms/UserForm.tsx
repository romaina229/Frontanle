// src/components/forms/UserForm.tsx
import React, { useEffect } from 'react';
import { Form, Input, Select, Switch, Upload, Button, Space, Row, Col } from 'antd';
import { UploadOutlined, UserOutlined, MailOutlined, PhoneOutlined, HomeOutlined, LockOutlined } from '@ant-design/icons';
import { UserFormData } from '../../types';
import { USER_ROLES } from '../../types';

const { Option } = Select;

interface UserFormProps {
  initialValues?: Partial<UserFormData>;
  onSubmit: (values: UserFormData) => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
}

const UserForm: React.FC<UserFormProps> = ({
  initialValues,
  onSubmit,
  isSubmitting = false,
  mode = 'create'
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const normFile = (e: any) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e?.fileList;
  };

  const handleSubmit = (values: any) => {
    const formData = new FormData();
    
    Object.keys(values).forEach(key => {
      if (key === 'avatar' && values[key]?.[0]?.originFileObj) {
        formData.append(key, values[key][0].originFileObj);
      } else if (values[key] !== undefined && values[key] !== null) {
        formData.append(key, values[key]);
      }
    });

    onSubmit(formData as any);
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      initialValues={initialValues}
      requiredMark="optional"
    >
      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="name"
            label="Nom complet"
            rules={[
              { required: true, message: 'Veuillez saisir le nom' },
              { min: 2, message: 'Le nom doit avoir au moins 2 caractères' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Nom complet" 
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Veuillez saisir l\'email' },
              { type: 'email', message: 'Email invalide' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="email@exemple.com" 
              type="email"
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            name="telephone"
            label="Téléphone"
            rules={[
              { pattern: /^[0-9+\-\s()]*$/, message: 'Numéro de téléphone invalide' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined />} 
              placeholder="+229 XX XX XX XX" 
            />
          </Form.Item>
        </Col>
        
        <Col span={12}>
          <Form.Item
            name="role"
            label="Rôle"
            rules={[{ required: true, message: 'Veuillez sélectionner un rôle' }]}
          >
            <Select placeholder="Sélectionnez un rôle">
              {Object.entries(USER_ROLES).map(([value, label]) => (
                <Option key={value} value={value}>
                  {label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        name="address"
        label="Adresse"
      >
        <Input.TextArea 
          rows={2}
          placeholder="Adresse complète"
          //prefix={<HomeOutlined />}
        />
      </Form.Item>

      {mode === 'create' && (
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="password"
              label="Mot de passe"
              rules={[
                { required: mode === 'create', message: 'Veuillez saisir le mot de passe' },
                { min: 6, message: 'Le mot de passe doit avoir au moins 6 caractères' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Mot de passe" 
              />
            </Form.Item>
          </Col>
          
          <Col span={12}>
            <Form.Item
              name="password_confirmation"
              label="Confirmation"
              dependencies={['password']}
              rules={[
                { required: mode === 'create', message: 'Veuillez confirmer le mot de passe' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('Les mots de passe ne correspondent pas'));
                  },
                }),
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Confirmez le mot de passe" 
              />
            </Form.Item>
          </Col>
        </Row>
      )}

      <Form.Item
        name="avatar"
        label="Photo de profil"
        valuePropName="fileList"
        getValueFromEvent={normFile}
      >
        <Upload
          listType="picture"
          maxCount={1}
          beforeUpload={() => true} // Empêche l'upload automatique
          accept="image/*"
        >
          <Button icon={<UploadOutlined />}>
            Choisir une photo
          </Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="active"
        label="Statut"
        valuePropName="checked"
      >
        <Switch 
          checkedChildren="Actif" 
          unCheckedChildren="Inactif" 
          defaultChecked={initialValues?.active ?? true}
        />
      </Form.Item>

      <Form.Item>
        <Space>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {mode === 'create' ? 'Créer l\'utilisateur' : 'Mettre à jour'}
          </Button>
          <Button htmlType="reset">
            Réinitialiser
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default UserForm;