import { TriggerHandler } from "./handler";

type ID = string;

export type { ID };

export abstract class Action extends TriggerHandler {}
