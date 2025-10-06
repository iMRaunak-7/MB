import React, { useState } from 'react';

import { useParams, Link } from 'react-router-dom';
import { Row, Col, ListGroup, Button, Image, Card, Modal } from 'react-bootstrap';
import {
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useUpdateDeliverMutation
} from '../slices/ordersApiSlice';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FaIndianRupeeSign, FaHistory } from 'react-icons/fa';
import Loader from '../components/Loader';
import Message from '../components/Message';
import ServerError from '../components/ServerError';
import StripeProvider from '../components/StripeProvider';
import StripeCheckoutForm from '../components/StripeCheckoutForm';

import Meta from '../components/Meta';
import { addCurrency } from '../utils/addCurrency';

const OrderDetailsPage = () => {
  const { id: orderId } = useParams();
  const { data: order, isLoading, error, refetch } = useGetOrderDetailsQuery(orderId);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [payOrder, { isLoading: isPayOrderLoading }] = usePayOrderMutation();
  const [updateDeliver, { isLoading: isUpdateDeliverLoading }] =
    useUpdateDeliverMutation();

  // Support both legacy auth and Clerk auth
  const legacyUser = useSelector(state => state.auth?.userInfo);
  const clerkUser = useSelector(state => state.clerkAuth?.userInfo);
  const currentUser = clerkUser || legacyUser;

  const paymentHandler = () => {
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    try {
      await payOrder({ orderId, details: paymentDetails }).unwrap();
      toast.success('Payment successful!');
      setShowPaymentModal(false);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    toast.error('Payment failed. Please try again.');
  };

  const deliveredHandler = async () => {
    try {
      await updateDeliver(orderId);
      
      // If this is a COD order and it's not paid yet, also mark it as paid
      if (order?.paymentMethod === 'COD' && !order?.isPaid) {
        try {
          await payOrder({ 
            orderId, 
            details: { 
              id: 'cod-payment',
              status: 'Cash on Delivery',
              update_time: new Date().toISOString(),
              payer: { email_address: order?.user?.email }
            } 
          }).unwrap();
          toast.success('Order marked as delivered and paid');
        } catch (payError) {
          toast.error('Order marked as delivered but payment status update failed');
          console.error('Payment status update error:', payError);
        }
      } else {
        toast.success('Order marked as delivered');
      }
      
      refetch(); // Refresh the order details
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>
          {error?.data?.message || error.error}
        </Message>
      ) : (
        <>
          <Meta title={'Order Details'} />
          <Row className="align-items-center mb-3">
            <Col>
              <h1 className="mb-0">Order ID: {orderId}</h1>
            </Col>
            <Col xs="auto">
              <Link 
                to="/order-history" 
                className="btn btn-outline-primary"
                state={{ highlightOrderId: orderId }}
              >
                <FaHistory className="me-2" /> View All Orders
              </Link>
            </Col>
          </Row>
          <Row>
            <Col md={8}>
              <ListGroup variant='flush'>
                <ListGroup.Item>
                  <h2>Shipping </h2>
                  <div className='mb-3'>
                    <strong>Name:</strong> {order?.user?.name}
                  </div>
                  <div className='mb-3'>
                    <strong>Email:</strong> {order?.user?.email}
                  </div>
                  <div className='mb-3'>
                    <strong>Address:</strong> {order?.shippingAddress?.address},
                    {order?.shippingAddress?.city},
                    {order?.shippingAddress?.postalCode},
                    {order?.shippingAddress?.country} <br />
                  </div>
                  {order?.isDelivered ? (
                    <Message variant='success'>
                      Delivered on{' '}
                      {new Date(order?.deliveredAt).toLocaleString()}
                    </Message>
                  ) : (
                    <Message variant={'danger'}>{'Not Delivered'}</Message>
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  <h2>Payment Method </h2>
                  <div className='mb-3'>
                    <strong>Method:</strong> {' '}
                    {order?.paymentMethod === 'COD' ? 'Cash on Delivery (COD)' : 
                     order?.paymentMethod === 'Stripe' ? 'Stripe (Credit/Debit Card)' : 
                     order?.paymentMethod}
                  </div>
                  {order?.isPaid ? (
                    <Message variant={'success'}>
                      Paid on {new Date(order?.paidAt).toLocaleString()}
                    </Message>
                  ) : order?.paymentMethod === 'COD' ? (
                    <Message variant={'info'}>
                      Payment will be collected upon delivery
                    </Message>
                  ) : (
                    <Message variant={'danger'}>
                      Not paid
                    </Message>
                  )}
                </ListGroup.Item>
                <ListGroup.Item>
                  <h2>Order Items </h2>
                  <ListGroup variant='flush'>
                    {order?.orderItems?.map(item => (
                      <ListGroup.Item key={item._id}>
                        <Row>
                          <Col md={2}>
                            <Image
                              src={item.image}
                              alt={item.name}
                              fluid
                              rounded
                            />
                          </Col>
                          <Col md={6}>
                            <Link
                              to={`/product/${item._id}`}
                              className='product-title text-dark'
                              style={{ textDecoration: 'none' }}
                            >
                              {item.name}
                            </Link>
                          </Col>
                          <Col md={4}>
                            {item.qty} x {addCurrency(item.price)} =
                            {addCurrency(item.qty * item.price)}
                          </Col>
                        </Row>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </ListGroup.Item>
              </ListGroup>
            </Col>
            <Col md={4}>
              <Card>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <h2>Order Summary</h2>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Items:</Col>
                      <Col>{addCurrency(order?.itemsPrice)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Shipping:</Col>
                      <Col>{addCurrency(order?.shippingPrice)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Tax:</Col>
                      <Col>{addCurrency(order?.taxPrice)}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row>
                      <Col>Total:</Col>
                      <Col>{addCurrency(order?.totalPrice)}</Col>
                    </Row>
                  </ListGroup.Item>
                  {!order?.isPaid && !(currentUser?.isAdmin) && order?.paymentMethod === 'Stripe' && (
                    <ListGroup.Item>
                      <Button
                        className='w-100'
                        variant='warning'
                        onClick={paymentHandler}
                        disabled={isPayOrderLoading}
                        style={{ marginBottom: '10px' }}
                      >
                        Pay with Card
                      </Button>
                    </ListGroup.Item>
                  )}
                  {!order?.isPaid && order?.paymentMethod === 'COD' && (
                    <ListGroup.Item>
                      <Message variant='info'>
                        This order will be paid with Cash on Delivery.
                      </Message>
                    </ListGroup.Item>
                  )}
                  {currentUser &&
                    currentUser.isAdmin &&
                    !order?.isDelivered && (
                      <ListGroup.Item>
                        <Button
                          onClick={deliveredHandler}
                          variant='warning'
                          className='w-100'
                          disabled={isUpdateDeliverLoading}
                          style={{ marginBottom: '10px' }}
                        >
                          {order?.paymentMethod === 'COD' && !order?.isPaid 
                            ? 'Mark As Delivered & Paid'
                            : 'Mark As Delivered'}
                        </Button>
                        {order?.paymentMethod === 'COD' && !order?.isPaid && (
                          <div className="text-muted small text-center mt-2">
                            This will also mark the order as paid since it's a Cash on Delivery order
                          </div>
                        )}
                      </ListGroup.Item>
                    )}
                </ListGroup>
              </Card>
            </Col>
          </Row>

          {/* Stripe Payment Modal */}
          <Modal 
            show={showPaymentModal} 
            onHide={() => setShowPaymentModal(false)}
            size="lg"
          >
            <Modal.Header closeButton>
              <Modal.Title>Complete Payment</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {order && (
                <StripeProvider>
                  <StripeCheckoutForm
                    amount={order.totalPrice}
                    orderId={order._id}
                    currency="usd"
                    onPaymentSuccess={handlePaymentSuccess}
                    onPaymentError={handlePaymentError}
                  />
                </StripeProvider>
              )}
            </Modal.Body>
          </Modal>
        </>
      )}
    </>
  );
};

export default OrderDetailsPage;
