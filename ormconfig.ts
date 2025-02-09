import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import * as path from 'path';
import configuration from './src/common/config/configuration';

import { User } from "./src/database/entities/user.entity";
import { Post } from "./src/database/entities/post.entity";

dotenv.config();

const postgresConfig = configuration().database;

export default new DataSource({
  type: 'postgres',
  host: postgresConfig.host,
  port: postgresConfig.port,
  username: postgresConfig.user,
  password: postgresConfig.password,
  database: postgresConfig.database,
  entities: [User, Post],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: true,
});