import React, { useEffect, useState } from 'react';

import { Row, Col, Container } from 'react-bootstrap';
import { useGetProductsQuery } from '../slices/productsApiSlice';
import { useSelector } from 'react-redux';

import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Paginate from '../components/Paginate';
import ProductCarousel from '../components/ProductCarousel';
import ServerError from '../components/ServerError';
import Meta from '../components/Meta';
import HeroSection from '../components/HeroSection';
import FeatureSection from '../components/FeatureSection';

const HomePage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(0);
  const [skip, setSkip] = useState(0);
  const { search } = useSelector(state => state.search);

  const { data, isLoading, error } = useGetProductsQuery({
    limit,
    skip,
    search
  });

  useEffect(() => {
    if (data) {
      setLimit(4);
      setSkip((currentPage - 1) * limit);
      setTotal(data.total);
      setTotalPage(Math.ceil(total / limit));
    }
  }, [currentPage, data, limit, total, search]);

  const pageHandler = pageNum => {
    if (pageNum >= 1 && pageNum <= totalPage && pageNum !== currentPage) {
      setCurrentPage(pageNum);
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
          <Meta />
          {!search && (
            <>
              <HeroSection />
              <FeatureSection />
            </>
          )}
          
          <Container>
            <h2 className="my-4 text-center fw-bold">
              {search ? 'Search Results' : 'Latest Products'}
            </h2>
            <hr className="mb-4" style={{width: '100px', height: '3px', backgroundColor: '#ff8800', opacity: '1', margin: '0 auto'}} />
            
            <Row className="g-4">
              {data.products.map(product => (
                <Col key={product._id} sm={12} md={6} lg={4} xl={3}>
                  <Product product={product} />
                </Col>
              ))}
            </Row>
          </Container>
          {totalPage > 1 && !search && (
            <Paginate
              currentPage={currentPage}
              totalPage={totalPage}
              pageHandler={pageHandler}
            />
          )}
        </>
      )}
    </>
  );
};

export default HomePage;
