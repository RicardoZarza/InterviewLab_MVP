import express from 'express';
import cors from 'cors'; // 1. Agregas esta importación
import { env } from './config/env.js';
import challengeRoutes from './routes/challengeRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';

const app = express();
app.disable('x-powered-by');

app.use(cors()); // 2. Habilitas CORS para aceptar peticiones desde Vercel
app.use(express.json({ limit: '1mb' }));
app.use('/api/challenges', challengeRoutes);
app.use('/api/sessions', sessionRoutes);

app.use((_request, response) => {
  response.status(404).json({
    error: { message: 'La ruta no existe.', code: 'NOT_FOUND', details: [] },
  });
});

app.use((error, _request, response, _next) => {
  if (error instanceof SyntaxError && 'body' in error) {
    return response.status(400).json({
      error: { message: 'El cuerpo JSON no es válido.', code: 'VALIDATION_ERROR', details: [] },
    });
  }
  if (error?.type === 'entity.too.large') {
    return response.status(413).json({
      error: { message: 'El cuerpo de la solicitud es demasiado grande.', code: 'PAYLOAD_TOO_LARGE', details: [] },
    });
  }

  console.error(error);
  return response.status(500).json({
    error: { message: 'Ocurrió un error interno.', code: 'INTERNAL_ERROR', details: [] },
  });
});

app.listen(env.port, () => {
  console.log(`[InterviewLab] API escuchando en http://localhost:${env.port}/api`);
});