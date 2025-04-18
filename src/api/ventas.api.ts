import client from './client';

export interface Venta {
  id: number;
  cliente_id: number;
  servicio_id: number;
  monto: number;
  fecha: string;
  tienda_id: number;
}

export const getVentas = async (): Promise<Venta[]> => {
  const { data } = await client.get('/ventas');
  return data;
};

export const getVentaById = async (id: number): Promise<Venta> => {
  const { data } = await client.get(`/ventas/${id}`);
  return data;
};

export const createVenta = async (dto: Partial<Venta>): Promise<Venta> => {
  const { data } = await client.post('/ventas', dto);
  return data;
};

export const updateVenta = async (id: number, dto: Partial<Venta>): Promise<Venta> => {
  const { data } = await client.patch(`/ventas/${id}`, dto);
  return data;
};

export const deleteVenta = async (id: number): Promise<void> => {
  await client.delete(`/ventas/${id}`);
};
