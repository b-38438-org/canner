import path from 'path';
import Koa, { Context } from 'koa';
import { Gqlify } from '@gqlify/server';
import { ScalarField } from '@gqlify/server/lib/dataModel';
import { DataModelType } from '@gqlify/server/lib/dataModel/type';
import { CannerSchemaToGQLifyParser } from '@gqlify/canner-schema-to-gqlify-model';
import { readFileSync } from 'fs';
import { ApolloServer, gql } from 'apollo-server-koa';
import GraphQLJSON from 'graphql-type-json';
import {
  GraphQLDateTime
} from 'graphql-iso-date';
import { WebService, Logger } from '../common/interface';
import { GqlifyConfig } from './config';
import { readOnlyMiddleware } from '../common/graphql';
import { makeExecutableSchema } from 'graphql-tools';
import { applyMiddleware } from 'graphql-middleware';
import { apolloErrorHandler } from './error';
import { createContext } from './context';

export class GraphQLService implements WebService {
  private logger: Logger;
  private apolloServer: ApolloServer;

  constructor(config: GqlifyConfig = {}) {
    if (!config.dataSources) {
      throw new Error(`require dataSources`);
    }

    // logger
    this.logger = config.logger;

    // Read datamodel
    const schemaPath = path.resolve(process.cwd(), config.schemaPath || 'canner.schema.json');
    const cannerSchema = JSON.parse(readFileSync(schemaPath, { encoding: 'utf8' }));
    const parser = new CannerSchemaToGQLifyParser(cannerSchema);

    const {models, rootNode} = parser.parse();

    // add unique id
    for (const model of models) {
      const idField = model.getField('id');
      if (!idField) {
        model.appendField(
          'id',
          new ScalarField({ type: DataModelType.ID, nonNull: true, unique: true, autoGen: true }));
      }
    }

    // construct gqlify
    const gqlify = new Gqlify({
      rootNode,
      models,
      dataSources: config.dataSources,
      scalars: {
        JSON: GraphQLJSON,
        DateTime: GraphQLDateTime,
      },
    });

    const { typeDefs, resolvers } = gqlify.createApolloConfig();
    const schema = makeExecutableSchema({
      typeDefs: typeDefs as any,
      resolvers
    });
    const schemaWithMiddleware = applyMiddleware(schema, readOnlyMiddleware);

    // context
    const context = config.context || createContext(config);

    this.apolloServer = new ApolloServer({
      debug: true,
      playground: config.graphqlPlayground,
      schema: schemaWithMiddleware as any,
      formatError: (error: any) => {
        return apolloErrorHandler(error, this.logger);
      },
      context,
    });
  }

  public async mount(app: Koa) {
    this.apolloServer.applyMiddleware({app});
  }
}