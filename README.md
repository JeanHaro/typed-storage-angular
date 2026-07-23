# @jeanharo98/typed-storage-angular

Angular wrapper for [@jeanharo98/typed-storage](https://github.com/JeanHaro/typed-storage) with native Angular Signals integration and automatic localStorage sync.

```typescript
@Service()
export class StorageService {
    storage: AppStorage;

    constructor() {
        const ts = new TypedStorageService();
        this.storage = ts.initialize({
            theme: 'dark' as 'dark' | 'light',
            language: 'es' as 'es' | 'en',
            fontSize: 16,
        }, { prefix: 'app', sync: true }) as unknown as AppStorage;
    }
}

// In your template:
// {{ storageService.storage.theme() }}  ← native Angular Signal
```

---

## ✨ Features

- **Native Angular Signals** — every storage key becomes a `Signal<T>`
- **Automatic sync** — `onChange()` updates Signals when storage changes
- **Zoneless compatible** — works with Angular 22+ zoneless change detection
- **Type-safe** — full TypeScript support with your own interfaces
- **`trackRoute()`** — automatic route-based value sync via Angular Router
- **All typed-storage features** — TTL, cross-tab sync, prefix, sessionStorage, MemoryStorage fallback, `destroy()`, `batch()`, `routeOverrides`

---

## 📦 Installation

```bash
npm install @jeanharo98/typed-storage @jeanharo98/typed-storage-angular
# or
pnpm add @jeanharo98/typed-storage @jeanharo98/typed-storage-angular
```

> Both packages are required — `@jeanharo98/typed-storage` is a peer dependency. `@angular/router` is required only if you use `trackRoute()`.

---

## 🚀 Usage

### 1. Define your storage interface

```typescript
import { Signal } from '@angular/core';

interface AppStorage {
    theme: Signal<'dark' | 'light'>;
    language: Signal<'es' | 'en'>;
    fontSize: Signal<number>;
    sidebarOpen: Signal<boolean>;
    set(key: string, value: any): void;
    reset(key: string): void;
    remove(key: string): void;
    has(key: string): boolean;
    clear(): void;
    destroy(): void;
    setRoute(route: string): void;
}
```

### 2. Create a service

```typescript
import { Service } from '@angular/core';
import { TypedStorageService } from '@jeanharo98/typed-storage-angular';
import { Signal } from '@angular/core';

@Service()
export class StorageService {
    storage: AppStorage;

    constructor() {
        const ts = new TypedStorageService();
        this.storage = ts.initialize({
            theme: 'dark' as 'dark' | 'light',
            language: 'es' as 'es' | 'en',
            fontSize: 16,
            sidebarOpen: true,
        }, {
            prefix: 'app',   // keys stored as 'app:theme', 'app:language', etc.
            sync: true       // sync across browser tabs
        }) as unknown as AppStorage;
    }
}
```

### 3. Use in components

```typescript
import { Component, inject } from '@angular/core';
import { StorageService } from './storage.service';

@Component({
    selector: 'app-root',
    template: `
        <p>Theme: {{ storageService.storage.theme() }}</p>
        <p>Language: {{ storageService.storage.language() }}</p>
        <p>FontSize: {{ storageService.storage.fontSize() }}</p>
        <p>¿Tiene theme? {{ storageService.storage.has('theme') }}</p>

        <button (click)="storageService.storage.set('theme', 'light')">Light</button>
        <button (click)="storageService.storage.set('theme', 'dark')">Dark</button>
        <button (click)="storageService.storage.reset('theme')">Reset</button>
        <button (click)="storageService.storage.remove('theme')">Remove Theme</button>
        <button (click)="storageService.storage.clear()">Clear All</button>
    `
})
export class App {
    storageService = inject(StorageService);
}
```

---

## 🗑️ Scoped storage with `destroy()`

Same as the core library — completely removes all schema keys, useful for data that should only exist while a specific page/component is active:

```typescript
@Component({ selector: 'app-products' })
export class ProductsComponent implements OnDestroy {
    storageService = inject(StorageService);

    ngOnDestroy(): void {
        this.storageService.storage.destroy();
        // → all keys removed from localStorage when leaving this component
    }
}
```

See the [typed-storage README](https://github.com/JeanHaro/typed-storage#-scoped--temporary-storage-with-destroy) for when to use `destroy()` vs `ttl`.

---

## 🧭 Route-based values with `trackRoute()`

If your schema uses `routeOverrides`, connect it to Angular Router automatically — no manual subscription needed:

```typescript
import { Router } from '@angular/router';
import { TypedStorageService, trackRoute } from '@jeanharo98/typed-storage-angular';

@Service()
export class StorageService {
    storage: AppStorage;

    constructor(private router: Router) {
        const ts = new TypedStorageService();
        this.storage = ts.initialize({
            theme: 'dark' as 'dark' | 'light',
        }, {
            prefix: 'app',
            routeOverrides: {
                '/': { theme: 'dark' },
                '/about': { theme: 'light' }
            }
        }) as unknown as AppStorage;

        trackRoute(this.storage, this.router);
        // Now navigating to /about automatically sets theme to 'light',
        // and navigating to / sets it back to 'dark' — no manual setRoute() calls
    }
}
```

`trackRoute()` subscribes to `router.events`, filters for `NavigationEnd`, and calls `storage.setRoute(event.urlAfterRedirects)` on every navigation. See the [typed-storage README](https://github.com/JeanHaro/typed-storage#-different-values-per-route-with-routeoverrides) for the full `routeOverrides` documentation, including how to remove a key entirely for a specific route using `null`.

---

## ⚙️ Options

All options from `@jeanharo98/typed-storage` are supported:

```typescript
ts.initialize(schema, {
    prefix: 'myapp',        // Prefix keys — 'myapp:theme'
    storage: 'session',     // Use sessionStorage instead of localStorage
    ttl: 3600000,           // Expire after 1 hour
    sync: true,             // Sync across browser tabs
    routeOverrides: {       // Different values per route
        '/checkout': { currency: null }
    },
    encrypt: true,          // Requires 'secret' — see typed-storage docs for security notes
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | — | Prepends `prefix:` to every key |
| `storage` | `'local' \| 'session'` | `'local'` | Storage type |
| `ttl` | `number` | — | Time to live in milliseconds |
| `sync` | `boolean` | `false` | Cross-tab sync via StorageEvent |
| `routeOverrides` | `Record<string, Record<string, any>>` | — | Per-route key values, applied via `setRoute()` / `trackRoute()` |
| `encrypt` | `boolean` | `false` | Requires `secret` — see [typed-storage security notes](https://github.com/JeanHaro/typed-storage#-encryption-xor-obfuscation) |

---

## 🔔 How it works

```
TypedStorageService.initialize()
  │
  ├── createStorage(schema, options)    ← from @jeanharo98/typed-storage
  │
  ├── For each key in schema:
  │     ├── signal(storage[key]())      ← creates Angular Signal with initial value
  │     └── storage[key].onChange()     ← connects storage changes to Signal
  │
  └── Returns object with:
        ├── theme()          ← Signal getter
        ├── language()       ← Signal getter
        ├── set(key, value)  ← updates storage + Signal
        ├── reset(key)       ← resets to initialValue + updates Signal
        ├── remove(key)      ← removes key from storage + sets Signal to undefined
        ├── has(key)         ← checks if key exists in storage
        ├── clear()          ← clears all keys + updates all Signals
        ├── destroy()        ← removes ALL keys completely + updates all Signals
        └── setRoute(route)  ← applies routeOverrides for that route + updates Signals
```

`destroy()` and `setRoute()` don't need manual Signal syncing — internally they call `.set()`/`.remove()` on the core signals, which already have `onChange` wired to the Angular Signals from step 2.

---

## 📋 API Reference

### `TypedStorageService`

#### `initialize(schema, options?)`

Creates a storage object with Angular Signals.

| Parameter | Type | Description |
|-----------|------|-------------|
| `schema` | `StorageSchema` | Object with keys and initial values |
| `options` | `StorageSignalOptions` | Optional configuration |

Returns an object where each key is a `Signal<T>`, plus the following methods:

#### Methods

| Method | Description |
|--------|-------------|
| `set(key, value)` | Updates the value in storage and syncs the Signal |
| `reset(key)` | Resets to `initialValue` in storage and syncs the Signal |
| `remove(key)` | Removes the key from localStorage and sets Signal to `undefined` |
| `has(key)` | Returns `true` if the key exists in storage |
| `clear()` | Calls `reset()` on all keys and syncs all Signals |
| `destroy()` | Completely removes all keys and syncs all Signals |
| `setRoute(route)` | Applies the `routeOverrides` entry for `route`, if any, and syncs Signals |

#### Difference between `reset()`, `remove()`, `clear()` and `destroy()`

```typescript
// reset(key) — vuelve al initialValue pero mantiene la key en localStorage
storage.reset('theme');
// localStorage['app:theme'] = '"dark"' — sigue existiendo
// storage.theme() → 'dark' (initialValue)

// remove(key) — borra la key del localStorage completamente
storage.remove('theme');
// localStorage['app:theme'] — ya no existe
// storage.theme() → undefined

// clear() — reset() en todas las keys del schema
storage.clear();
// todas las keys vuelven a su initialValue, pero SIGUEN existiendo en localStorage

// destroy() — remove() en todas las keys del schema
storage.destroy();
// todas las keys DESAPARECEN completamente de localStorage
```

### `trackRoute(storage, router)`

Subscribes `storage.setRoute()` to Angular Router navigation events automatically.

| Parameter | Type | Description |
|-----------|------|-------------|
| `storage` | `{ setRoute(route: string): void }` | Any object exposing `setRoute()` — normally the result of `initialize()` |
| `router` | `Router` | An injected instance of Angular's `Router` |

---

## 🆚 Comparison

| Feature | Manual approach | typed-storage-angular |
|---------|----------------|----------------------|
| localStorage persistence | ✅ manual | ✅ automatic |
| Angular Signal | ✅ manual `signal()` | ✅ automatic |
| Cross-tab sync | ❌ manual `StorageEvent` | ✅ automatic |
| TTL / expiration | ❌ manual | ✅ built-in |
| Route-based values | ❌ manual router subscription | ✅ `trackRoute()` |
| Type safety | ⚠️ partial | ✅ full |
| Prefix namespacing | ❌ manual | ✅ built-in |
| Lines of code (4 keys) | ~25 lines | ~5 lines |

---

## 🔗 Related

- **[@jeanharo98/typed-storage](https://github.com/JeanHaro/typed-storage)** — Core library (required peer dependency)
- **[@jeanharo98/typed-storage-react](https://github.com/JeanHaro/typed-storage-react)** — React wrapper
- **[typed-storage-devtools](https://github.com/JeanHaro/typed-storage-devtools)** — Chrome DevTools extension for real-time inspection

---

## 📄 License

MIT