import React, { useState, useEffect, useCallback } from 'react';
import API from '../services/api';
import debounce from 'lodash/debounce';
import ProductCard from '../components/ProductCard'; // Import ProductCard
import useDocumentTitle from '../hooks/useDocumentTitle';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState(null);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Set the document title for this page
  useDocumentTitle('Home');

  // Hard-code danh sách danh mục tạm thời
  const categories = [
    { _id: 'electronics', name: 'Electronics' },
    { _id: 'clothing', name: 'Clothing' },
    { _id: 'books', name: 'Books' },
    { _id: 'home', name: 'Home & Garden' },
  ];

  // Hàm gọi API tìm kiếm sản phẩm
  const fetchProducts = useCallback(async (query = searchQuery) => {
    try {
      let response;
      if (selectedCategory) {
        response = await API.get(`/products/category/${selectedCategory}`);
      } else {
        response = await API.get('/products/search', {
          params: {
            q: query,
            minPrice: priceRange[0],
            maxPrice: priceRange[1],
            sort: sortBy,
          },
        });
      }

      console.log(response.data.data);
      let filteredProducts = selectedCategory ? response.data.data : response.data.data;

      if (!selectedCategory) {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.price >= priceRange[0] && product.price <= priceRange[1]
        );
      }

      if (sortBy) {
        filteredProducts.sort((a, b) => {
          if (sortBy === 'price_asc') return a.price - b.price;
          if (sortBy === 'price_desc') return b.price - a.price;
          if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
          if (sortBy === 'name_desc') return b.name.localeCompare(a.name);
          return 0;
        });
      }

      setProducts(filteredProducts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
    }
  }, [searchQuery, priceRange, selectedCategory, sortBy]); // Added all dependencies

  // Wrap fetchSuggestions in useCallback
  const fetchSuggestions = useCallback(async (query) => {
    try {
      const response = await API.get('/products/suggestions', {
        params: { q: query },
      });
      setSuggestions(response.data.suggestions || []);
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    }
  }, []);

  // Memoize the debounced functions using inline functions
  const debouncedFetchProducts = useCallback(
    (query) => {
      const debouncedFn = debounce((q) => fetchProducts(q), 300);
      debouncedFn(query);
      return debouncedFn;
    },
    [fetchProducts]
  );

  const debouncedFetchSuggestions = useCallback(
    (query) => {
      const debouncedFn = debounce((q) => fetchSuggestions(q), 300);
      debouncedFn(query);
      return debouncedFn;
    },
    [fetchSuggestions]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    if (value.length > 2) {
      debouncedFetchProducts(value);
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
      fetchProducts('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
    fetchProducts(suggestion);
  };

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]); // Added fetchProducts as dependency

  return (
    <div className="container mx-auto px-4 py-12 bg-gray-50 min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-2">
          Discover Our Products
        </h1>
        <p className="text-gray-600">Find the best deals just for you</p>
      </header>

      <div className="flex flex-col md:flex-row gap-6 mb-10">
        <div className="flex-1 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg mt-1 shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-2 hover:bg-blue-100 cursor-pointer text-gray-800"
                >
                  {suggestion}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex gap-4">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            value={`${priceRange[0]}-${priceRange[1]}`}
            onChange={(e) => {
              const [min, max] = e.target.value.split('-').map(Number);
              setPriceRange([min, max]);
            }}
            className="p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="0-1000">All Prices</option>
            <option value="0-50">$0 - $50</option>
            <option value="50-100">$50 - $100</option>
            <option value="100-200">$100 - $200</option>
            <option value="200-1000">$200+</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Sort By</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A-Z</option>
            <option value="name_desc">Name: Z-A</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-center mb-6 bg-red-100 p-3 rounded-lg">
          {error}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {products.map((product) => (
         <ProductCard key={product._id} product={{ ...product, id: product._id }} />
        ))}
      </div>

      {products.length === 0 && !error && (
        <p className="text-center text-gray-500 mt-10">
          No products found. Try adjusting your filters!
        </p>
      )}

      {/* Footer */}
    </div>
  );
};

export default Home;