import React from 'react';
import ProductList from '../components/ProductList';

const Home = () => {
  return (
    <div>
      <h1>Welcome to Sligy E-commerce</h1>
      <p>Shop for clothes, gadgets, phones, provisions, and more!</p>
      <ProductList />
    </div>
  );
};

export default Home;