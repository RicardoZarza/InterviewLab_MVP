# Traza

MVP de una plataforma de evaluaciones técnicas. Simula una entrevista de código en vivo:

1. **Landing**: el candidato escribe su nombre y elige una prueba.
2. **Pantalla de prueba**: explorador de archivos, editor Monaco (el motor de VS Code), consola de resultados y métricas en vivo (tiempo, intentos, líneas cambiadas).
3. **Reporte**: puntuación, historial de intentos y archivos modificados.

## Estado de la entrega

| Paso | Contenido | Estado |
| --- | --- | --- |
| 1 | Configuración general + Frontend (`/client`) | Listo |
| 2 | Backend Express: rutas, controladores, servicios (`/server`) | Listo |
| 3 | Persistencia PostgreSQL con Prisma | Pendiente |

El contrato que el frontend espera del backend está en [`docs/api-contract.md`](docs/api-contract.md).

## Requisitos

- Node.js 20 o superior
- npm 10 o superior

## Arranque

Mientras el backend no exista (paso 2), puedes levantar solo el frontend:

```bash
npm run install:client
npm run dev:client      # http://localhost:5173
```

La landing mostrará un aviso de conexión hasta que el servidor responda en `http://localhost:4000`.

Con frontend y backend:

```bash
npm run install:all
npm run dev
```

El backend escucha en `http://localhost:4000/api`. Las sesiones se guardan en memoria y se pierden al reiniciar el servidor; la persistencia PostgreSQL corresponde al paso 3.

## Arquitectura del cliente

```
pages/        Pantallas. Solo componen componentes y conectan el estado.
components/   UI reutilizable y presentacional (recibe datos por props).
context/      Estado global del MVP: reducer puro + provider con las acciones.
hooks/        Lógica reutilizable (cronómetro, diff de cambios, carga de pruebas).
services/     Todo lo que sale del navegador: cliente HTTP, API y tracker de eventos.
utils/        Funciones puras sin React (diff de líneas, árbol de archivos, formato).
```

Reglas que mantienen el código limpio:

- Los componentes de `components/` nunca llaman a la API; lo hace el contexto a través de `services/`.
- El estado se divide en dos contextos (estado y acciones). Los componentes que solo disparan acciones no se re-renderizan en cada tecla.
- El reducer es puro y no hace I/O; los efectos secundarios viven en el provider.
