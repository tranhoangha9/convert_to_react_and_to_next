import { getCurrentUser } from './authService';

const CART_STORAGE_KEY = 'cartItems';

const getLocalCart = () => {
  if (typeof window === 'undefined') return [];

  const cartStr = localStorage.getItem(CART_STORAGE_KEY);
  if (!cartStr) return [];

  try {
    return JSON.parse(cartStr);
  } catch (error) {
    console.error('Error parsing cart data:', error);
    return [];
  }
};

const saveLocalCart = (cartItems) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));

  const event = new Event('storage');
  event.key = CART_STORAGE_KEY;
  window.dispatchEvent(event);
};

const clearLocalCart = () => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(CART_STORAGE_KEY);

  const event = new Event('storage');
  event.key = CART_STORAGE_KEY;
  window.dispatchEvent(event);
};

const getDbCart = async (userId) => {
  try {
    const response = await fetch(`/api/client/cart?userId=${userId}`);

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON:', contentType);
      return [];
    }

    const data = await response.json();
    if (!response.ok) {
      console.error('API Error:', response.status, data);
      return [];
    }

    if (data.success) {
      return data.cartItems || [];
    }

    console.error('Error fetching cart from DB:', data.error);
    return [];
  } catch (error) {
    console.error('Error fetching cart from DB:', error);
    return [];
  }
};

const saveDbCart = async (userId, cartItems) => {
  try {
    const response = await fetch('/api/client/cart', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, cartItems }),
    });

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error('Response is not JSON:', contentType);
      return false;
    }

    const data = await response.json();

    if (!response.ok) {
      console.error('API Error:', response.status, data);
      return false;
    }

    return data.success;
  } catch (error) {
    console.error('Error saving cart to DB:', error);
    return false;
  }
};

export const getCart = async () => {
  const user = getCurrentUser();

  if (!user || !user.id) {
    console.log('User not logged in, returning local cart');
    return getLocalCart();
  }
  return await getDbCart(user.id);
};

export const addToCart = async (product, quantity = 1) => {
  try {
    console.log('addToCart called with:', { product, quantity });
    const cartItem = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: product.image,
      quantity: quantity
    };

    const user = getCurrentUser();
    console.log('Current user:', user);

    if (!user || !user.id) {
      const currentCart = getLocalCart();
      console.log('Current local cart:', currentCart);

      const existingItem = currentCart.find(item => String(item.id) === String(product.id));

      let updatedCart;
      if (existingItem) {
        updatedCart = currentCart.map(item =>
          String(item.id) === String(product.id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updatedCart = [...currentCart, cartItem];
      }

      saveLocalCart(updatedCart);
      console.log('Cart saved to localStorage:', updatedCart);
      return true;
    }
    const currentCart = await getDbCart(user.id);
    console.log('Current cart from DB:', currentCart);

    const existingItem = currentCart.find(item => String(item.id) === String(product.id));

    let updatedCart;
    if (existingItem) {
      updatedCart = currentCart.map(item =>
        String(item.id) === String(product.id)
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      updatedCart = [...currentCart, cartItem];
    }

    console.log('Updated cart:', updatedCart);
    const success = await saveDbCart(user.id, updatedCart);
    console.log('Save result:', success);

    return success;
  } catch (error) {
    console.error('Error in addToCart:', error);
    return false;
  }
};

export const updateCartItemQuantity = async (productId, quantity) => {
  const user = getCurrentUser();

  if (!user || !user.id) {
    const currentCart = getLocalCart();
    const updatedCart = currentCart.map(item =>
      String(item.id) === String(productId)
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    saveLocalCart(updatedCart);
    return true;
  }

  const currentCart = await getDbCart(user.id);
  const updatedCart = currentCart.map(item =>
    String(item.id) === String(productId)
      ? { ...item, quantity: Math.max(1, quantity) }
      : item
  );

  return await saveDbCart(user.id, updatedCart);
};

export const removeFromCart = async (productId) => {
  const user = getCurrentUser();

  if (!user || !user.id) {
    const currentCart = getLocalCart();
    const updatedCart = currentCart.filter(item => String(item.id) !== String(productId));
    saveLocalCart(updatedCart);
    return true;
  }

  const currentCart = await getDbCart(user.id);
  const updatedCart = currentCart.filter(item => String(item.id) !== String(productId));

  return await saveDbCart(user.id, updatedCart);
};

export const clearCart = async () => {
  const user = getCurrentUser();

  if (user && user.id) {
    return await saveDbCart(user.id, []);
  } else {
    clearLocalCart();
    return true;
  }
};

export const mergeLocalCartToDb = async (userId) => {
  try {
    const localCart = getLocalCart();

    if (localCart.length === 0) {
      return true;
    }

    const dbCart = await getDbCart(userId);

    const mergedCart = [...dbCart];

    localCart.forEach(localItem => {
      const existingItem = mergedCart.find(item => item.id === localItem.id);

      if (existingItem) {
        existingItem.quantity += localItem.quantity;
      } else {
        mergedCart.push(localItem);
      }
    });

    const success = await saveDbCart(userId, mergedCart);

    if (success) {
      clearLocalCart();
      console.log('Cart merged successfully from localStorage to DB');
    }

    return success;
  } catch (error) {
    console.error('Error merging cart:', error);
    return false;
  }
};
