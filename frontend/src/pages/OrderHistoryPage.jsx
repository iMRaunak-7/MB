import React, { useEffect, useState } from 'react';
import { Row, Col, Table, Button, Card } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { FaEye, FaShoppingCart, FaSync } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import Message from '../components/Message';
import Loader from '../components/Loader';
import Meta from '../components/Meta';
import { useGetMyOrdersQuery } from '../slices/ordersApiSlice';
import { apiSlice } from '../slices/apiSlice';
import { addCurrency } from '../utils/addCurrency';
import '../assets/styles/order-history.css';

const OrderHistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Authentication state
  const { userInfo: legacyUserInfo } = useSelector((state) => state.auth);
  const { userInfo: clerkUserInfo } = useSelector((state) => state.clerkAuth);
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  
  // Component state
  const [newOrderId, setNewOrderId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Get user's orders with RTK Query
  const { 
    data: orders, 
    isLoading, 
    error, 
    refetch,
    isFetching 
  } = useGetMyOrdersQuery(undefined, {
    // Force fresh data on component mount
    refetchOnMountOrArgChange: true,
  });
  
  // Force a refetch when the page loads with fresh auth token
  useEffect(() => {
    const updateTokenAndRefetch = async () => {
      // Only proceed if user is signed in with Clerk
      if (isSignedIn && user) {
        try {
          setIsRefreshing(true);
          // Get a fresh JWT token
          const token = await getToken({ skipCache: true });
          
          if (token) {
            console.log('Got fresh token for orders fetch');
            
            // Manually invalidate the orders cache to force a refetch
            dispatch(
              apiSlice.util.invalidateTags(['Order'])
            );
            
            // Refetch orders
            await refetch();
          }
        } catch (err) {
          console.error('Error refreshing token:', err);
        } finally {
          setIsRefreshing(false);
        }
      }
    };
    
    updateTokenAndRefetch();
  }, [isSignedIn, user, getToken, dispatch, refetch]);

  // Check for newly placed order from URL params or location state
  useEffect(() => {
    // First check URL params
    const searchParams = new URLSearchParams(location.search);
    const newOrder = searchParams.get('newOrder');
    
    if (newOrder) {
      setNewOrderId(newOrder);
      // Update the URL without the query parameter to prevent reloads on navigation
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
    // Then check location state (coming from order details page)
    else if (location.state?.highlightOrderId) {
      setNewOrderId(location.state.highlightOrderId);
      // Clear the state to prevent highlighting on subsequent navigations
      window.history.replaceState({}, '', location.pathname);
    }
  }, [location]);

  // If not logged in, redirect to login
  useEffect(() => {
    const userAuthenticated = legacyUserInfo || clerkUserInfo || isSignedIn;
    if (!userAuthenticated) {
      navigate('/login');
    }
  }, [legacyUserInfo, clerkUserInfo, isSignedIn, navigate]);
  
  // Function to manually refresh orders with a fresh token
  const handleRefreshOrders = async () => {
    try {
      setIsRefreshing(true);
      
      if (isSignedIn && getToken) {
        // Get a fresh token
        const token = await getToken({ skipCache: true });
        
        if (token) {
          // Invalidate the orders cache
          dispatch(apiSlice.util.invalidateTags(['Order']));
        }
      }
      
      // Refetch orders
      await refetch();
      
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Sort orders by creation date, newest first
  const sortedOrders = orders ? [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) : [];

  return (
    <Row className="mt-4 order-history">
      <Meta title="Order History | Stackmart" />
      <Col md={12}>
        <Row className="align-items-center mb-4">
          <Col>
            <h2 className="mb-0">Order History</h2>
          </Col>
          <Col xs="auto" className="d-flex gap-2">
            <Button
              variant="outline-info"
              onClick={handleRefreshOrders}
              disabled={isRefreshing || isFetching}
            >
              <FaSync className={isRefreshing || isFetching ? 'spin-animation' : ''} /> Refresh
            </Button>
            <LinkContainer to="/">
              <Button variant="outline-primary">
                Continue Shopping
              </Button>
            </LinkContainer>
          </Col>
        </Row>
        {(isLoading || isFetching || isRefreshing) ? (
          <Loader />
        ) : error ? (
          <div>
            <Message variant="danger">
              {error?.data?.message || error.error || 'An error occurred while loading orders'}
            </Message>
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>Order History Issue</Card.Title>
                <p>We encountered an issue loading your order history.</p>
                <p>Authentication Status:</p>
                <ul>
                  <li>Legacy Auth: {legacyUserInfo ? 'Active' : 'Inactive'}</li>
                  <li>Clerk Auth: {clerkUserInfo ? 'Active' : 'Inactive'}</li>
                  <li>Signed In: {isSignedIn ? 'Yes' : 'No'}</li>
                </ul>
                <Button 
                  variant="primary" 
                  onClick={handleRefreshOrders}
                  disabled={isRefreshing || isFetching}
                  className="mt-2"
                >
                  <FaSync className={isRefreshing || isFetching ? 'spin-animation' : ''} /> {' '}
                  Try Again
                </Button>
              </Card.Body>
            </Card>
          </div>
        ) : (!sortedOrders || sortedOrders.length === 0) ? (
          <div>
            <Message>
              You have no orders yet. <LinkContainer to="/" className="ms-2"><Button variant="warning">Start Shopping</Button></LinkContainer>
            </Message>
            <Card className="mt-3">
              <Card.Body>
                <Card.Title>No Order History Found</Card.Title>
                <p>You haven't placed any orders yet.</p>
                <p>Authentication Status:</p>
                <ul>
                  <li>Legacy Auth: {legacyUserInfo ? 'Active' : 'Inactive'}</li>
                  <li>Clerk Auth: {clerkUserInfo ? 'Active' : 'Inactive'}</li>
                  <li>Signed In: {isSignedIn ? 'Yes' : 'No'}</li>
                </ul>
                <div className="d-flex gap-2 mt-3">
                  <Button 
                    variant="outline-info" 
                    onClick={handleRefreshOrders}
                    disabled={isRefreshing || isFetching}
                  >
                    <FaSync className={isRefreshing || isFetching ? 'spin-animation' : ''} /> {' '}
                    Refresh Orders
                  </Button>
                  <LinkContainer to="/">
                    <Button variant="primary">Shop Now</Button>
                  </LinkContainer>
                </div>
              </Card.Body>
            </Card>
          </div>
        ) : (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Body>
                <p className="text-muted mb-0">Your order history shows all the purchases you've made. Click on "Details" to view more information about any order.</p>
              </Card.Body>
            </Card>
            <Table striped responsive hover className="table-sm">
              <thead>
                <tr>
                  <th>ORDER ID</th>
                  <th>DATE</th>
                  <th>TOTAL</th>
                  <th>PAYMENT</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sortedOrders.map((order) => (
                  <tr key={order._id} className={order._id === newOrderId ? 'new-order' : ''}>
                    <td>{order._id.substring(order._id.length - 8)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}</td>
                    <td>{addCurrency(order.totalPrice)}</td>
                    <td>
                      {order.isPaid ? (
                        <span className="badge bg-success p-2">
                          Paid
                        </span>
                      ) : order.paymentMethod === 'COD' ? (
                        <span className="badge bg-info p-2">
                          Cash on Delivery
                        </span>
                      ) : (
                        <span className="badge bg-danger p-2">
                          Unpaid
                        </span>
                      )}
                    </td>
                    <td>
                      {order.isDelivered ? (
                        <span className="badge bg-success p-2">
                          Delivered
                        </span>
                      ) : (
                        <span className="badge bg-warning text-dark p-2">
                          Processing
                        </span>
                      )}
                    </td>
                    <td>
                      <LinkContainer to={`/order/${order._id}`}>
                        <Button variant="outline-primary" className="btn-sm">
                          <FaEye /> Details
                        </Button>
                      </LinkContainer>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <div className="order-history-pagination">
              {/* Pagination can be added here if needed */}
            </div>
          </>
        )}
      </Col>
    </Row>
  );
};

export default OrderHistoryPage;