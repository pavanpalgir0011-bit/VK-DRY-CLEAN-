import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { settingsAPI } from '../services/api';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('vk_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [settings, setSettings] = useState({
    deliveryFee: 50,
    freeDeliveryThreshold: 499,
    gstRate: 0,
  });

  const { addToast } = useToast();

  // Fetch real-time delivery and tax configuration
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const res = await settingsAPI.getSettings();
        if (res.success && res.settings) {
          setSettings({
            deliveryFee: Number(res.settings.deliveryFee ?? 50),
            freeDeliveryThreshold: Number(res.settings.freeDeliveryThreshold ?? 499),
            gstRate: Number(res.settings.gstRate ?? 0),
          });
        }
      } catch (err) {
        console.warn('Could not load live settings, using standard defaults:', err.message);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('vk_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to persist cart:', e);
    }
  }, [cartItems]);

  const addToCart = (service, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    const existing = cartItems.find((item) => item.serviceId === service._id);
    if (existing) {
      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.serviceId === service._id ? { ...item, quantity: item.quantity + qty } : item
        )
      );
      addToast(`Updated ${service.name} quantity to ${existing.quantity + qty}`, 'success');
    } else {
      const newItem = {
        serviceId: service._id,
        name: service.name,
        price: service.price,
        quantity: qty,
        unit: service.unit || 'Piece',
        image: service.image,
        category: service.category,
      };
      setCartItems((prevItems) => [...prevItems, newItem]);
      addToast(`Added "${service.name}" to cart!`, 'success');
    }
  };

  const updateQuantity = (serviceId, quantity) => {
    const qty = parseInt(quantity);
    if (qty <= 0) {
      removeFromCart(serviceId);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) => (item.serviceId === serviceId ? { ...item, quantity: qty } : item))
    );
  };

  const removeFromCart = (serviceId) => {
    setCartItems((prevItems) => {
      const item = prevItems.find((i) => i.serviceId === serviceId);
      if (item) {
        addToast(`Removed "${item.name}" from cart`, 'info');
      }
      return prevItems.filter((i) => i.serviceId !== serviceId);
    });
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('vk_cart');
  };

  // Calculations based on dynamic settings
  const standardDeliveryFee = Number(settings.deliveryFee ?? 50);
  const freeDeliveryThreshold = Number(settings.freeDeliveryThreshold ?? 499);
  const gstRate = Number(settings.gstRate ?? 0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryFee =
    cartItems.length === 0
      ? 0
      : freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold
      ? 0
      : standardDeliveryFee;
  const gstAmount = Math.round((subtotal * gstRate) / 100);
  const total = subtotal + deliveryFee + gstAmount;
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        deliveryFee,
        gstAmount,
        gstRate,
        standardDeliveryFee,
        freeDeliveryThreshold,
        total,
        itemCount,
        settings,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
