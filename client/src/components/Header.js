import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './Header.css';

const Header = () => {
  const { cart } = useCart();
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">Sligy</Link>
      </div>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/products">Products</Link>
        <Link to="/cart">Cart ({cartCount})</Link>
      </nav>
    </header>
  );
};

export default Header;