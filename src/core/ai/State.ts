import { Environment } from '../world/Environment';
import { Entity } from '../entities/Entity';

export interface State<T> {
  readonly name: string;
  enter?(agent: T): void;
  update(agent: T, deltaTime: number, environment: Environment, entities: Entity[]): void;
  exit?(agent: T): void;
}