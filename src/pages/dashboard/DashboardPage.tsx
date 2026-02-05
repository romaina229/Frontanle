// src/pages/Dashboard/DashboardPage.tsx - VERSION CORRIGÉE
import React, { useState, useEffect } from 'react';
import {   
  Row,   
  Col,   
  Card,   
  Statistic,   
  Typography,   
  Table,   
  Tag,   
  Button,   
  DatePicker,  
  Select,
  Progress,
  Space,
  Divider,
  Alert,
  Spin,
  Empty
} from 'antd';
import {   
  ShoppingCartOutlined,   
  DollarCircleOutlined,   
  StockOutlined,   
  AlertOutlined,
  ArrowUpOutlined,  
  PlusOutlined,
  BarChartOutlined,
  ArrowDownOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

import api from '../../services/api';
//import { formatCurrency, formatDate } from '../../utils/formatters';
import { extractApiData, extractStatsData, handleApiError, formatDateTime } from '../../utils/apiHelpers';
import StatCard from '../../components/dashboard/StatCard';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip, 
  Filler,
  Legend
);

const { Title: AntTitle, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

  // Fonctions utilitaires si elles n'existent pas
  const formatCurrency = (value: number) => {
    if (value === undefined || value === null) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(value) + ' FCFA';
  };

  const formatDate = (dateString: string, format: string = 'DD/MM/YYYY HH:mm') => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (e) {
      return dateString;
    }
  };

interface DashboardStats {
  total_revenue?: number;
  today_sales?: number;
  mobile_transactions?: number;
  avg_ticket?: number;
  conversion_rate?: number;
  active_clients?: number;
  total_orders?: number;
  total_products?: number;
  low_stock_count?: number;
}

interface Sale {
  id: number;
  reference: string;
  client_name?: string;
  total_amount: number;
  created_at: string;
  status?: string;
}

interface Product {
  id: number;
  name: string;
  stock_quantity: number;
  alert_threshold: number;
  unit?: string;
}

interface TopProduct {
  id: number;
  name: string;
  total_quantity?: number;
  total_revenue?: number;
}

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<any>([null, null]);
  const [chartPeriod, setChartPeriod] = useState('7');
  const [salesChartData, setSalesChartData] = useState<any>(null);
  const [chartLoading, setChartLoading] = useState(false);
  

  
  // Fetch dashboard data avec gestion robuste
  const { 
    data: dashboardStats = {
      total_revenue: 0,
      today_sales: 0,
      mobile_transactions: 0,
      avg_ticket: 0,
      conversion_rate: 0,
      active_clients: 0,
      total_orders: 0,
      total_products: 0,
      low_stock_count: 0
    }, 
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard', 'stats'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/stats', {
        params: { period: 'today' }
      });
        
        const stats = extractStatsData(response);
        
        // Fournir des valeurs par défaut pour tous les champs
        return {
          total_revenue: stats?.total_revenue ?? 0,
          today_sales: stats?.today_sales ?? 0,
          mobile_transactions: stats?.mobile_transactions ?? 0,
          avg_ticket: stats?.avg_ticket ?? 0,
          conversion_rate: stats?.conversion_rate ?? 0,
          active_clients: stats?.active_clients ?? 0,
          total_orders: stats?.total_orders ?? 0,
          total_products: stats?.total_products ?? 0,
          low_stock_count: stats?.low_stock_count ?? 0
        };
      } catch (error: any) {
        console.error('[Dashboard] Stats error:', error);
        throw error;
      }
    },
    refetchInterval: 300000,
    retry: 2,
    staleTime: 60000
  });

  const { 
    data: topProducts = [], 
    isLoading: productsLoading,
    error: productsError 
  } = useQuery<TopProduct[]>({
    queryKey: ['dashboard', 'top-products'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/top-products');
        console.log('[Dashboard] Top Products Response:', response.data);
        const products = extractApiData<TopProduct>(response);
        return products;
      } catch (error: any) {
        console.error('[Dashboard] Top products error:', error);
        return [];
      }
    },
  });
  
  const { 
    data: recentSales = [], 
    isLoading: salesLoading,
    error: salesError 
  } = useQuery<Sale[]>({
    queryKey: ['dashboard', 'recent-sales'],
    queryFn: async () => {
      try {
        const response = await api.get('/dashboard/recent-sales');
        console.log('[Dashboard] Recent Sales Response:', response.data);
        const sales = extractApiData<Sale>(response);
        return sales;
      } catch (error: any) {
        console.error('[Dashboard] Recent sales error:', error);
        return [];
      }
    },
  });

  const { 
    data: lowStock = [], 
    isLoading: stockLoading,
    error: stockError 
  } = useQuery<Product[]>({
    queryKey: ['dashboard', 'low-stock'],
    queryFn: async () => {
      try {
        const response = await api.get('/products/low-stock/alerts');
        console.log('[Dashboard] Low Stock Response:', response.data);
        const products = extractApiData<Product>(response);
        return products;
      } catch (error: any) {
        console.error('[Dashboard] Low stock error:', error);
        return [];
      }
    },
  });

  // Données pour les graphiques
  useEffect(() => {
    const fetchSalesChart = async () => {
      try {
        setChartLoading(true);

        const res = await api.get('/sales/statistics/daily', {
          params: { days: chartPeriod }
        });

        const rows = extractApiData<any>(res);

        const labels = rows.map((r: any) =>
          new Date(r.date).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'short',
          })
        );

        const data = rows.map((r: any) => r.total || 0);

        setSalesChartData({
          labels,
          datasets: [
            {
              label: 'Ventes (FCFA)',
              data,
              borderColor: '#1890ff',
              backgroundColor: 'rgba(24, 144, 255, 0.1)',
              tension: 0.4,
              fill: true,
            },
          ],
        });
      } catch (e) {
        console.error('[Dashboard] Chart error', e);
        setSalesChartData(null);
      } finally {
        setChartLoading(false);
      }
    };

    fetchSalesChart();
  }, [chartPeriod]);


  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    }
  };

  const hasError = statsError || productsError || salesError || stockError;
  const isLoading = statsLoading || productsLoading || salesLoading || stockLoading;

  return (
    <div className="dashboard-content" style={{ padding: '16px' }}>
      {/* En-tête */}
      <div className="dashboard-header">
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <AntTitle level={2} style={{ margin: 0 }}>
              Tableau de Bord
            </AntTitle>
            <Text type="secondary" style={{ marginTop: 4, display: 'block' }}>
              Vue d'ensemble des activités
            </Text>
          </Col>
          <Col>
            <Space size="middle">
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={() => navigate('/sales/new')}
                size="middle"
              >
                Nouvelle Vente
              </Button>
              <Button 
                icon={<SyncOutlined />}
                onClick={() => {
                  refetchStats();
                }}
                size="middle"
                loading={statsLoading}
              >
                Actualiser
              </Button>
              <RangePicker 
                onChange={(dates) => setDateRange(dates)}
                style={{ width: 250 }}
                size="middle"
              />
            </Space>
          </Col>
        </Row>
      </div>

      {/* Alertes d'erreur */}
      {hasError && (
        <Alert
          message="Erreur de chargement"
          description="Certaines données n'ont pas pu être chargées. Veuillez réessayer."
          type="warning"
          showIcon
          closable
          action={
            <Button size="small" type="primary" onClick={() => refetchStats()}>
              Réessayer
            </Button>
          }
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Statistiques Cards */}
      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Chiffre d'Affaires"
            value={dashboardStats?.total_revenue || 0}
            prefix="FCFA"
            icon={<DollarCircleOutlined />}
            color="#1890ff"
            trend={12.5}
            /*loading={statsLoading}*/
            /*error={!!statsError}*/
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Ventes Aujourd'hui"
            value={dashboardStats?.today_sales || 0}
            prefix="FCFA"
            icon={<ShoppingCartOutlined />}
            color="#52c41a"
            trend={8.3}
            /*loading={statsLoading}*/
            /*error={!!statsError}*/
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Stock Alerte"
            value={lowStock.length || dashboardStats?.low_stock_count || 0}
            icon={<AlertOutlined />}
            color="#faad14"
            trend={-3.2}
            /*loading={stockLoading}
            error={!!stockError}*/
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            title="Produits"
            value={dashboardStats?.total_products || 0}
            icon={<StockOutlined />}
            color="#722ed1"
            trend={15.7}
            /*loading={statsLoading}
            error={!!statsError}*/
          />
        </Col>
      </Row>
      {/* Charts */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title={
              <Space>
                <BarChartOutlined />
                <span>Évolution des Ventes</span>
              </Space>
            }
            extra={
              <Select 
                value={chartPeriod} 
                onChange={setChartPeriod}
                style={{ width: 120 }}
                size="middle"
              >
                <Option value="7">7 jours</Option>
                <Option value="30">30 jours</Option>
                <Option value="90">90 jours</Option>
              </Select>
            }
            style={{ height: '100%' }}
            loading={isLoading}
          >
            <div style={{ height: 300, position: 'relative' }}>
              {chartLoading && <Spin />}

              {!chartLoading && salesChartData && (
                <Line 
                  data={salesChartData} 
                  options={{
                    ...chartOptions,
                    plugins: {
                      ...chartOptions.plugins,
                      title: {
                        display: true,
                        text: `Évolution sur ${chartPeriod} jours`,
                      },
                    },
                  }}
                />
              )}

              {!chartLoading && !salesChartData && (
                <Empty 
                  description="Aucune donnée de vente"
                  style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                />
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            title="Top 5 Produits"
            style={{ height: '100%' }}
            loading={productsLoading}
          >
            {!productsLoading && topProducts.length > 0 ? (
              <div style={{ height: 300 }}>
                <Bar 
                  data={{
                    labels: topProducts.slice(0, 5).map(p => 
                      p.name?.length > 15 ? `${p.name.substring(0, 15)}...` : p.name || 'Produit'
                    ),
                    datasets: [
                      {
                        label: 'Quantité vendue',
                        data: topProducts.slice(0, 5).map(p => p.total_quantity || 0),
                        backgroundColor: [
                          'rgba(82, 196, 26, 0.8)',
                          'rgba(24, 144, 255, 0.8)',
                          'rgba(250, 173, 20, 0.8)',
                          'rgba(235, 47, 150, 0.8)',
                          'rgba(114, 46, 209, 0.8)',
                        ],
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function (value: any) {
                            return Number(value).toLocaleString();
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            ) : (
              <Empty 
                description="Aucune donnée de produit" 
                style={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
              />
            )}
          </Card>
        </Col>
      </Row>


      {/* Section Basse */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={16}>
          <Card 
            title="Ventes Récentes"
            extra={
              <Button type="link" onClick={() => navigate('/sales')}>
                Voir tout
              </Button>
            }
            loading={salesLoading}
          >
            {!salesLoading && recentSales.length > 0 ? (
              <Table
                dataSource={Array.isArray(recentSales) ? recentSales : []}
                columns={[
                  { 
                    title: 'Référence', 
                    dataIndex: 'reference', 
                    key: 'reference',
                    render: (text: string) => <Text strong>{text}</Text>
                  },
                  { 
                    title: 'Client', 
                    dataIndex: 'client_name', 
                    key: 'client_name',
                    render: (text: string) => text || 'Non renseigné'
                  },
                  { 
                    title: 'Montant', 
                    dataIndex: 'total_amount', 
                    key: 'total_amount', 
                    render: (amount: number) => formatCurrency(amount),
                    align: 'right' as const
                  },
                  { 
                    title: 'Date', 
                    dataIndex: 'created_at', 
                    key: 'created_at', 
                    render: (date: string) => formatDate(date, 'DD/MM/YYYY HH:mm'),
                    width: 150
                  },
                ]}
                pagination={false}
                size="middle"
                rowKey="id"
                locale={{
                  emptyText: 'Aucune vente récente'
                }}
              />
            ) : (
              <Empty description="Aucune vente récente" />
            )}
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card 
            title="Alertes Stock"
            extra={
              <Button type="link" onClick={() => navigate('/products?filter=low-stock')}>
                Voir tout
              </Button>
            }
            loading={stockLoading}
          >
            {!stockLoading && lowStock.length > 0 ? (
              lowStock.slice(0, 5).map((product: Product, index: number) => {
                const stockPercent = product.alert_threshold > 0 
                  ? Math.min(100, (product.stock_quantity / product.alert_threshold) * 100)
                  : 0;
                
                // Key unique : utiliser id si disponible, sinon index + name
                const uniqueKey = product.id ? `product-${product.id}` : `product-${index}-${product.name}`;
                
                return (
                  <div key={uniqueKey} style={{ marginBottom: 16, padding: '8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <Text strong style={{ fontSize: 13 }}>{product.name}</Text>
                      <Tag color="warning">{product.stock_quantity} {product.unit || 'unité'}</Tag>
                    </div>
                    <Progress
                      percent={Math.round(stockPercent)}
                      size="small"
                      status={stockPercent < 30 ? "exception" : "active"}
                      strokeColor={stockPercent < 30 ? "#ff4d4f" : "#faad14"}
                    />
                    <Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 4 }}>
                      Seuil: {product.alert_threshold} {product.unit || 'unité'}
                    </Text>
                  </div>
                );
              })
            ) : (
              <Empty 
                description="Aucune alerte de stock" 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Stats rapides en bas */}
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Panier Moyen"
              value={dashboardStats?.avg_ticket || 0}
              prefix="FCFA"
              precision={0}
              valueStyle={{ color: '#52c41a' }}
              loading={statsLoading}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              {dashboardStats?.avg_ticket && dashboardStats.avg_ticket > 5000 ? (
                <>
                  <ArrowUpOutlined style={{ color: '#52c41a', marginRight: 4 }} />
                  Bonne performance
                </>
              ) : (
                <>
                  <ArrowDownOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
                  À améliorer
                </>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Clients Actifs"
              value={dashboardStats?.active_clients || 0}
              valueStyle={{ color: '#1890ff' }}
              loading={statsLoading}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <ArrowUpOutlined style={{ color: '#1890ff', marginRight: 4 }} />
              {dashboardStats?.active_clients || 0} clients ce mois
            </div>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Commandes"
              value={dashboardStats?.total_orders || 0}
              valueStyle={{ color: '#722ed1' }}
              loading={statsLoading}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#8c8c8c' }}>
              <ArrowUpOutlined style={{ color: '#722ed1', marginRight: 4 }} />
              Ce mois
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;
