import { Signal } from '@angular/core';
import { StorageSchema, StorageSignalOptions } from '@jeanharo98/typed-storage';
type SignalStorage<T extends StorageSchema> = Record<keyof T, Signal<any>> & {
    set(key: keyof T, value: any): void;
    reset(key: keyof T): void;
    clear(): void;
};
export declare class TypedStorageService<T extends StorageSchema> {
    private _storage;
    private _signals;
    initialize(schema: T, options: StorageSignalOptions): SignalStorage<T>;
}
export {};
