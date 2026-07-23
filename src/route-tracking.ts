import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

export function trackRoute(
    storage: { setRoute(route: string): void },
    router: Router
): void {
    router.events.pipe(
        filter( (event): event is NavigationEnd => 
            event instanceof NavigationEnd
    )).subscribe( ( event ) => {
        storage.setRoute(event.urlAfterRedirects);
    });
}