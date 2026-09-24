import { lazy, Suspense } from 'react';
import { Navigate, Routes, Route } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { About } from './pages/About';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductForm } from './pages/admin/AdminProductForm';
import { Blog } from './pages/Blog';
import { BlogPost } from './pages/BlogPost';
import { AdminBlogList } from './pages/admin/blog/AdminBlogList';
import { AdminBlogCategories } from './pages/admin/blog/AdminBlogCategories';
import { AdminIssues } from './pages/admin/AdminIssues';
import ScrollToTop from './components/ScrollToTop';

const AdminBlogForm = lazy(() =>
  import('./pages/admin/blog/AdminBlogForm').then((module) => ({ default: module.AdminBlogForm })),
);

const adminBlogForm = (
  <Suspense
    fallback={
      <div className="flex justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }
  >
    <AdminBlogForm />
  </Suspense>
);

function App() {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
        <Route path="produtos" element={<ProductList />} />
        <Route path="produtos/:category" element={<ProductList />} />
        <Route path="produtos/:category/:subcategory" element={<ProductList />} />
        <Route path="produto/:id" element={<ProductDetail />} />
        <Route path="sobre" element={<About />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
      </Route>
      
      <Route path="/login" element={<Navigate to="/admin/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="produtos" element={<AdminDashboard />} />
        <Route path="produtos/novo" element={<AdminProductForm />} />
        <Route path="produtos/:id/editar" element={<AdminProductForm />} />
        <Route path="ajustes" element={<AdminIssues />} />
        <Route path="blog" element={<AdminBlogList />} />
        <Route path="blog/novo" element={adminBlogForm} />
        <Route path="blog/categorias" element={<AdminBlogCategories />} />
        <Route path="blog/:id/editar" element={adminBlogForm} />
      </Route>
    </Routes>
    </>
  );
}

export default App;
