/*
1. Recibe el mismo schema que createStorage
2. Crea el storage interno con typed-storage
3. Por cada key → crea un Signal de Angular
4. Conecta onChange() del storage → actualiza el Signal
5. Expone set(), reset(), clear() que sincronizan ambos
*/
import { signal } from '@angular/core';
import { createStorage } from '@jeanharo98/typed-storage';
export class TypedStorageService {
    constructor() {
        this._signals = {};
    }
    initialize(schema, options) {
        // 1. Crea el storage core
        this._storage = createStorage(schema, options);
        // 2. Por cada key del schema:
        for (const key of Object.keys(schema)) {
            // crea un signal con el valor inicial
            const sig = signal(this._storage[key]());
            // conecta onChange para que actualice el signal
            this._storage[key].onChange((newValue) => {
                sig.set(newValue);
            });
            this._signals[key] = sig;
        }
        // 3. Crea el objeto resultado con signals + métodos
        const result = {};
        // Copiamos los signals al resultado
        for (const key of Object.keys(schema)) {
            result[key] = this._signals[key];
        }
        // Agregamos los métodos
        result.set = (key, value) => {
            this._storage[key].set(value); // Actualizamos el storage
            this._signals[key].set(value); // Actualizamos el signal
        };
        result.reset = (key) => {
            this._storage[key].reset(); // Reseteamos el storage
            this._signals[key].set(this._storage[key]()); // Actualizamos el signal
        };
        result.remove = (key) => {
            this._storage[key].remove(); // borra del localStorage
            this._signals[key].set(undefined); // Signal queda undefined
        };
        result.has = (key) => {
            return this._storage[key].has();
        };
        result.clear = () => {
            this._storage.clear(); // Limpiamos el storage
            for (const k of Object.keys(schema)) {
                this._signals[k].set(this._storage[k]()); // Actualizamos todos los signals
            }
        };
        // 4. Retorna el resultado
        return result;
    }
}
