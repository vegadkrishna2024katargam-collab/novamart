import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);
  const toggleWishlist = useCallback((product) => {
    setItems((current) => (current.some((item) => item.id === product.id) ? current.filter((item) => item.id !== product.id) : [...current, product]));
  }, []);
  const isWishlisted = useCallback((id) => items.some((item) => item.id === id), [items]);
  const value = useMemo(() => ({ items, toggleWishlist, isWishlisted }), [items, toggleWishlist, isWishlisted]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlistContext = () => useContext(WishlistContext);
