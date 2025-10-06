import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Row, Col, Button, ListGroup, Card, Image } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import Loader from '../components/Loader';
import Message from '../components/Message';
import CheckoutSteps from '../components/CheckoutSteps';
import { FaIndianRupeeSign, FaCreditCard, FaMoneyBillWave, FaHistory } from 'react-icons/fa';
import Meta from '../components/Meta';
import { addCurrency } from '../utils/addCurrency';

const PlaceOrderPage = () => {
  const {
    cartItems,
    shippingAddress,
    paymentMethod,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice
  } = useSelector(state => state.cart);
  const [createOrder, { isLoading }] = useCreateOrderMutation();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (!shippingAddress) {
      navigate('/shipping');
    }
    if (!paymentMethod) {
      navigate('/payment');
    }
  }, [shippingAddress, paymentMethod, navigate]);

  const placeOrderHandler = async () => {
    try {
      const res = await createOrder({
        cartItems,
        shippingAddress,
        paymentMethod,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
      }).unwrap();
      
      // Clear the cart
      dispatch(clearCartItems());
      
      // Show a notification with a link to view order history
      const ViewHistoryToast = () => (
        <div>
          <p className="mb-1">Order placed successfully!</p>
          <div className="d-flex align-items-center">
            <Link 
              to="/order-history"
              state={{ highlightOrderId: res._id }}
              onClick={() => toast.dismiss()}
              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
            >
              <FaHistory className="me-1" /> View your order history
            </Link>
          </div>
        </div>
      );
      
      // Show specific message based on payment method
      if (paymentMethod === 'COD') {
        toast.success(<ViewHistoryToast />, {
          autoClose: 8000 // Give more time to click the link
        });
      } else {
        toast.success(<ViewHistoryToast />, {
          autoClose: 8000 // Give more time to click the link
        });
      }
      
      // Navigate to order details page
      navigate(`/order/${res._id}`);
    } catch (error) {
      toast.error(error?.data?.message || error.error);
    }
  };
  return (
    <>
      <CheckoutSteps step1 step2 step3 step4 />
      <Meta title={'Place Order'} />
      <Row>
        <Col md={8}>
          <ListGroup variant='flush'>
            <ListGroup.Item>
              <h2>Shipping </h2>
              <strong>Address:</strong> {shippingAddress.address},{' '}
              {shippingAddress.city}, {shippingAddress.postalCode},{' '}
              {shippingAddress.country}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Payment Method </h2>
              <div className="d-flex align-items-center mb-3">
                {paymentMethod === 'COD' ? (
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      backgroundColor: '#ff8800',
                      color: 'white',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '10px'
                    }}>
                      <FaMoneyBillWave size={20} />
                    </div>
                    <strong>Cash on Delivery (COD)</strong>
                  </div>
                ) : paymentMethod === 'Stripe' ? (
                  <div className="d-flex align-items-center">
                    <div style={{ 
                      backgroundColor: '#ff8800',
                      color: 'white',
                      borderRadius: '50%',
                      width: '36px',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: '10px'
                    }}>
                      <FaCreditCard size={20} />
                    </div>
                    <strong>Stripe (Credit/Debit Card)</strong>
                  </div>
                ) : (
                  <strong>Method: {paymentMethod}</strong>
                )}
              </div>
              
              {paymentMethod === 'COD' && (
                <div className="mt-2 p-3" style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                  <p className="mb-1"><strong>Cash on Delivery Instructions:</strong></p>
                  <ul className="mb-0">
                    <li>Keep the exact amount ready at the time of delivery</li>
                    <li>Our delivery person will collect the payment when your order arrives</li>
                    <li>A payment receipt will be provided upon successful payment</li>
                  </ul>
                </div>
              )}
              
              {paymentMethod === 'Stripe' && (
                <Message variant="info">
                  You will be redirected to complete your payment after placing the order.
                </Message>
              )}
            </ListGroup.Item>
            <ListGroup.Item>
              <h2>Order Items </h2>
              <ListGroup variant='flush'>
                {cartItems.map(item => (
                  <ListGroup.Item key={item._id}>
                    <Row>
                      <Col md={2}>
                        <Image src={item.image} alt={item.name} fluid rounded />
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
                        {item.qty} x {addCurrency(item.price)} ={' '}
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
                  <Col>{addCurrency(Number(itemsPrice))}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Shipping:</Col>
                  <Col>{addCurrency(Number(shippingPrice))}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Tax:</Col>
                  <Col>{addCurrency(Number(taxPrice))}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                <Row>
                  <Col>Total:</Col>
                  <Col>{addCurrency(Number(totalPrice))}</Col>
                </Row>
              </ListGroup.Item>
              <ListGroup.Item>
                {isLoading ? (
                  <Loader />
                ) : (
                  <Button
                    className='w-100'
                    variant='warning'
                    disabled={cartItems.length === 0}
                    onClick={placeOrderHandler}
                  >
                    {paymentMethod === 'COD' ? 'Place Order (Pay on Delivery)' : 'Place Order'}
                  </Button>
                )}
              </ListGroup.Item>
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default PlaceOrderPage;
