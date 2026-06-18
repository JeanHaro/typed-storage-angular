import { Provider } from '@angular/core';

// Service
import { TypedStorageService } from './storage.service';

export function provideTypedStorage() {
    return new TypedStorageService;
}