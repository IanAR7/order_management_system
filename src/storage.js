// Generador de ID temporal para items dentro de un pedido (no para la DB)
export const uid = () => Math.random().toString(36).slice(2, 9);
