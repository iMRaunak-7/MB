import React, { useState, useEffect } from 'react';
import {
  Form,
  Button,
  InputGroup
} from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { searchProduct, clearSearch } from '../slices/searchProductSlice';
import { useNavigate, useLocation } from 'react-router-dom';

function SearchBox() {
  const { search } = useSelector(state => state.search);
  const [input, setInput] = useState(search || '');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Sync input field with Redux state when search changes
  useEffect(() => {
    setInput(search || '');
  }, [search]);
  
  // Reset input when search is cleared from elsewhere (like navbar logo click)
  useEffect(() => {
    if (!search) {
      setInput('');
    }
  }, [search]);

  const searchProductHandler = e => {
    e.preventDefault();
    if (input.trim()) {
      dispatch(searchProduct(input.trim()));
      
      // If not already on homepage, navigate to homepage to show search results
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  };

  // Simple input change handler without animations
  const handleInputChange = (e) => {
    setInput(e.target.value);
    
    // If the input is empty, clear the search
    if (e.target.value === '') {
      dispatch(clearSearch());
      
      // If we're currently viewing search results, navigate to homepage
      if (location.pathname === '/' && search) {
        navigate('/');
      }
    }
  };
  
  return (
    <div className="search-box me-2">
      <Form onSubmit={searchProductHandler} role="search">
        <InputGroup>
          <div className="position-relative">
            <Form.Control
              type='text'
              value={input}
              onChange={handleInputChange}
              placeholder='Search Products...'
              className="search-input"
              aria-label="Search products"
            />
          </div>
          <Button 
            type='submit' 
            variant='warning'
            className="search-button"
            aria-label="Search"
            disabled={!input.trim()}
          >
            <FaSearch />
          </Button>
        </InputGroup>
      </Form>
    </div>
  );
}

export default SearchBox;
