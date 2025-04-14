import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeItemFromCart, updateItemQuantity, clearCartItems } from '../store/cartSlice';
import LoadingSpinner from './ui/LoadingSpinner';

const Cart = () => {
  const { items, loading, error } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const [isClearing, setIsClearing] = useState(false);

  const handleRemove = (id) => {
    dispatch(removeItemFromCart(id));
  };

  const handleQuantityChange = (id, quantity) => {
    if (quantity > 0) {
      dispatch(updateItemQuantity({ id, quantity }));
    } else {
      // If quantity is reduced to zero, remove the item
      dispatch(removeItemFromCart(id));
    }
  };

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      setIsClearing(true);
      dispatch(clearCartItems())
        .finally(() => setIsClearing(false));
    }
  };

  // Calculate cart totals
  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  if (loading && !items.length) {
    return <LoadingSpinner size="small" />;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Your Cart</h1>
      
      {/* Error message display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-center">Your cart is empty.</p>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between border p-4 rounded-lg shadow-md"
            >
              <div className="flex items-center">
                {item.image && (
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-16 h-16 object-cover mr-4 rounded"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/64?text=No+Image';
                    }}
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold">{item.name}</h3>
                  <p className="text-gray-600">${item.price.toFixed(2)} each</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  className="bg-gray-300 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  -
                </button>
                <span className="text-lg font-semibold">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  className="bg-gray-300 text-gray-800 py-1 px-3 rounded-md hover:bg-gray-400 transition"
                  disabled={loading}
                >
                  +
                </button>
                <div className="ml-6 font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
              <button
                onClick={() => handleRemove(item.id)}
                className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition"
                disabled={loading}
              >
                Remove
              </button>
            </div>
          ))}

          {/* Cart Summary */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <span>Subtotal ({itemCount} items):</span>
              <span className="text-xl font-bold">${cartTotal.toFixed(2)}</span>
            </div>
            
            <div className="flex justify-between space-x-4">
              <button
                onClick={handleClearCart}
                className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition flex-1"
                disabled={loading || isClearing || items.length === 0}
              >
                {isClearing ? 'Clearing...' : 'Clear Cart'}
              </button>
              
              <button
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition flex-1"
                disabled={loading || items.length === 0}
                onClick={() => window.location.href = '/checkout'}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;