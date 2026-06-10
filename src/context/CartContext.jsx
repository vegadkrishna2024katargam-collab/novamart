import { createContext, useCallback, useContext, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find((item) => item.id === action.product.id);
      const qty = Math.max(1, action.product.qty || 1);
      if (existing) {
        return { items: state.items.map((item) => (item.id === action.product.id ? { ...item, qty: item.qty + qty } : item)) };
      }
      return { items: [...state.items, { ...action.product, qty }] };
    }
    case 'UPDATE':
      return { items: state.items.map((item) => (item.id === action.id ? { ...item, qty: Math.max(1, action.qty) } : item)) };
    case 'REMOVE':
      return { items: state.items.filter((item) => item.id !== action.id) };
    case 'CLEAR':
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { items: [] });
  const addToCart = useCallback((product) => dispatch({ type: 'ADD', product }), []);
  const updateQty = useCallback((id, qty) => dispatch({ type: 'UPDATE', id, qty }), []);
  const removeFromCart = useCallback((id) => dispatch({ type: 'REMOVE', id }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR' }), []);
  const subtotal = useMemo(() => state.items.reduce((sum, item) => sum + item.price * item.qty, 0), [state.items]);
  const value = useMemo(() => ({ items: state.items, subtotal, addToCart, updateQty, removeFromCart, clearCart }), [state.items, subtotal, addToCart, updateQty, removeFromCart, clearCart]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCartContext = () => useContext(CartContext);
