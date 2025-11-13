import React, { createContext, useContext, useState, useEffect } from 'react';

const CarritoContext = createContext();

export const useCarrito = () => {
  const context = useContext(CarritoContext);
  if (!context) {
    throw new Error('useCarrito debe ser usado dentro de CarritoProvider');
  }
  return context;
};

export const CarritoProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  // Cargar carrito del localStorage al iniciar
  useEffect(() => {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
      try {
        setItems(JSON.parse(carritoGuardado));
      } catch (error) {
        console.error('Error al cargar carrito:', error);
        localStorage.removeItem('carrito');
      }
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem('carrito', JSON.stringify(items));
  }, [items]);

  const agregarAlCarrito = (producto, cantidad = 1) => {
    setItems(prevItems => {
      const itemExistente = prevItems.find(item => item.producto.id === producto.id);
      
      if (itemExistente) {
        // Si ya existe, aumentar cantidad
        return prevItems.map(item =>
          item.producto.id === producto.id
            ? { ...item, cantidad: Math.min(item.cantidad + cantidad, producto.stock) }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        return [...prevItems, { producto, cantidad: Math.min(cantidad, producto.stock) }];
      }
    });
  };

  const actualizarCantidad = (productoId, cantidad) => {
    if (cantidad <= 0) {
      eliminarDelCarrito(productoId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.producto.id === productoId
          ? { ...item, cantidad: Math.min(cantidad, item.producto.stock) }
          : item
      )
    );
  };

  const eliminarDelCarrito = (productoId) => {
    setItems(prevItems => prevItems.filter(item => item.producto.id !== productoId));
  };

  const vaciarCarrito = () => {
    setItems([]);
  };

  const calcularTotal = () => {
    return items.reduce((total, item) => total + (item.producto.precio * item.cantidad), 0);
  };

  const calcularCantidadTotal = () => {
    return items.reduce((total, item) => total + item.cantidad, 0);
  };

  const value = {
    items,
    agregarAlCarrito,
    actualizarCantidad,
    eliminarDelCarrito,
    vaciarCarrito,
    calcularTotal,
    calcularCantidadTotal,
  };

  return (
    <CarritoContext.Provider value={value}>
      {children}
    </CarritoContext.Provider>
  );
};
