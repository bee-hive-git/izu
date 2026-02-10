import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { ForgotPassword } from './pages/admin/ForgotPassword';
import { UpdatePassword } from './pages/admin/UpdatePassword';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="produtos" element={<ProductList />} />
        <Route path="produtos/:category" element={<ProductList />} />
        <Route path="produtos/:category/:subcategory" element={<ProductList />} />
        <Route path="produto/:id" element={<ProductDetail />} />
        <Route path="sobre" element={<About />} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/admin/redefinir-senha" element={<UpdatePassword />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="produtos" element={<AdminDashboard />} />
        <Route path="produtos/novo" element={<AdminProductForm />} />
        <Route path="produtos/:id/editar" element={<AdminProductForm />} />
      </Route>
    </Routes>
  );
}

export default App;
