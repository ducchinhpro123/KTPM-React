import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Modal from '../../components/Modal'; // Import Modal component

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null); // Controls Edit Modal visibility and data
  const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: '', inStock: true, image: '' }); // Add category, inStock
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false); // Controls Add Modal visibility
  const [imageFile, setImageFile] = useState(null); // State for the selected image file
  const [uploading, setUploading] = useState(false); // State for upload process
  const [categories, setCategories] = useState([]); // State for available categories
  const [loadingCategories, setLoadingCategories] = useState(false); // Loading state for categories

  useEffect(() => {
    fetchProducts();
    fetchCategories(); // Fetch available categories when component mounts
  }, []);

  // Fetch available product categories
  const fetchCategories = async () => {
    setLoadingCategories(true);
    try {
      // Step 1: First try to extract categories from existing products
      // This is most reliable as we know these categories are already valid
      const extractedCategories = await API.extractCategoriesFromProducts();
      
      if (extractedCategories && extractedCategories.length > 0) {
        console.log('Using categories extracted from existing products');
        setCategories(extractedCategories);
        
        // Pre-select first category if available
        if (extractedCategories.length > 0 && !newProduct.category) {
          setNewProduct(prev => ({ ...prev, category: extractedCategories[0] }));
        }
        setLoadingCategories(false);
        return;
      }
      
      // Step 2: Try the standard API method to get categories
      console.log('No categories found in existing products, trying API endpoint');
      const validCategories = await API.getValidCategories();
      
      if (validCategories && validCategories.length > 0) {
        console.log('Using categories from API endpoint');
        setCategories(validCategories);
        
        // Pre-select first category
        setNewProduct(prev => ({ ...prev, category: validCategories[0] }));
        setLoadingCategories(false);
        return;
      }
      
      // Step 3: As a last resort, run the diagnostic to find valid categories
      console.log('No categories found with standard methods, running diagnostic...');
      const diagnosedCategories = await API.diagnoseCategories();
      
      if (diagnosedCategories && diagnosedCategories.length > 0) {
        console.log('Using diagnosed categories');
        setCategories(diagnosedCategories);
        setNewProduct(prev => ({ ...prev, category: diagnosedCategories[0] }));
      } else {
        // Ultimate fallback - use a safe default like "Electronics"
        console.log('Using fallback categories');
        setCategories(['Electronics']);
        setNewProduct(prev => ({ ...prev, category: 'Electronics' }));
      }
      
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      // Use a single, safe fallback category
      const fallbackCategory = 'Electronics';
      setCategories([fallbackCategory]);
      setNewProduct(prev => ({ ...prev, category: fallbackCategory }));
    } finally {
      setLoadingCategories(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true); // Set loading true
    setError(null); // Clear previous errors
    try {
      const response = await API.get('/products');
      setProducts(response.data.data); // Assuming data is nested under 'data'
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setError(error.response?.data?.error || 'Failed to fetch products.'); // Set error message
    } finally {
      setLoading(false); // Set loading false
    }
  };

  const handleAddProduct = async () => {
    let imageUrl = '';
    setUploading(true); // Indicate upload/add process start
    setError(null);

    // 1. Upload image if selected
    if (imageFile) {
      const formData = new FormData();
      formData.append('image', imageFile); // Key 'image' should match backend expectation

      try {
        const uploadResponse = await API.post('/images/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data' // Axios might set this automatically, but explicit is safer
          }
        });
        // Assuming response structure { success: true, data: { url: '...' } }
        imageUrl = uploadResponse.data.data.url; 
      } catch (uploadError) {
        console.error('Failed to upload image:', uploadError);
        setError(uploadError.response?.data?.error || 'Image upload failed.');
        setUploading(false);
        return; // Stop if image upload fails
      }
    }

    // 2. Create product with image URL (if uploaded) or existing value
    const productData = { ...newProduct, image: imageUrl || newProduct.image };

    try {
      await API.post('/products', productData);
      fetchProducts(); // Refresh product list
      // Reset form and file input
      setNewProduct({ name: '', price: '', description: '', category: '', inStock: true, image: '' }); 
      setImageFile(null); 
      setIsAddModalOpen(false); // Close modal
    } catch (productError) {
      console.error('Failed to add product:', productError);
      setError(productError.response?.data?.error || 'Failed to add product.');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateProduct = async () => {
    // Note: Image update logic for the edit form is not yet implemented.
    // Would require similar steps: check for new file, upload, update editingProduct.image
    if (!editingProduct) return;
    try {
      await API.put(`/products/${editingProduct._id}`, editingProduct);
      fetchProducts(); // Refresh danh sách sản phẩm
      setEditingProduct(null); // Close modal on success
    } catch (error) {
      console.error('Failed to update product:', error);
      // Optionally: set an error state for the modal form
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      await API.delete(`/products/${id}`);
      fetchProducts(); // Refresh danh sách sản phẩm
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  // Helper to handle input changes for both forms
  const handleInputChange = (e, formType) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    if (formType === 'new') {
        setNewProduct(prev => ({ ...prev, [name]: val }));
    } else if (formType === 'edit') {
        setEditingProduct(prev => ({ ...prev, [name]: val }));
    }
  };

  // Helper for file input change
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
        setImageFile(e.target.files[0]);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition shadow hover:shadow-md"
        >
          Add New Product
        </button>
      </div>

      {/* Product List Table */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Product List</h2>
        {loading && <p className="text-center text-gray-500">Loading products...</p>}
        {error && <p className="text-center text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto shadow-md rounded-lg">
            <table className="min-w-full bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                  {/* Add other headers like Category, Stock if needed */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded" />
                      ) : (
                        <div className="h-10 w-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">No Image</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">${product.price}</div>
                    </td>
                    {/* Add other cells here */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-indigo-600 hover:text-indigo-900 transition"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900 transition"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                    <tr>
                        <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No products found.</td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Product">
        {error && <p className="mb-4 text-center text-red-500">Error: {error}</p>} 
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Name" name="name"
            value={newProduct.name}
            onChange={(e) => handleInputChange(e, 'new')}
            className="w-full border p-2 rounded-lg"
            disabled={uploading}
          />
          <input
            type="number"
            placeholder="Price" name="price"
            value={newProduct.price}
            onChange={(e) => handleInputChange(e, 'new')}
            className="w-full border p-2 rounded-lg"
            disabled={uploading}
          />
          <textarea
            placeholder="Description" name="description"
            value={newProduct.description}
            onChange={(e) => handleInputChange(e, 'new')}
            className="w-full border p-2 rounded-lg"
            rows="3"
            disabled={uploading}
           />
           
          {/* Category Dropdown */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              id="category"
              name="category"
              value={newProduct.category}
              onChange={(e) => handleInputChange(e, 'new')}
              className="w-full border p-2 rounded-lg"
              disabled={uploading || loadingCategories}
            >
              <option value="">Select a category</option>
              {loadingCategories ? (
                <option disabled>Loading categories...</option>
              ) : (
                categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))
              )}
            </select>
            {loadingCategories && (
              <p className="text-xs text-gray-500 mt-1">Loading available categories...</p>
            )}
          </div>
          
          {/* File Input for Image */}
          <div>
            <label htmlFor="imageFile" className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
            <input
              type="file"
              id="imageFile" name="imageFile"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border p-2 rounded-lg text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              disabled={uploading}
            />
            {imageFile && <p className="text-xs text-gray-500 mt-1">Selected: {imageFile.name}</p>}
          </div>
           
          <div className="flex justify-end space-x-2">
            <button
                onClick={() => { setIsAddModalOpen(false); setError(null); setImageFile(null); }} // Reset error/file on cancel
                className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
                disabled={uploading}
            >
                Cancel
            </button>
            <button
              onClick={handleAddProduct}
              className={`bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={uploading}
            >
              {uploading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Product Modal - Needs image upload implementation too */}
      <Modal isOpen={!!editingProduct} onClose={() => setEditingProduct(null)} title="Edit Product">
        {editingProduct && (
           <div className="space-y-4">
            <input
              type="text"
              placeholder="Name" name="name"
              value={editingProduct.name}
              onChange={(e) => handleInputChange(e, 'edit')}
              className="w-full border p-2 rounded-lg"
            />
            <input
              type="number"
              placeholder="Price" name="price"
              value={editingProduct.price}
              onChange={(e) => handleInputChange(e, 'edit')}
              className="w-full border p-2 rounded-lg"
            />
            <textarea
                placeholder="Description" name="description"
                value={editingProduct.description}
                onChange={(e) => handleInputChange(e, 'edit')}
                className="w-full border p-2 rounded-lg"
                rows="3"
            />
            
            {/* Category Dropdown for Edit Modal */}
            <div>
              <label htmlFor="edit-category" className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                id="edit-category"
                name="category"
                value={editingProduct.category}
                onChange={(e) => handleInputChange(e, 'edit')}
                className="w-full border p-2 rounded-lg"
                disabled={loadingCategories}
              >
                <option value="">Select a category</option>
                {loadingCategories ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))
                )}
              </select>
            </div>
            
            <input
              type="text"
              placeholder="Image URL (current)" name="image"
              value={editingProduct.image}
              onChange={(e) => handleInputChange(e, 'edit')}
              className="w-full border p-2 rounded-lg"
              readOnly // Make read-only for now, needs file upload logic
            />
            {/* Add Stock and Featured later */}
            <div className="flex justify-end space-x-2">
              <button
                  onClick={() => setEditingProduct(null)}
                  className="bg-gray-300 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-400 transition"
              >
                  Cancel
              </button>
              <button
                onClick={handleUpdateProduct}
                className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition"
              >
                Save Changes
              </button>
             </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ManageProducts;