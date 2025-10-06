import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../App';
import ProductPage from '../pages/ProductPage';
import HomePage from '../pages/HomePage';
import CartPage from '../pages/CartPage';
// Import Clerk Login/Register components instead of the legacy ones
import ClerkLoginPage from '../pages/ClerkLoginPage';
import ClerkRegisterPage from '../pages/ClerkRegisterPage';
import ShippingPage from '../pages/ShippingPage';
import PrivateRoute from '../components/PrivateRoute';
import PaymentPage from '../pages/PaymentPage';
import PlaceOrderPage from '../pages/PlaceOrderPage';
import OrderDetailsPage from '../pages/OrderDetailsPage';
import OrderHistoryPage from '../pages/OrderHistoryPage';
import ProfilePage from '../pages/ProfilePage';
import ClerkProfilePage from '../pages/ClerkProfilePage';
import AdminRoute from '../components/AdminRoute';
import OrderListPage from '../pages/admin/OrderListPage';
import ProductListPage from '../pages/admin/ProductListPage';
import UserListPage from '../pages/admin/UserListPage';
// import CreateProductPage from '../pages/admin/CreateProductPage';
// import UpdateProductPage from '../pages/admin/UpdateProductPage';
import ProductFormPage from '../pages/admin/ProductFormPage';
import UpdateUserFormPage from '../pages/admin/UpdateUserFormPage';
import NotFoundPage from '../pages/NotFoundPage';
import AdminDashboard from '../AdminDashboard';
import AdminLoginPage from '../pages/admin/AdminLoginPage';
import Dashboard from '../pages/admin/Dashboard';
import AdminProfilePage from '../pages/admin/AdminProfilePage';
import AdminListPage from '../pages/admin/AdminListPage';
import ResetPasswordRequestPage from '../pages/ResetPasswordRequestPage';
import ResetPasswordPage from '../pages/ResetPasswordPage';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        path: '/',
        element: <HomePage />
      },
      {
        path: '/product/:id',
        element: <ProductPage />
      },
      {
        path: '/cart',
        element: <CartPage />
      },
      {
        path: '/reset-password',
        element: <ResetPasswordRequestPage />
      },
      {
        path: '/reset-password/:id/:token',
        element: <ResetPasswordPage />
      },
      {
        path: '/login',
        element: <ClerkLoginPage />
      },
      {
        path: '/register',
        element: <ClerkRegisterPage />
      },
      {
        path: '',
        element: <PrivateRoute />,
        children: [
          {
            path: '/shipping',
            element: <ShippingPage />
          },
          {
            path: '/payment',
            element: <PaymentPage />
          },
          {
            path: '/place-order',
            element: <PlaceOrderPage />
          },
          {
            path: '/order/:id',
            element: <OrderDetailsPage />
          },
          {
            path: '/profile',
            element: <ClerkProfilePage />
          },
          {
            path: '/order-history',
            element: <OrderHistoryPage />
          }
        ]
      }
    ]
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />
  },
  {
    path: '',
    element: <AdminDashboard />,
    children: [
      {
        path: '',
        element: <AdminRoute />,
        children: [
          {
            path: '/admin/dashboard',
            element: <Dashboard />
          },
          {
            path: '/admin/order-list',
            element: <OrderListPage />
          },
          {
            path: '/admin/product-list',
            element: <ProductListPage />
          },
          {
            path: '/admin/user-list',
            element: <UserListPage />
          },
          {
            path: '/admin/product/create',
            element: <ProductFormPage />
          },
          {
            path: '/admin/profile',
            element: <AdminProfilePage />
          },
          {
            path: '/admin/admin-list',
            element: <AdminListPage />
          },
          {
            path: '/admin/order/:id',
            element: <OrderDetailsPage />
          },
          {
            path: '/admin/user/update/:id',
            element: <UpdateUserFormPage />
          },
          {
            path: '/admin/product/update/:id',
            element: <ProductFormPage />
          }
        ]
      }
    ]
  },
  {
    path: '*',
    element: <NotFoundPage />
  }
]);
const Routes = () => {
  return <RouterProvider router={router} />;
};

export default Routes;
