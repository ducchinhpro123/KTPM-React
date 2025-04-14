import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { removeItemFromCart, updateItemQuantity, clearCartItems, fetchCart } from '../store/cartSlice';
import useDocumentTitle from '../hooks/useDocumentTitle';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

// Define a placeholder image URL
const PLACEHOLDER_IMAGE_URL = 'https://via.placeholder.com/80x80?text=No+Image';

const CartPage = () => {
  const { items, loading, error, initialized } = useSelector((state) => state.cart);
  console.log(items);
  const { token } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  
  // Set document title
  useDocumentTitle('Shopping Cart');
  
  // Fetch cart on component mount if not initialized
  useEffect(() => {
    if (token && !initialized) {
      dispatch(fetchCart());
    }
  }, [dispatch, token, initialized]);

  const handleRemoveItem = (id) => {
    dispatch(removeItemFromCart(id));
  };

  const handleUpdateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    dispatch(updateItemQuantity({ id, quantity: newQuantity }));
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCartItems());
    }
  };

  const calculateTotal = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (loading && !initialized) {
    return (
      <div className="container mx-auto py-16 px-4 text-center">
        <h1 className="text-3xl font-bold mb-8">Your Cart</h1>
        <LoadingSpinner />
        <p className="mt-4 text-gray-600">Loading your cart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
        <ErrorAlert message={error} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-lg text-gray-600 mb-6">Your cart is empty</p>
          <Link 
            to="/" 
            className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition"
            aria-label="Continue shopping"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8" id="cart-title">Your Cart</h1>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Cart Header - Desktop */}
        <div className="hidden md:grid md:grid-cols-5 bg-gray-50 p-4 text-gray-600 font-medium">
          <div className="col-span-2">Product</div>
          <div>Price</div>
          <div>Quantity</div>
          <div className="text-right">Subtotal</div>
        </div>

        {/* Cart Items */}
        <div className="divide-y divide-gray-200" role="table" aria-labelledby="cart-title">
          {items.map((item) => (
            <div 
              key={item.cartItemId || `item-${item.id}`} 
              className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 items-center"
              role="row"
            >
              {/* Product Info */}
              <div className="md:col-span-2 flex items-center space-x-4" role="cell">
                <img 
                  // Use placeholder if item.image is missing
                  src={item.image || PLACEHOLDER_IMAGE_URL} 
                  alt={item.name} 
                  className="w-20 h-20 object-cover rounded"
                  // Add onError fallback for broken image URLs
                  onError={(e) => {
                    e.target.onerror = null; // prevent infinite loop if placeholder itself fails
                    e.target.src = PLACEHOLDER_IMAGE_URL;
                  }}
                />
                <div>
                  <h3 className="font-medium">
                    <Link to={`/products/${item.id}`} className="hover:text-blue-600 transition">
                      {item.name}
                    </Link>
                  </h3>
                  <button 
                    onClick={() => handleRemoveItem(item.cartItemId)}
                    className="text-sm text-red-500 hover:text-red-700 mt-1"
                    aria-label={`Remove ${item.name} from cart`}
                    disabled={loading}
                  >
                    Remove
                  </button>
                </div>
              </div>
              
              {/* Price */}
              <div role="cell" className="md:text-left">
                <span className="md:hidden font-medium">Price: </span>
                <span>${item.price.toFixed(2)}</span>
              </div>
              
              {/* Quantity */}
              <div role="cell">
                <span className="md:hidden font-medium">Quantity: </span>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    aria-label="Decrease quantity"
                    disabled={item.quantity <= 1 || loading}
                  >
                    -
                  </button>
                  <span className="w-8 text-center" aria-label={`Quantity: ${item.quantity}`}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => handleUpdateQuantity(item.cartItemId, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center"
                    aria-label="Increase quantity"
                    disabled={loading}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Subtotal */}
              <div role="cell" className="md:text-right">
                <span className="md:hidden font-medium">Subtotal: </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Cart Actions & Summary */}
        <div className="p-6 bg-gray-50">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <button 
              onClick={handleClearCart}
              className={`text-red-600 hover:text-red-800 transition ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              aria-label="Clear cart"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Clear Cart'}
            </button>
            
            <div className="text-right">
              <div className="mb-2">
                <span className="font-medium text-lg">Total: </span>
                <span className="font-bold text-xl">${calculateTotal().toFixed(2)}</span>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0">
                <Link 
                  to="/" 
                  className="bg-gray-200 text-gray-800 py-2 px-4 rounded-md hover:bg-gray-300 transition text-center"
                  aria-label="Continue shopping"
                >
                  Continue Shopping
                </Link>
                <Link 
                  to="/checkout" 
                  className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition text-center"
                  aria-label="Proceed to checkout"
                >
                  Checkout
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {loading && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white py-2 px-4 rounded-md shadow-lg">
          Updating cart...
        </div>
      )}
    </div>
  );
};

export default CartPage;
