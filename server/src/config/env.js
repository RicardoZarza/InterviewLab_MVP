const port = Number.parseInt(process.env.PORT ?? '4000', 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un puerto válido entre 1 y 65535.');
}

export const env = Object.freeze({ port });