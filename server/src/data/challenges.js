const challenge = {
  id: 'cart-total',
  title: 'Descuento en el carrito',
  difficulty: 'easy',
  estimatedMinutes: 15,
  description: 'Corrige el cálculo del total para aplicar correctamente el descuento.',
  instructions: [
    'Revisa cómo se calcula el subtotal a partir del precio y la cantidad.',
    'Aplica el descuento al subtotal sin alterar los argumentos de la función.',
    'Ejecuta las pruebas y comprueba los casos con y sin descuento.',
  ],
  entryFile: 'src/pricing.js',
  files: [
    {
      path: 'src/pricing.js',
      language: 'javascript',
      content: `export function calculateTotal(price, quantity, discount) {
  const subtotal = price * quantity;
  return subtotal + discount;
}
`,
    },
  ],
  tests: [
    { name: 'Aplica el descuento al subtotal', args: [10, 2, 3], expected: 17 },
    { name: 'Mantiene el subtotal si no hay descuento', args: [8, 3, 0], expected: 24 },
    { name: 'Admite cantidades decimales', args: [2.5, 4, 1], expected: 9 },
    { name: 'Admite un descuento negativo como recargo', args: [5, 2, -2], expected: 12 },
  ],
};

export function getChallenge(id) {
  return id === challenge.id ? challenge : null;
}

export function listChallengeSummaries() {
  const { id, title, difficulty, estimatedMinutes, description } = challenge;
  return [{ id, title, difficulty, estimatedMinutes, description }];
}

export function toPublicChallenge(source) {
  const { tests: _tests, ...publicChallenge } = source;
  return structuredClone(publicChallenge);
}