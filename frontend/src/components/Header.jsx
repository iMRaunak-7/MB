import React from 'react';
import { Navbar, Nav, Container, Badge, NavDropdown } from 'react-bootstrap';
import { FaShoppingCart, FaUser, FaHistory, FaUserCircle } from 'react-icons/fa';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  SignedIn, 
  SignedOut, 
  SignInButton, 
  UserButton,
  useUser,
  useClerk
} from '@clerk/clerk-react';
import { clearSearch } from '../slices/searchProductSlice';
import SearchBox from './SearchBox';

const Header = () => {
  const { cartItems } = useSelector(state => state.cart);
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const goToHomePage = () => {
    // Clear the search when navigating to home page
    dispatch(clearSearch());
    navigate('/');
    window.scrollTo(0, 0);
  };
  
  const goToCartPage = () => {
    navigate('/cart');
    window.scrollTo(0, 0);
  };

  return (
    <Navbar
      variant='dark'
      expand='md'
      collapseOnSelect
      className="fixed-top z-2 custom-navbar"
    >
      <Container>
        <Navbar.Brand className="d-flex align-items-center" onClick={goToHomePage}>
          <span style={{ color: '#ff8800' }}>Stack</span>mart
        </Navbar.Brand>
        <Navbar.Toggle aria-controls='basic-navbar-nav' />
        <Navbar.Collapse id='basic-navbar-nav'>
          <Nav className='ms-auto align-items-center'>
            <SearchBox />
            <Nav.Link onClick={goToCartPage} className="d-flex align-items-center">
              <span className="position-relative">
                <FaShoppingCart style={{ fontSize: '1.2rem' }} />
                {cartItems.length > 0 && (
                  <Badge
                    pill
                    bg='warning'
                    className='cart-badge text-dark'
                  >
                    <strong>
                      {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                    </strong>
                  </Badge>
                )}
              </span>
              <span className="ms-2">Cart</span>
            </Nav.Link>
            {/* Clerk Authentication Components */}
            <SignedIn>
              <NavDropdown 
                title={
                  <span className="d-flex align-items-center">
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                      showName={false}
                    />
                    <span className="ms-2 d-none d-md-inline">{user?.fullName || 'My Account'}</span>
                  </span>
                } 
                id="user-dropdown"
              >
                <LinkContainer to="/profile">
                  <NavDropdown.Item>
                    <FaUserCircle className="me-2" /> Profile
                  </NavDropdown.Item>
                </LinkContainer>
                <LinkContainer to="/order-history">
                  <NavDropdown.Item>
                    <FaHistory className="me-2" /> Order History
                  </NavDropdown.Item>
                </LinkContainer>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={() => signOut()}>
                  Sign Out
                </NavDropdown.Item>
              </NavDropdown>
            </SignedIn>
            <SignedOut>
              <Nav.Link>
                <SignInButton mode="modal">
                  <span className="btn btn-primary-custom rounded-pill px-3">
                    <FaUser style={{ marginRight: '5px' }} />
                    Sign In
                  </span>
                </SignInButton>
              </Nav.Link>
            </SignedOut>
            {/* {userInfo && userInfo.isAdmin && (
                <NavDropdown title='Admin' id='adminmenu'>
                  <LinkContainer to='/admin/product-list'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/order-list'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/user-list'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )} */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
