export interface TransactionContext {}

export interface TransactionManagerPort {
  execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T>;
}

export const TRANSACTION_MANAGER = Symbol('TRANSACTION_MANAGER');
