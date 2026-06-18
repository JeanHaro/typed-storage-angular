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
- **All typed-storage features** — TTL, cross-tab sync, prefix, sessionStorage, MemoryStorage fallback

---

## 📦 Installation

```bash
npm install @jeanharo98/typed-storage @jeanharo98/typed-storage-angular
# or
pnpm add @jeanharo98/typed-storage @jeanharo98/typed-storage-angular
```

> Both packages are required — `@jeanharo98/typed-storage` is a peer dependency.

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

## ⚙️ Options

All options from `@jeanharo98/typed-storage` are supported:

```typescript
ts.initialize(schema, {
    prefix: 'myapp',        // Prefix keys — 'myapp:theme'
    storage: 'session',     // Use sessionStorage instead of localStorage
    ttl: 3600000,           // Expire after 1 hour
    sync: true,             // Sync across browser tabs
    encrypt: true,          // Shows security warning (see typed-storage docs)
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `prefix` | `string` | — | Prepends `prefix:` to every key |
| `storage` | `'local' \| 'session'` | `'local'` | Storage type |
| `ttl` | `number` | — | Time to live in milliseconds |
| `sync` | `boolean` | `false` | Cross-tab sync via StorageEvent |
| `encrypt` | `boolean` | `false` | Shows security warning |

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
        └── clear()          ← clears all keys + updates all Signals
```

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

#### Difference between `reset()`, `remove()` and `clear()`

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
// todas las keys vuelven a su initialValue
```

---

## 🆚 Comparison

| Feature | Manual approach | typed-storage-angular |
|---------|----------------|----------------------|
| localStorage persistence | ✅ manual | ✅ automatic |
| Angular Signal | ✅ manual `signal()` | ✅ automatic |
| Cross-tab sync | ❌ manual `StorageEvent` | ✅ automatic |
| TTL / expiration | ❌ manual | ✅ built-in |
| Type safety | ⚠️ partial | ✅ full |
| Prefix namespacing | ❌ manual | ✅ built-in |
| Lines of code (4 keys) | ~25 lines | ~5 lines |

---

## 🔗 Related

- **[@jeanharo98/typed-storage](https://github.com/JeanHaro/typed-storage)** — Core library (required peer dependency)
- **@jeanharo98/typed-storage-react** — React wrapper (coming soon)

---

## 📄 License

MIT