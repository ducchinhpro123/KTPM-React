import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { addItemToCart } from '../store/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [adding, setAdding] = useState(false);
  const { loading, error } = useSelector(state => state.cart);
  const { token } = useSelector(state => state.user);
  
  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    if (loading || adding) return;
    
    setAdding(true);

    // Format the item with consistent parameter naming
    const cartItem = {
      productId: product.id,
      name: product.name,
      price: isOnSale && product.salePrice ? product.salePrice : product.price,
      image: product.image,
      quantity: 1
    };

    dispatch(addItemToCart(cartItem))
      .unwrap()
      .then(() => {
        // Success feedback
        const button = e.currentTarget;
        button.classList.add('animate-pulse', 'bg-green-600');
        setTimeout(() => {
          button.classList.remove('animate-pulse', 'bg-green-600');
        }, 700);
      })
      .catch((err) => {
        console.error("Failed to add item to cart:", err);
      })
      .finally(() => {
        setAdding(false);
      });
  };

  // Handle null or undefined product gracefully
  if (!product) {
    return null;
  }

  // Check if the product is on sale
  const isOnSale = product.salePrice && product.salePrice < product.price;
  
  // Calculate discount percentage if on sale
  const discountPercentage = isOnSale 
    ? Math.round((1 - (product.salePrice / product.price)) * 100) 
    : 0;

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col">
      {/* Sale Badge */}
      {isOnSale && (
        <div className="absolute top-0 left-0 bg-red-500 text-white py-1 px-2 text-xs font-bold z-10">
          {discountPercentage}% OFF
        </div>
      )}
      
      {/* Image Container */}
      <Link 
        to={`/products/${product.id}`} 
        className="block h-48 overflow-hidden"
        aria-label={`View details for ${product.name}`}
      >
        <img
          src={product.image || 'https://via.placeholder.com/300x200?text=Product+Image'}
          alt={product.name}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
          }}
        />
      </Link>
      
      {/* Content */}
      <div className="p-4 flex-grow flex flex-col">
        <Link 
          to={`/products/${product.id}`}
          className="block mb-1"
        >
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        
        {/* Category */}
        {product.category && (
          <span className="text-xs text-gray-500 mb-2">
            {product.category}
          </span>
        )}
        
        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {product.description || "No description available"}
        </p>

        {/* Price Section */}
        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {isOnSale ? (
              <>
                <span className="text-xl font-bold text-gray-800">${product.salePrice.toFixed(2)}</span>
                <span className="text-sm text-gray-500 line-through">${product.price.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-xl font-bold text-gray-800">${product.price.toFixed(2)}</span>
            )}
          </div>
          
          <button
            onClick={handleAddToCart}
            className={`bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition flex items-center justify-center shadow-sm ${(loading || adding) ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-label={`Add ${product.name} to cart`}
            title="Add to cart"
            disabled={loading || adding || (product.inStock !== undefined && product.inStock <= 0)}
          >
            {adding ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            )}
          </button>
        </div>
        
        {/* Stock Status */}
        {product.inStock !== undefined && (
          <div className="mt-2">
            {product.inStock > 0 ? (
              <span className="text-xs text-green-600">{product.inStock} in stock</span>
            ) : (
              <span className="text-xs text-red-600">Out of stock</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
