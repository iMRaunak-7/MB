import React, { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addCurrency } from '../utils/addCurrency';
import { addToCart } from '../slices/cartSlice';
import Rating from './Rating';
import { toast } from 'react-toastify';
import { FaShoppingCart } from 'react-icons/fa';

const Product = ({ product }) => {
  const [qty, setQty] = useState(1);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, qty }));
    toast.success('Added to cart!');
  };

  return (
    <Card className='product-card my-3 h-100'>
      <div className="product-img">
        <Link to={`/product/${product._id}`}>
          <Card.Img
            variant='top'
            src={product.image}
            alt={product.name}
          />
        </Link>
      </div>
      <Card.Body className="d-flex flex-column">
        <Link
          to={`/product/${product._id}`}
          style={{ textDecoration: 'none' }}
          className='text-dark'
        >
          <Card.Title as='div' className='product-title'>
            {product.name}
          </Card.Title>
        </Link>

        <div className="mt-auto">
          <Card.Text as='div' className='mb-2'>
            <Rating
              value={product.rating}
              text={`(${product.numReviews} reviews)`}
              className="rating-stars"
            />
          </Card.Text>
          
          <Card.Text as='h3' className='product-price mb-3'>{addCurrency(product.price)}</Card.Text>
          
          <Button
            className='add-to-cart-btn w-100'
            variant='warning'
            type='button'
            disabled={product.countInStock === 0}
            onClick={addToCartHandler}
          >
            {product.countInStock === 0 ? 'Out of Stock' : (
              <>
                <FaShoppingCart className="me-2" />
                Add To Cart
              </>
            )}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Product;
