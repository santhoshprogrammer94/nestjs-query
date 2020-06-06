import { Assembler, NestjsQueryCoreModule, Class } from '@nestjs-query/core';
import { DynamicModule, ForwardReference, Provider } from '@nestjs/common';
import { AutoResolverOpts, createResolvers } from './providers';
import { defaultPubSub, pubSubToken, GraphQLPubSub } from './subscription';

export interface NestjsQueryGraphqlModuleOpts {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  imports: Array<Class<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
  services?: Provider[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assemblers?: Class<Assembler<any, any>>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolvers: AutoResolverOpts<any, any, unknown, unknown>[];
  pubSub?: Provider<GraphQLPubSub>;
}

export class NestjsQueryGraphQLModule {
  static forFeature(opts: NestjsQueryGraphqlModuleOpts): DynamicModule {
    const coreModule = NestjsQueryCoreModule.forFeature({
      assemblers: opts.assemblers,
      imports: opts.imports,
    });
    const pubSubProvider = opts.pubSub ?? this.defaultPubSubProvider();
    const services = opts.services || [];
    const resolverProviders = createResolvers(opts.resolvers);
    return {
      module: NestjsQueryGraphQLModule,
      imports: [...opts.imports, coreModule],
      providers: [...services, ...resolverProviders, pubSubProvider],
      exports: [...resolverProviders, ...services, ...opts.imports, coreModule, pubSubProvider],
    };
  }

  static defaultPubSubProvider(): Provider<GraphQLPubSub> {
    return { provide: pubSubToken(), useValue: defaultPubSub() };
  }
}
