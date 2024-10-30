import { CreateSignalOptions, Signal, WritableSignal, signal } from "@angular/core";
import { SignalGetter, SIGNAL, signalUpdateFn } from "@angular/core/primitives/signals";

export type PatchableSignal<T extends {}> = Signal<T> & WritableSignal<T> & 
  {
    /** Updates properties on an object */
    patch(value: Partial<T>): void;
  };

export function patchableSignal<T extends {}>(initialValue: T, options?: CreateSignalOptions<T>): PatchableSignal<T> {
  if(!initialValue){
    initialValue={} as T
  }
  const internal = signal<T>(initialValue) as SignalGetter<T> & WritableSignal<T>;
  const node = internal[SIGNAL];
  return Object.assign(internal, {
    patch: (value: Partial<T>) => signalUpdateFn(node, (x) => ({ ...x, ...value })),
  });
}