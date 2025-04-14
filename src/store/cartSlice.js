import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../services/api';
import { logout } from './userSlice'; // Import the logout action

// Async thunk for fetching cart from server
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { rejectWithValue }) => {
    try {
      const response = await API.get('/cart');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching cart:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch cart');
    }
  }
);

// Async thunk for adding an item to cart
export const addItemToCart = createAsyncThunk(
  'cart/addItemToCart',
  async (item, { rejectWithValue, getState }) => {
    try {
      // Check if item already exists in cart
      const { cart } = getState();
      const existingItem = cart.items.find(i => 
        i.productId === item.productId || i.id === item.productId
      );

      // Prepare the request payload using consistent parameter naming
      const payload = {
        productId: item.productId || item.id, // Use productId if available, fallback to id
        quantity: existingItem ? existingItem.quantity + item.quantity : item.quantity
      };
      
      console.log("Sending to server:", payload);
      
      const response = await API.post('/cart/items', payload);
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding item to cart:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to add item to cart');
    }
  }
);

// Async thunk for updating item quantity
export const updateItemQuantity = createAsyncThunk(
  'cart/updateItemQuantity',
  async ({ id, quantity }, { rejectWithValue }) => {
    try {
      // Optimistic update - handle locally first then sync with server
      console.log(`Updating cart item: ID=${id}, quantity=${quantity}`);
      const response = await API.put(`/cart/items/${id}`, { quantity });
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return { id, quantity };
    } catch (error) {
      console.error('Error updating item quantity:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to update item quantity');
    }
  }
);

// Async thunk for removing an item from cart
export const removeItemFromCart = createAsyncThunk(
  'cart/removeItemFromCart',
  async (id, { rejectWithValue }) => {
    try {
      console.log(`Removing cart item with ID: ${id}`);
      await API.delete(`/cart/items/${id}`);
      return id;
    } catch (error) {
      console.error('Error removing item from cart:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to remove item from cart');
    }
  }
);

// Async thunk for clearing the entire cart
export const clearCartItems = createAsyncThunk(
  'cart/clearCartItems',
  async (_, { rejectWithValue }) => {
    try {
      await API.delete('/cart');
      return [];
    } catch (error) {
      console.error('Error clearing cart:', error);
      return rejectWithValue(error.response?.data?.error || 'Failed to clear cart');
    }
  }
);

// Fallback to localStorage if API fails or user is not logged in
const loadCartFromStorage = () => {
  try {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : { items: [] };
  } catch (error) {
    console.error('Error loading cart from localStorage:', error);
    return { items: [] };
  }
};

// Save cart to localStorage as a backup
const saveCartToStorage = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart to localStorage:', error);
  }
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    loading: false,
    error: null,
    initialized: false
  },
  reducers: {
    // For local updates without API calls
    setLocalCart: (state, action) => {
      state.items = action.payload;
      saveCartToStorage({ items: action.payload });
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch cart
    builder.addCase(fetchCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchCart.fulfilled, (state, action) => {
      state.items = action.payload || [];
      state.loading = false;
      state.initialized = true;
      state.error = null;
      saveCartToStorage({ items: state.items }); // Backup to localStorage
    });
    builder.addCase(fetchCart.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
      state.initialized = true;
      // If API fails, try to load from localStorage
      const localCart = loadCartFromStorage();
      state.items = localCart.items;
    });

    // Add item
    builder.addCase(addItemToCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(addItemToCart.fulfilled, (state, action) => {
      state.items = action.payload;
      state.loading = false;
      state.error = null;
      saveCartToStorage({ items: state.items });
    });
    builder.addCase(addItemToCart.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Update quantity
    builder.addCase(updateItemQuantity.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateItemQuantity.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      
      // Handle response from server
      if (action.payload) {
        // Server returns an array of items
        if (Array.isArray(action.payload)) {
          // Transform the server response to match our state format
          state.items = action.payload.map(item => {
            // Check if we have the necessary data
            if (!item.product) return null;
            
            return {
              id: item.product._id,
              name: item.product.name,
              price: item.product.price,
              image: item.product.image || null,
              quantity: item.quantity,
              cartItemId: item._id // Ensure we preserve the cartItemId
            };
          }).filter(item => item !== null);
        }
        // Server returns a single updated item
        else if (action.payload.id && action.payload.quantity !== undefined) {
          const { id, quantity } = action.payload;
          const existingItem = state.items.find(item => 
            item.id === id || item.cartItemId === id
          );
          if (existingItem) {
            existingItem.quantity = quantity;
          } else {
            console.warn(`Could not find cart item with ID ${id} to update`);
          }
        }
      }
      
      saveCartToStorage({ items: state.items });
    });
    builder.addCase(updateItemQuantity.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Remove item
    builder.addCase(removeItemFromCart.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(removeItemFromCart.fulfilled, (state, action) => {
      // Use cartItemId for removal
      state.items = state.items.filter(item => item.cartItemId !== action.payload);
      state.loading = false;
      state.error = null;
      saveCartToStorage({ items: state.items });
    });
    builder.addCase(removeItemFromCart.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Clear cart
    builder.addCase(clearCartItems.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(clearCartItems.fulfilled, (state) => {
      state.items = [];
      state.loading = false;
      state.error = null;
      saveCartToStorage({ items: [] });
    });
    builder.addCase(clearCartItems.rejected, (state, action) => {
      state.error = action.payload;
      state.loading = false;
    });

    // Add listener for the user logout action
    builder.addCase(logout, (state) => {
      // Reset cart state to initial values
      state.items = [];
      state.loading = false;
      state.error = null;
      state.initialized = false; // Consider if initialization state needs reset
      // Clear cart from localStorage as well
      try {
        localStorage.removeItem('cart');
      } catch (error) {
        console.error('Error removing cart from localStorage on logout:', error);
      }
    });
  },
});

export const { setLocalCart, clearError } = cartSlice.actions;
export default cartSlice.reducer;