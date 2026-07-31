export function readPortEnv(environment, name, fallback) {
  const port = readPositiveIntegerEnv(environment, name, fallback);
  if (port > 65_535) throw new Error(`${name} must be a valid TCP port`);
  return port;
}

export function readPositiveIntegerEnv(environment, name, fallback) {
  const value = environment[name];
  if (value === undefined) return fallback;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${name} must be a positive integer`);
  return number;
}
