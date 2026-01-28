// Services avec export nommé
export { authService } from './authService';
export { productService } from './productService';
export { categoryService } from './categoryService';
export { userService } from './userService';

// Services avec export par défaut
import clientService from './clientService';
import saleService from './saleService';
import supplierService from './supplierService';
import invoiceService from './invoiceService';
import reportService from './reportService';

export { 
  clientService, 
  saleService, 
  supplierService, 
  invoiceService, 
  reportService 
};
