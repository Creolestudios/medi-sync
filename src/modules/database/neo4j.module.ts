import { DynamicModule, Global, Module } from '@nestjs/common';
import neo4j, { Driver } from 'neo4j-driver';
import { NEO4J_DRIVER, NEO4J_CONFIG } from './neo4j.constants';
import { Neo4jConfig } from './neo4j-config.interface';

@Global()
@Module({})
export class Neo4jModule {
  static forRoot(config: Neo4jConfig): DynamicModule {
    return {
      module: Neo4jModule,
      providers: [
        {
          provide: NEO4J_CONFIG,
          useValue: config,
        },
        {
          provide: NEO4J_DRIVER,
          inject: [NEO4J_CONFIG],
          useFactory: async (config: Neo4jConfig) => {
            const driver: Driver = neo4j.driver(
              config.uri,
              neo4j.auth.basic(config.user, config.password),
              {
                maxConnectionPoolSize: 50,
                connectionTimeout: 30000,
                connectionAcquisitionTimeout: 60000,
                disableLosslessIntegers: true,
              },
            );
            try {
              const serverInfo = await driver.getServerInfo();
              console.log('Neo4j Connection established');
              console.log(serverInfo);
              return driver;
            } catch (error) {
              console.error('Failed to connect to Neo4j:', error);
              throw error;
            }
          },
        },
      ],
      exports: [NEO4J_DRIVER],
    };
  }
}
