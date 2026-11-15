const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Estados válidos según el caso de estudio
const ESTADOS_VALIDOS = ['Pendiente', 'En Proceso', 'Enviado', 'Entregado'];

// Base de datos simulada en memoria con un pedido de ejemplo
let pedidos = [
  {
    id: 1,
    cliente: 'Ana Gómez',
    productos: [
      { nombre: 'Laptop Pro', cantidad: 1 },
      { nombre: 'Mouse Inalámbrico', cantidad: 2 }
    ],
    direccionEnvio: 'Calle 123 #45-67, Bogotá',
    estado: 'Pendiente',
    fechaCreacion: '2026-11-10T10:00:00.000Z'
  }
];
let siguienteId = 2;

// Ruta de salud (útil para los Balanceadores de Carga de AWS)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', mensaje: 'API funcionando correctamente' });
});

// 1. CREAR PEDIDO
app.post('/api/pedidos', (req, res) => {
  const { cliente, productos, direccionEnvio } = req.body;

  if (!cliente || !productos || !Array.isArray(productos) || productos.length === 0 || !direccionEnvio) {
    return res.status(400).json({
      error: 'Faltan datos obligatorios: cliente, productos (lista no vacía) y direccionEnvio.'
    });
  }

  const nuevoPedido = {
    id: siguienteId++,
    cliente,
    productos,
    direccionEnvio,
    estado: 'Pendiente',
    fechaCreacion: new Date().toISOString()
  };

  pedidos.push(nuevoPedido);
  res.status(201).json(nuevoPedido);
});

// 2. VISUALIZAR PEDIDOS (con filtros por estado y ordenamiento por fecha)
app.get('/api/pedidos', (req, res) => {
  const { estado, ordenar } = req.query;
  let resultado = [...pedidos];

  // Filtrar por estado (?estado=Pendiente)
  if (estado) {
    resultado = resultado.filter(
      (p) => p.estado.toLowerCase() === estado.toLowerCase()
    );
  }

  // Ordenar por fecha de creación (?ordenar=asc o ?ordenar=desc)
  if (ordenar === 'asc') {
    resultado.sort((a, b) => new Date(a.fechaCreacion) - new Date(b.fechaCreacion));
  } else if (ordenar === 'desc') {
    resultado.sort((a, b) => new Date(b.fechaCreacion) - new Date(a.fechaCreacion));
  }

  res.status(200).json(resultado);
});

// 3. ACTUALIZAR ESTADO DEL PEDIDO
app.patch('/api/pedidos/:id/estado', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { estado } = req.body;

  if (!estado || !ESTADOS_VALIDOS.includes(estado)) {
    return res.status(400).json({
      error: `Estado inválido. Debe ser uno de: ${ESTADOS_VALIDOS.join(', ')}`
    });
  }

  const pedido = pedidos.find((p) => p.id === id);
  if (!pedido) {
    return res.status(404).json({ error: 'Pedido no encontrado.' });
  }

  pedido.estado = estado;
  res.status(200).json(pedido);
});

module.exports = app;
