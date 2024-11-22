import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class CacheService {
    // _http = inject(HttpClient)

    constructor() {
    }

    load(key: string): any {
        if (localStorage.getItem(key)) {
            return JSON.parse(localStorage.getItem(key)!)
        }
        return null
    }

    save(key: string, data: any) {
        localStorage.setItem(key, JSON.stringify(data))
    }
}
