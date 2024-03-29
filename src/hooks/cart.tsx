import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

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
      // Carregar os produtos do local Storage
      const productsLoad = await AsyncStorage.getItem('@GoMarketplace:products');

      // Verificar se há dados salvos no local storage
      if (productsLoad) {
        setProducts([...JSON.parse(productsLoad)]);
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(async product => {
    const productsExists = products.find(prod => prod.id === product.id);

    // Se o produto existir, será acrescentado em quantity
    if (productsExists) {
      setProducts(
        products.map(prod =>
          prod.id === product.id ? { ...product, quantity: prod.quantity + 1 } : prod
        )
      );
    } else {
      setProducts([...products, { ...product, quantity: 1 }]);
    }

    // Salvar os produtos adicionados em storage
    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(products),
    )

  }, [products]);

  const increment = useCallback(async id => {
    const newProducts = products.map(product =>
      product.id === id
      ? { ...product, quantity: product.quantity + 1 }
      : product,
    )

    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts),
    )
  }, [products]);

  const decrement = useCallback(async id => {
    const newProducts = products.map(product =>
      product.id === id
      ? { ...product, quantity: product.quantity - 1 }
      : product,
    )

    setProducts(newProducts);

    await AsyncStorage.setItem(
      '@GoMarketplace:products',
      JSON.stringify(newProducts),
    )
  }, [products]);

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
