import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { Close as CloseIcon, Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useCreateSaleMutation, useUpdateSaleMutation } from '../../services/api';
import type { Sale, CreateSaleDto, UpdateSaleDto } from '../../types/sale';

interface SalesFormModalProps {
  open: boolean;
  onClose: () => void;
  sale?: Sale | null;
  onSuccess: () => void;
}

interface SaleItemForm {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

const validationSchema = Yup.object({
  customerId: Yup.string().required('Le client est requis'),
  items: Yup.array()
    .of(
      Yup.object({
        productId: Yup.string().required('Le produit est requis'),
        quantity: Yup.number()
          .required('La quantité est requise')
          .min(1, 'La quantité doit être au moins 1'),
        unitPrice: Yup.number()
          .required('Le prix unitaire est requis')
          .min(0, 'Le prix doit être positif'),
        discount: Yup.number()
          .min(0, 'La remise ne peut pas être négative')
          .max(100, 'La remise ne peut pas dépasser 100%'),
      })
    )
    .min(1, 'Au moins un produit est requis'),
  paymentMethod: Yup.string().required('Le mode de paiement est requis'),
  notes: Yup.string(),
});

const SalesFormModal: React.FC<SalesFormModalProps> = ({ open, onClose, sale, onSuccess }) => {
  const [createSale] = useCreateSaleMutation();
  const [updateSale] = useUpdateSaleMutation();
  const [items, setItems] = useState<SaleItemForm[]>([
    { productId: '', productName: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 },
  ]);

  const calculateItemTotal = (item: SaleItemForm) => {
    const price = item.unitPrice * item.quantity;
    const discountAmount = price * (item.discount / 100);
    return price - discountAmount;
  };

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
    const taxRate = 0.18; // 18% de TVA
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    return { subtotal, taxAmount, totalAmount };
  };

  const formik = useFormik({
    initialValues: {
      customerId: sale?.customerId || '',
      paymentMethod: sale?.paymentMethod || 'cash',
      notes: sale?.notes || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const saleData: CreateSaleDto = {
          customerId: values.customerId,
          items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
          })),
          paymentMethod: values.paymentMethod,
          notes: values.notes,
        };

        if (sale) {
          await updateSale({ id: sale.id, data: saleData }).unwrap();
        } else {
          await createSale(saleData).unwrap();
        }

        onSuccess();
      } catch (error) {
        console.error('Erreur lors de l\'enregistrement:', error);
      }
    },
  });

  const handleAddItem = () => {
    setItems([...items, { productId: '', productName: '', quantity: 1, unitPrice: 0, discount: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof SaleItemForm, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Recalculer le total si la quantité, le prix ou la remise change
    if (['quantity', 'unitPrice', 'discount'].includes(field)) {
      newItems[index].total = calculateItemTotal(newItems[index]);
    }
    
    setItems(newItems);
  };

  // Simuler des données de produits (à remplacer par un vrai appel API)
  const products = [
    { id: '1', name: 'Eau minérale 1L', price: 500 },
    { id: '2', name: 'Eau gazeuse 1L', price: 600 },
    { id: '3', name: 'Pack 6 bouteilles', price: 3000 },
    { id: '4', name: 'Fontaine à eau', price: 15000 },
  ];

  // Simuler des données de clients
  const customers = [
    { id: '1', name: 'Client Entreprise' },
    { id: '2', name: 'Client Particulier' },
    { id: '3', name: 'Hôtel Royal' },
    { id: '4', name: 'Restaurant Le Bon Goût' },
  ];

  const { subtotal, taxAmount, totalAmount } = calculateTotals();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {sale ? 'Modifier la vente' : 'Nouvelle vente'}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <form onSubmit={formik.handleSubmit}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Informations client */}
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.customerId && Boolean(formik.errors.customerId)}>
                <InputLabel>Client *</InputLabel>
                <Select
                  name="customerId"
                  value={formik.values.customerId}
                  onChange={formik.handleChange}
                  label="Client *"
                >
                  <MenuItem value="">Sélectionner un client</MenuItem>
                  {customers.map((customer) => (
                    <MenuItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Mode de paiement *</InputLabel>
                <Select
                  name="paymentMethod"
                  value={formik.values.paymentMethod}
                  onChange={formik.handleChange}
                  label="Mode de paiement *"
                >
                  <MenuItem value="cash">Espèce</MenuItem>
                  <MenuItem value="card">Carte bancaire</MenuItem>
                  <MenuItem value="transfer">Virement</MenuItem>
                  <MenuItem value="check">Chèque</MenuItem>
                  <MenuItem value="mobile">Mobile Money</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {/* Table des produits */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Produits
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Produit</TableCell>
                      <TableCell align="center">Quantité</TableCell>
                      <TableCell align="right">Prix unitaire</TableCell>
                      <TableCell align="center">Remise (%)</TableCell>
                      <TableCell align="right">Total</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          <FormControl fullWidth size="small">
                            <Select
                              value={item.productId}
                              onChange={(e) => {
                                const productId = e.target.value;
                                const product = products.find(p => p.id === productId);
                                handleItemChange(index, 'productId', productId);
                                handleItemChange(index, 'productName', product?.name || '');
                                handleItemChange(index, 'unitPrice', product?.price || 0);
                              }}
                            >
                              <MenuItem value="">Sélectionner un produit</MenuItem>
                              {products.map((product) => (
                                <MenuItem key={product.id} value={product.id}>
                                  {product.name} ({product.price} FCFA)
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.quantity}
                            onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 0)}
                            inputProps={{ min: 1 }}
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={item.unitPrice}
                            onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                            InputProps={{ endAdornment: 'FCFA' }}
                          />
                        </TableCell>
                        <TableCell align="center">
                          <TextField
                            type="number"
                            size="small"
                            value={item.discount}
                            onChange={(e) => handleItemChange(index, 'discount', parseFloat(e.target.value) || 0)}
                            InputProps={{ endAdornment: '%' }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight="medium">
                            {item.total.toLocaleString()} FCFA
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveItem(index)}
                            disabled={items.length === 1}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  size="small"
                >
                  Ajouter un produit
                </Button>
              </Box>
            </Grid>
            
            {/* Totaux */}
            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Sous-total:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight="medium">
                      {subtotal.toLocaleString()} FCFA
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      TVA (18%):
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="body2" fontWeight="medium">
                      {taxAmount.toLocaleString()} FCFA
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={6}>
                    <Typography variant="body1" fontWeight="bold">
                      Total:
                    </Typography>
                  </Grid>
                  <Grid item xs={6} textAlign="right">
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {totalAmount.toLocaleString()} FCFA
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                name="notes"
                label="Notes"
                value={formik.values.notes}
                onChange={formik.handleChange}
                placeholder="Notes supplémentaires sur la vente..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Annuler</Button>
          <Button type="submit" variant="contained" color="primary">
            {sale ? 'Mettre à jour' : 'Créer la vente'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default SalesFormModal;