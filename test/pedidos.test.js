const request = require('supertest');
const app = require('../src/app');

describe('Pruebas de la API de Gestión de Pedidos', () => {
  test('GET /health - Debe responder 200 OK', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
  });

  test('POST /api/pedidos - Debe crear un nuevo pedido', async () => {
    const nuevoPedido = {
      cliente: 'Carlos Pérez',
      productos: [{ nombre: 'Teclado Mecánico', cantidad: 1 }],
      direccionEnvio: 'Av. Siempre Viva 742'
    };

    const res = await request(app).post('/api/pedidos').send(nuevoPedido);
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.estado).toBe('Pendiente');
  });

  test('GET /api/pedidos - Debe listar y filtrar pedidos', async () => {
    const res = await request(app).get('/api/pedidos?estado=Pendiente&ordenar=desc');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('PATCH /api/pedidos/:id/estado - Debe actualizar el estado', async () => {
    const res = await request(app)
      .patch('/api/pedidos/1/estado')
      .send({ estado: 'Enviado' });

    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('Enviado');
  });
});
