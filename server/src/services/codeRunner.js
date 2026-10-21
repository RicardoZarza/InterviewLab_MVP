import { performance } from 'node:perf_hooks';
import { parse } from 'acorn';

const MAX_SOURCE_LENGTH = 20_000;
const MAX_AST_NODES = 1_000;
const MAX_EVALUATION_STEPS = 1_000;
const ALLOWED_BINARY_OPERATORS = new Set(['+', '-', '*', '/']);

function findFunction(source) {
  if (typeof source !== 'string' || source.length > MAX_SOURCE_LENGTH) {
    throw new Error('El archivo supera el tamaño permitido.');
  }

  const ast = parse(source, { ecmaVersion: 'latest', sourceType: 'module' });
  if (ast.body.length !== 1 || ast.body[0].type !== 'ExportNamedDeclaration') {
    throw new Error('Se esperaba una única función exportada.');
  }

  const declaration = ast.body[0].declaration;
  if (
    declaration?.type !== 'FunctionDeclaration' ||
    declaration.id?.name !== 'calculateTotal' ||
    declaration.async ||
    declaration.generator ||
    declaration.params.length !== 3
  ) {
    throw new Error('La función calculateTotal debe recibir precio, cantidad y descuento.');
  }

  let nodeCount = 0;
  const countNodes = (node) => {
    if (!node || typeof node !== 'object' || typeof node.type !== 'string') return;
    nodeCount += 1;
    if (nodeCount > MAX_AST_NODES) throw new Error('El código supera el límite de complejidad.');
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) value.forEach(countNodes);
      else countNodes(value);
    }
  };
  countNodes(declaration);

  return declaration;
}

function evaluateExpression(node, scope, budget) {
  budget.steps += 1;
  if (budget.steps > MAX_EVALUATION_STEPS) throw new Error('Se superó el límite de ejecución.');

  if (node.type === 'Literal' && typeof node.value === 'number' && Number.isFinite(node.value)) {
    return node.value;
  }
  if (node.type === 'Identifier' && Object.hasOwn(scope, node.name)) return scope[node.name];
  if (node.type === 'UnaryExpression' && (node.operator === '+' || node.operator === '-')) {
    const value = evaluateExpression(node.argument, scope, budget);
    return node.operator === '-' ? -value : value;
  }
  if (
    node.type === 'BinaryExpression' &&
    ALLOWED_BINARY_OPERATORS.has(node.operator)
  ) {
    const left = evaluateExpression(node.left, scope, budget);
    const right = evaluateExpression(node.right, scope, budget);
    switch (node.operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '*': return left * right;
      case '/': return left / right;
      default: break;
    }
  }

  throw new Error('La solución contiene una operación no permitida por el simulador.');
}

function evaluateFunction(fn, args) {
  const scope = Object.create(null);
  fn.params.forEach((parameter, index) => {
    if (parameter.type !== 'Identifier') throw new Error('Los parámetros deben ser identificadores simples.');
    scope[parameter.name] = args[index];
  });

  const budget = { steps: 0 };
  for (const statement of fn.body.body) {
    if (statement.type === 'VariableDeclaration' && statement.kind === 'const') {
      for (const declaration of statement.declarations) {
        if (declaration.id.type !== 'Identifier' || !declaration.init || Object.hasOwn(scope, declaration.id.name)) {
          throw new Error('Declaración no permitida en la solución.');
        }
        scope[declaration.id.name] = evaluateExpression(declaration.init, scope, budget);
      }
      continue;
    }
    if (statement.type === 'ReturnStatement' && statement.argument) {
      const result = evaluateExpression(statement.argument, scope, budget);
      if (!Number.isFinite(result)) throw new Error('El resultado debe ser un número finito.');
      return result;
    }
    throw new Error('Solo se permiten declaraciones const y un return en el simulador.');
  }

  throw new Error('La función debe devolver un resultado.');
}

export function runChallenge(challenge, files) {
  const startedAt = performance.now();
  const source = files[challenge.entryFile];
  let fn;
  let executionError;

  try {
    fn = findFunction(source);
  } catch (error) {
    executionError = error instanceof SyntaxError ? `Error de sintaxis: ${error.message}` : error.message;
  }

  const tests = challenge.tests.map((test) => {
    if (!fn) return { name: test.name, passed: false, message: executionError };

    try {
      const actual = evaluateFunction(fn, test.args);
      const passed = Math.abs(actual - test.expected) < 1e-9;
      return {
        name: test.name,
        passed,
        ...(passed ? {} : { message: `Se esperaba ${test.expected} y se obtuvo ${actual}.` }),
      };
    } catch (error) {
      return { name: test.name, passed: false, message: error.message };
    }
  });

  const passed = tests.every((test) => test.passed);
  const failedTests = tests.filter((test) => !test.passed);
  return {
    passed,
    durationMs: Math.max(0, Math.round(performance.now() - startedAt)),
    tests,
    stdout: [`${tests.length - failedTests.length}/${tests.length} pruebas superadas.`],
    ...(executionError ? { stderr: executionError } : {}),
  };
}