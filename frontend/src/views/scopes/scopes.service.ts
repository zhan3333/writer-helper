import {computed, Injectable, signal} from '@angular/core';
import {SortDirection} from "@angular/material/sort";

export type ScopeType = string

export interface Scope {
    name: string;
    scopes: {
        [key: ScopeType]: number
    }
}

@Injectable({
    providedIn: 'root'
})
export class ScopesService {
    public scopes = signal<Scope[]>([])
    columns = computed((): string[] => {
        if (this.scopes().length == 0) {
            return []
        }
        return ['actions', 'name', ...Object.keys(this.scopes()[0].scopes)]
    })
    scopeTypes = computed((): string[] => {
        if (this.scopes().length == 0) {
            return []
        }
        return Object.keys(this.scopes()[0].scopes)
    })

    constructor() {
        localStorage.getItem('scopes') && this.scopes.set(JSON.parse(localStorage.getItem('scopes')!))
        console.log('load from local storage', this.scopes())
    }

    sync() {
        console.log('sync to local storage', this.scopes())
        localStorage.setItem('scopes', JSON.stringify(this.scopes()))
    }

    addStudent(name: string) {
        let scope: Scope = {
            name: name,
            scopes: {}
        }
        for (let scopeType of this.scopeTypes()) {
            scope.scopes[scopeType] = 0
        }
        this.addScope(scope)
    }

    delStudent(name: string) {
        this.scopes.update(scopes => {
            return scopes.filter(scope => scope.name != name)
        })
        this.sync()
    }

    addScope(scope: Scope) {
        this.scopes.update(scopes => {
            return [...scopes, scope]
        })
        this.sync()
    }

    addScopeType(t: string) {
        this.scopes.update(scopes => {
            return [
                ...scopes.map(scope => {
                    scope.scopes[t] = 0
                    return scope
                })
            ]
        })
        this.sync()
    }

    updateScope(name: string, type: ScopeType, value: number) {
        this.scopes.update(scopes => {
            return scopes.map(scope => {
                if (scope.name == name) {
                    scope.scopes[type] = +value
                }
                return scope
            })
        })
        this.sync()
    }

    sort(active: string, direction: SortDirection) {
        this.scopes.update(scopes => {
            return scopes.sort((a, b) => {
                if (a.scopes[active] < b.scopes[active]) {
                    return direction === 'asc' ? -1 : 1
                } else if (a.scopes[active] > b.scopes[active]) {
                    return direction === 'asc' ? 1 : -1
                } else {
                    return 0
                }
            })
        })
    }
}
