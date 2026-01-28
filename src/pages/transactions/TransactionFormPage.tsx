import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Row,
  Col,
  Typography,
  Divider,
  Alert,
  Radio,
  DatePicker,
  message
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  CalculatorOutlined,
  UserOutlined,
  PhoneOutlined,
  BankOutlined
} from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import * as yup from 'yup';
import { Formik } from 'formik';

import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface TransactionFormValues {
  operator: 'MTN' | 'MOOV' | 'CELTIS' | 'ORANGE';
  amount: number;
  client_name: string;
  client_phone: string;
  external_reference?: string;
  type: 'deposit' | 'withdrawal' | 'payment' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  notes?: string;
}

const validationSchema = yup.object({
  operator: yup.string().oneOf(['MTN', 'MOOV', 'CELTIS', 'ORANGE']).required('Opérateur requis'),
  amount: yup.number().min(100, 'Montant minimum: 100 FCFA').required('Montant requis'),
  client_name: yup.string().required('Nom du client requis'),
  client_phone: yup.string().required('Téléphone requis'),
  type: yup.string().oneOf(['deposit', 'withdrawal', 'payment', 'transfer']).required('Type requis'),
  status: yup.string().oneOf(['pending', 'completed', 'failed', 'cancelled']).required('Statut requis'),
});

const TransactionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [fees, setFees] = useState(0);
  const [netAmount, setNetAmount] = useState(0);

  const isEditMode = !!id;

  // Fetch transaction data for edit mode
  const { data: transaction, isLoading } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => api.get(`/mobile-transactions/${id}`).then(res => res.data.data),
    enabled: isEditMode,
    staleTime: 0
  });

  // Create/Update mutation
  const mutation = useMutation({
    mutationFn: (values: TransactionFormValues) => {
      if (isEditMode) {
        return api.put(`/mobile-transactions/${id}`, values);
      } else {
        return api.post('/mobile-transactions', values);
      }
    },
    onSuccess: () => {
      const messageText = isEditMode 
        ? 'Transaction mise à jour avec succès' 
        : 'Transaction créée avec succès';
      message.success(messageText);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      navigate('/transactions');
    },
    onError: (error: any) => {
      message.error(error.response?.data?.message || 'Une erreur est survenue');
    }
  });

  const calculateFees = (operator: string, amount: number) => {
    let calculatedFees = 0;
    switch (operator) {
      case 'MTN':
        calculatedFees = Math.min(500, Math.max(50, amount * 0.01));
        break;
      case 'MOOV':
        calculatedFees = Math.min(400, Math.max(40, amount * 0.009));
        break;
      case 'CELTIS':
        calculatedFees = Math.min(450, Math.max(45, amount * 0.0095));
        break;
      case 'ORANGE':
        calculatedFees = Math.min(450, Math.max(45, amount * 0.009));
        break;
      default:
        calculatedFees = 0;
    }
    setFees(calculatedFees);
    setNetAmount(amount - calculatedFees);
  };

  const operatorLogos = [
    { value: 'MTN', label: 'MTN Money', color: '#ffcc00', icon: 'M' },
    { value: 'MOOV', label: 'Moov Money', color: '#00a859', icon: 'M' },
    { value: 'CELTIS', label: 'Celtis Money', color: '#e30613', icon: 'C' },
    { value: 'ORANGE', label: 'Orange Money', color: '#ff6600', icon: 'O' },
  ];

  const initialValues: TransactionFormValues = {
    operator: 'MTN',
    amount: 1000,
    client_name: '',
    client_phone: '',
    external_reference: '',
    type: 'payment',
    status: 'pending',
    notes: '',
  };

  if (isEditMode && transaction) {
    Object.assign(initialValues, {
      operator: transaction.operator,
      amount: transaction.amount,
      client_name: transaction.client_name,
      client_phone: transaction.client_phone,
      external_reference: transaction.external_reference || '',
      type: transaction.type,
      status: transaction.status,
      notes: transaction.notes || '',
    });
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/transactions')}
          style={{ marginRight: 16 }}
        >
          Retour
        </Button>
        <Title level={2} style={{ margin: '8px 0' }}>
          {isEditMode ? 'Modifier Transaction' : 'Nouvelle Transaction'}
        </Title>
        <Text type="secondary">
          {isEditMode 
            ? `Référence: ${transaction?.reference}`
            : 'Créer une nouvelle transaction mobile money'
          }
        </Text>
      </div>

      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize={true}
        onSubmit={(values, { setSubmitting }) => {
          mutation.mutate(values);
          setSubmitting(false);
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          setFieldValue,
          isSubmitting,
        }) => (
          <Form layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[24, 24]}>
              {/* Left Column - Transaction Details */}
              <Col xs={24} lg={16}>
                <Card title="Informations de la Transaction">
                  {/* Operator Selection */}
                  <div style={{ marginBottom: 24 }}>
                    <Text strong style={{ display: 'block', marginBottom: 12 }}>
                      Sélectionner l'opérateur
                    </Text>
                    <Row gutter={[16, 16]}>
                      {operatorLogos.map(operator => (
                        <Col xs={12} sm={6} key={operator.value}>
                          <div
                            style={{
                              border: `2px solid ${
                                values.operator === operator.value ? '#1890ff' : '#e8e8e8'
                              }`,
                              borderRadius: 8,
                              padding: 16,
                              textAlign: 'center',
                              cursor: 'pointer',
                              backgroundColor: values.operator === operator.value ? '#e6f7ff' : '#fff',
                              transition: 'all 0.3s',
                            }}
                            onClick={() => {
                              setFieldValue('operator', operator.value);
                              calculateFees(operator.value, values.amount);
                            }}
                          >
                            <div
                              style={{
                                width: 48,
                                height: 48,
                                borderRadius: '50%',
                                backgroundColor: operator.color,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px',
                                color: '#fff',
                                fontSize: 20,
                                fontWeight: 'bold',
                              }}
                            >
                              {operator.icon}
                            </div>
                            <Text strong>{operator.label}</Text>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* Amount and Fees */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Montant (FCFA)"
                        required
                        validateStatus={touched.amount && errors.amount ? 'error' : ''}
                        help={touched.amount && errors.amount}
                      >
                        <InputNumber
                          name="amount"
                          style={{ width: '100%' }}
                          min={100}
                          step={100}
                          value={values.amount}
                          onChange={(value) => {
                            setFieldValue('amount', value);
                            calculateFees(values.operator, value || 0);
                          }}
                          onBlur={handleBlur}
                          prefix="FCFA"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item label="Calcul des frais">
                        <div style={{ 
                          padding: '8px 12px', 
                          backgroundColor: '#f6ffed',
                          borderRadius: 6,
                          border: '1px solid #b7eb8f'
                        }}>
                          <Row gutter={[8, 8]}>
                            <Col span={12}>
                              <Text type="secondary">Frais estimés:</Text>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Text strong>{formatCurrency(fees)}</Text>
                            </Col>
                            <Col span={12}>
                              <Text type="secondary">Montant net:</Text>
                            </Col>
                            <Col span={12} style={{ textAlign: 'right' }}>
                              <Text strong style={{ color: '#52c41a' }}>
                                {formatCurrency(netAmount)}
                              </Text>
                            </Col>
                          </Row>
                        </div>
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Client Information */}
                  <Divider orientation="left">Informations Client</Divider>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Nom du Client"
                        required
                        validateStatus={touched.client_name && errors.client_name ? 'error' : ''}
                        help={touched.client_name && errors.client_name}
                      >
                        <Input
                          name="client_name"
                          placeholder="Nom complet du client"
                          prefix={<UserOutlined />}
                          value={values.client_name}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Numéro de Téléphone"
                        required
                        validateStatus={touched.client_phone && errors.client_phone ? 'error' : ''}
                        help={touched.client_phone && errors.client_phone}
                      >
                        <Input
                          name="client_phone"
                          placeholder="+229 XX XX XX XX"
                          prefix={<PhoneOutlined />}
                          value={values.client_phone}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Transaction Details */}
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Type de Transaction"
                        required
                        validateStatus={touched.type && errors.type ? 'error' : ''}
                        help={touched.type && errors.type}
                      >
                        <Select
                          value={values.type}
                          onChange={(value) => setFieldValue('type', value)}
                          onBlur={handleBlur}
                        >
                          <Option value="deposit">Dépôt</Option>
                          <Option value="withdrawal">Retrait</Option>
                          <Option value="payment">Paiement</Option>
                          <Option value="transfer">Transfert</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Statut"
                        required
                        validateStatus={touched.status && errors.status ? 'error' : ''}
                        help={touched.status && errors.status}
                      >
                        <Select
                          value={values.status}
                          onChange={(value) => setFieldValue('status', value)}
                          onBlur={handleBlur}
                        >
                          <Option value="pending">En attente</Option>
                          <Option value="completed">Complété</Option>
                          <Option value="failed">Échoué</Option>
                          <Option value="cancelled">Annulé</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item label="Référence Externe">
                        <Input
                          name="external_reference"
                          placeholder="Référence de l'opérateur"
                          prefix={<BankOutlined />}
                          value={values.external_reference}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  {/* Notes */}
                  <Form.Item label="Notes">
                    <TextArea
                      name="notes"
                      placeholder="Informations supplémentaires..."
                      rows={3}
                      value={values.notes}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                  </Form.Item>
                </Card>
              </Col>

              {/* Right Column - Summary and Actions */}
              <Col xs={24} lg={8}>
                <Card title="Récapitulatif">
                  <div style={{ marginBottom: 24 }}>
                    <div style={{ 
                      padding: 16, 
                      backgroundColor: '#fafafa', 
                      borderRadius: 6,
                      marginBottom: 16
                    }}>
                      <Text strong style={{ display: 'block', marginBottom: 8 }}>
                        Détails de la transaction
                      </Text>
                      <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                        <Col span={12}>
                          <Text type="secondary">Opérateur:</Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Text strong>{values.operator}</Text>
                        </Col>
                      </Row>
                      <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                        <Col span={12}>
                          <Text type="secondary">Montant:</Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Text strong>{formatCurrency(values.amount)}</Text>
                        </Col>
                      </Row>
                      <Row gutter={[8, 8]} style={{ marginBottom: 8 }}>
                        <Col span={12}>
                          <Text type="secondary">Frais:</Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Text strong>{formatCurrency(fees)}</Text>
                        </Col>
                      </Row>
                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Text type="secondary">Type:</Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Text strong>
                            {values.type === 'deposit' && 'Dépôt'}
                            {values.type === 'withdrawal' && 'Retrait'}
                            {values.type === 'payment' && 'Paiement'}
                            {values.type === 'transfer' && 'Transfert'}
                          </Text>
                        </Col>
                      </Row>
                    </div>

                    <Divider />

                    <div style={{ 
                      padding: 16, 
                      backgroundColor: '#e6f7ff', 
                      borderRadius: 6,
                      border: '1px solid #91d5ff'
                    }}>
                      <Row gutter={[8, 8]}>
                        <Col span={12}>
                          <Text strong>Montant Net:</Text>
                        </Col>
                        <Col span={12} style={{ textAlign: 'right' }}>
                          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
                            {formatCurrency(netAmount)}
                          </Title>
                        </Col>
                      </Row>
                      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 8 }}>
                        Montant que le client recevra
                      </Text>
                    </div>
                  </div>

                  <Alert
                    message="Vérification"
                    description="Assurez-vous que toutes les informations sont correctes avant de valider la transaction."
                    type="info"
                    showIcon
                    style={{ marginBottom: 24 }}
                  />

                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={mutation.isPending || isSubmitting}
                      block
                      size="large"
                    >
                      {isEditMode ? 'Mettre à jour' : 'Créer la Transaction'}
                    </Button>
                    <Button
                      onClick={() => navigate('/transactions')}
                      block
                      size="large"
                    >
                      Annuler
                    </Button>
                  </Space>
                </Card>
              </Col>
            </Row>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default TransactionFormPage;


