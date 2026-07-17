// Production safety utilities
// Prevents dangerous operations in production environment

export function checkProductionSafety(operation: string): void {
  const isProduction = process.env.NODE_ENV === 'production';
  
  if (!isProduction) {
    return; // Allow all operations in development
  }

  // Dangerous operations that should never run in production
  const DANGEROUS_OPERATIONS = [
    'DATABASE_RESET',
    'DATABASE_SEED',
    'FULL_MIGRATION_RESET',
    'DROP_TABLES',
    'DELETE_ALL_DATA'
  ];

  if (DANGEROUS_OPERATIONS.includes(operation)) {
    throw new Error(`🚫 PRODUCTION SAFETY: Operation "${operation}" is not allowed in production environment!`);
  }

  console.log(`✅ Production safety check passed for: ${operation}`);
}

export function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

export function requireDevelopmentEnvironment(operation: string): void {
  if (isProductionEnvironment()) {
    throw new Error(`🚫 PRODUCTION SAFETY: "${operation}" can only run in development environment!`);
  }
}
