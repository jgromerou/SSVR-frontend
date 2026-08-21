import { Routes, Route, Navigate } from 'react-router-dom';
import { CompanyProvider } from './context/CompanyContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompaniesPage } from './pages/CompaniesPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductsPage } from './pages/ProductsPage';
import { CustomersPage } from './pages/CustomersPage';
import { SuppliersPage } from './pages/SuppliersPage';
import { UnitsOfMeasurePage } from './pages/UnitsOfMeasurePage';
import { SalesPage } from './pages/SalesPage';
import { PurchasesPage } from './pages/PurchasesPage';
import { SalesReturnsPage } from './pages/SalesReturnsPage';
import { StockAdjustmentsPage } from './pages/StockAdjustmentsPage';
import { InventoriesPage } from './pages/InventoriesPage';

const AuthenticatedLayout = () => (
  <CompanyProvider>
    <Layout />
  </CompanyProvider>
);

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="units-of-measure" element={<UnitsOfMeasurePage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="purchases" element={<PurchasesPage />} />
          <Route path="sales-returns" element={<SalesReturnsPage />} />
          <Route path="stock-adjustments" element={<StockAdjustmentsPage />} />
          <Route path="inventories" element={<InventoriesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
