import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addItemToCart } from '../store/cartSlice';
import API from '../services/api';
import useDocumentTitle from '../hooks/useDocumentTitle';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorAlert from '../components/ui/ErrorAlert';

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  
  const dispatch = useDispatch();
  const cartLoading = useSelector(state => state.cart.loading);
  const { token } = useSelector(state => state.user);

  // Set dynamic document title based on product name
  useDocumentTitle(product?.name || 'Product Details');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/products/${id}`);
        setProduct(response.data.data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.data?.error || 'Failed to load product details.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!token) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    if (product && !addingToCart && !cartLoading) {
      setAddingToCart(true);
      
      dispatch(addItemToCart({ 
        id: product._id, 
        name: product.name, 
        price: product.price, 
        image: product.image,
        quantity
      }))
      .unwrap()
      .then(() => {
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 3000); // Hide success message after 3 seconds
      })
      .catch(error => {
        setError(`Failed to add to cart: ${error}`);
        setTimeout(() => setError(null), 3000); // Clear error after 3 seconds
      })
      .finally(() => {
        setAddingToCart(false);
      });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error && !addedToCart) {
    return <ErrorAlert message={error} />;
  }

  if (!product) {
    return <ErrorAlert message="Product not found" />;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-shrink-0 md:w-1/2">
            <img 
              src={product.image} 
              alt={product.name} 
              className="h-full w-full object-cover md:object-contain p-4" 
            />
          </div>
          <div className="p-8 md:w-1/2">
            <div className="flex justify-between items-start">
              <div>
                <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold">
                  {product.category}
                </div>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">{product.name}</h1>
              </div>
              <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>

            {product.inStock > 0 ? (
              <div className="mt-6">
                <p className="text-green-600 font-semibold">In Stock: {product.inStock} units</p>
              </div>
            ) : (
              <p className="mt-6 text-red-600 font-semibold">Out of Stock</p>
            )}

            <div className="mt-6 flex items-center">
              <div className="flex items-center border border-gray-300 rounded">
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity <= 1 || addingToCart || cartLoading}
                >
                  -
                </button>
                <span className="px-3 py-1">{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(product.inStock, prev + 1))}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                  disabled={quantity >= product.inStock || addingToCart || cartLoading}
                >
                  +
                </button>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleAddToCart}
                disabled={product.inStock <= 0 || addingToCart || cartLoading}
                className={`px-6 py-3 rounded-md text-white font-medium ${
                  product.inStock > 0 && !addingToCart && !cartLoading
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-400 cursor-not-allowed'
                } flex items-center justify-center`}
              >
                {addingToCart || cartLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </>
                ) : (
                  'Add to Cart'
                )}
              </button>
              <Link to="/" className="px-6 py-3 rounded-md border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 text-center">
                Back to Products
              </Link>
            </div>

            {addedToCart && (
              <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md flex items-center">
                <svg className="h-5 w-5 mr-2" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                  <path d="M5 13l4 4L19 7"></path>
                </svg>
                Product added to cart successfully!
              </div>
            )}
            
            {error && addedToCart && (
              <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;