import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import {
  Row,
  Col,
  Card,
  ListGroup,
  Form,
  Image,
  Button,
  ListGroupItem
} from 'react-bootstrap';
import { FaIndianRupeeSign } from 'react-icons/fa6';

import Message from '../components/Message';
import { addToCart, removeFromCart } from '../slices/cartSlice';
import Meta from '../components/Meta';
import { addCurrency } from '../utils/addCurrency';
const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector(state => state.cart);
  
  // Sort items to show most recently added first if they have a timestamp
  const sortedCartItems = React.useMemo(() => {
    return [...cartItems].sort((a, b) => {
      // If items have a timestamp, sort by it (most recent first)
      if (a.addedAt && b.addedAt) {
        return new Date(b.addedAt) - new Date(a.addedAt);
      }
      // Otherwise, keep original order
      return 0;
    });
  }, [cartItems]);

  const addToCartHandler = async (product, qty) => {
    dispatch(addToCart({ ...product, qty }));
  };

  const removeFromCartHandler = async id => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/shipping');
  };

  return (
    <>
      <Meta title={'Shopping Cart | Stackmart'} />
      <Row className="cart-header align-items-center mb-4">
        <Col>
          <h1 className="mb-0 d-flex align-items-center">
            Your Shopping Cart
            {cartItems.length > 0 && (
              <span className="ms-3 badge bg-warning text-dark cart-count-badge">
                {cartItems.reduce((acc, item) => acc + item.qty, 0)} {cartItems.reduce((acc, item) => acc + item.qty, 0) === 1 ? 'item' : 'items'}
              </span>
            )}
          </h1>
          {cartItems.length > 0 && (
            <p className="text-muted mb-0 mt-2">
              {cartItems.length} {cartItems.length === 1 ? 'product' : 'products'} in your cart
            </p>
          )}
        </Col>
        <Col xs="auto">
          <Link to="/" className="btn btn-outline-primary">
            Continue Shopping
          </Link>
        </Col>
      </Row>
      
      {cartItems.length === 0 ? (
        <div className="empty-cart-container text-center py-5">
          <div className="empty-cart-icon mb-3">
            <FaShoppingCart size={80} className="text-muted" />
          </div>
          <h2>Your cart is empty</h2>
          <p className="text-muted mb-4">Looks like you haven't added anything to your cart yet.</p>
          <Link to="/" className="btn btn-warning btn-lg px-5">
            Start Shopping
          </Link>
        </div>
      ) : (
        <Row>
          <Col lg={8}>
            <Card className="mb-4 border-0 shadow-sm">
              <Card.Header className="bg-white">
                <Row className="cart-header-row">
                  <Col xs={6} md={6}>Product</Col>
                  <Col xs={2} md={2} className="text-center">Price</Col>
                  <Col xs={2} md={2} className="text-center">Quantity</Col>
                  <Col xs={2} md={2} className="text-center">Total</Col>
                </Row>
              </Card.Header>
              <ListGroup variant='flush'>
                {sortedCartItems.map(item => (
                  <ListGroup.Item className='cart-item py-4' key={item._id}>
                    <Row className="align-items-center">
                      <Col xs={6} md={6}>
                        <div className="d-flex align-items-center">
                          <div className="cart-item-image-container me-3">
                            <Image src={item.image} alt={item.name} fluid className="cart-item-image" />
                          </div>
                          <div className="cart-item-details">
                            <Link
                              to={`/product/${item._id}`}
                              className='product-title fw-bold'
                            >
                              {item.name}
                            </Link>
                            <div className="d-block d-md-none mt-2">
                              <span className="text-muted">{addCurrency(item.price)}</span>
                            </div>
                            {item.countInStock <= 5 && (
                              <div className="stock-notice mt-1">
                                {item.countInStock <= 2 ? (
                                  <span className="text-danger">Only {item.countInStock} left!</span>
                                ) : (
                                  <span className="text-warning">Low stock: {item.countInStock} left</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </Col>
                      <Col xs={2} md={2} className="text-center d-none d-md-block">
                        <span className="price">{addCurrency(item.price)}</span>
                      </Col>
                      <Col xs={3} md={2} className="text-center">
                        <div className="quantity-controls d-flex align-items-center justify-content-center">
                          <Button 
                            variant="outline-secondary"
                            size="sm"
                            disabled={item.qty <= 1}
                            onClick={() => addToCartHandler(item, Math.max(1, item.qty - 1))}
                            className="quantity-btn"
                          >
                            -
                          </Button>
                          <div className="quantity-select-container mx-1">
                            <Form.Select
                              size="sm"
                              value={item.qty}
                              onChange={e => addToCartHandler(item, Number(e.target.value))}
                              className="quantity-select"
                              aria-label="Quantity"
                            >
                              {Array.from({ length: item.countInStock }, (_, i) => (
                                <option key={i + 1} value={i + 1}>
                                  {i + 1}
                                </option>
                              ))}
                            </Form.Select>
                          </div>
                          <Button 
                            variant="outline-secondary"
                            size="sm"
                            disabled={item.qty >= item.countInStock}
                            onClick={() => addToCartHandler(item, Math.min(item.countInStock, item.qty + 1))}
                            className="quantity-btn"
                          >
                            +
                          </Button>
                        </div>
                      </Col>
                      <Col xs={3} md={2} className="text-center">
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="item-total">{addCurrency(item.qty * item.price)}</span>
                          <Button
                            type='button'
                            variant='link'
                            className="remove-btn p-0 ms-2"
                            onClick={() => removeFromCartHandler(item._id)}
                            aria-label="Remove item"
                          >
                            <FaTrash className="text-danger" />
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </Col>
          
          <Col lg={4}>
            <div className="cart-summary sticky-md-top" style={{ top: '80px' }}>
              <Card className="border-0 shadow-sm">
                <Card.Header className="bg-white">
                  <h3 className="mb-0">Order Summary</h3>
                </Card.Header>
                <ListGroup variant='flush'>
                  <ListGroup.Item>
                    <Row className="py-1">
                      <Col>Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</Col>
                      <Col className="text-end">{addCurrency(
                        cartItems.reduce(
                          (acc, item) => acc + item.qty * item.price,
                          0
                        )
                      )}</Col>
                    </Row>
                    
                    {/* Show savings if applicable - this is placeholder logic if you have list price */}
                    {cartItems.some(item => item.listPrice && item.listPrice > item.price) && (
                      <Row className="py-1">
                        <Col>Your Savings</Col>
                        <Col className="text-end text-success">
                          {addCurrency(
                            cartItems.reduce(
                              (acc, item) => acc + item.qty * ((item.listPrice || item.price) - item.price),
                              0
                            )
                          )}
                        </Col>
                      </Row>
                    )}
                    <Row className="py-1">
                      <Col>Shipping</Col>
                      <Col className="text-end">Calculated at checkout</Col>
                    </Row>
                    <Row className="py-1">
                      <Col>Tax</Col>
                      <Col className="text-end">Calculated at checkout</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className="py-3">
                    <div className="coupon-form mb-3">
                      <label htmlFor="coupon-code" className="form-label mb-2">Apply Coupon Code</label>
                      <div className="d-flex">
                        <Form.Control 
                          type="text" 
                          id="coupon-code" 
                          placeholder="Enter code" 
                          className="me-2"
                        />
                        <Button variant="outline-secondary" size="sm">
                          Apply
                        </Button>
                      </div>
                    </div>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <Row className="py-2">
                      <Col className="fw-bold">Estimated Total</Col>
                      <Col className="text-end fw-bold">{addCurrency(
                        cartItems.reduce(
                          (acc, item) => acc + item.qty * item.price,
                          0
                        )
                      )}</Col>
                    </Row>
                  </ListGroup.Item>
                  <ListGroup.Item className="p-3">
                    <Button
                      className='checkout-btn w-100 py-2 d-flex align-items-center justify-content-center'
                      variant='warning'
                      type='button'
                      onClick={checkoutHandler}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-lock-fill me-2" viewBox="0 0 16 16">
                        <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                      </svg>
                      Proceed To Secure Checkout
                    </Button>
                    <div className="mt-3 text-center">
                      <Link to="/" className="continue-shopping-link">
                        <small>or continue shopping</small>
                      </Link>
                    </div>
                  </ListGroup.Item>
                </ListGroup>
              </Card>
            </div>
          </Col>
        </Row>
      )}
    </>
  );
};

export default CartPage;
