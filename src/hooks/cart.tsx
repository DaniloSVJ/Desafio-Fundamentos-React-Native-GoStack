import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const storedProdutcs = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );
      if (storedProdutcs) {
        setProducts([...JSON.parse(storedProdutcs)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = await products.find(p => p.id === product.id);

      if (productExists) {
        setProducts(
          products.map(p =>
            p.id === product.id
              ? { ...product, quantity: product.quantity + 1 }
              : p,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = await products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity + 1 } : p,
      );
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProducts = await products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
      );
      setProducts(newProducts);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );
  //

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
