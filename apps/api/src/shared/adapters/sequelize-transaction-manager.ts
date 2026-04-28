import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/sequelize';
import { Sequelize } from 'sequelize-typescript';
import {
  TransactionContext,
  TransactionManagerPort,
} from '../ports/transaction-manager.port';

@Injectable()
export class SequelizeTransactionManager implements TransactionManagerPort {
  constructor(@InjectConnection() private readonly sequelize: Sequelize) {}

  execute<T>(work: (ctx: TransactionContext) => Promise<T>): Promise<T> {
    return this.sequelize.transaction((t) => work(t as unknown as TransactionContext));
  }
}
