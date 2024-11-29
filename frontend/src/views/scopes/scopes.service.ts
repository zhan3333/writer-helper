import {computed, inject, Injectable, signal} from '@angular/core';
import {SortDirection} from "@angular/material/sort";
import {CacheService} from "../../shared/cache.service";

export type ScopeType = string

export interface Scope {
    name: string;
    scopes: {
        [key: ScopeType]: number
    }
}

export interface ScopeWithRank {
    name: string;
    scopes: {
        [key: ScopeType]: {
            rank: number;
            rankChange: number;
            value: number;
            valueChange: number;
        }
    }
}


@Injectable({
    providedIn: 'root'
})
export class ScopesService {
    public scopes = signal<Scope[]>([])

    columns = computed((): string[] => {
        const basicColumns = ['actions', 'name']
        if (this.scopes().length == 0) {
            return basicColumns
        }
        return [...basicColumns, ...Object.keys(this.scopes()[0].scopes)]
    })
    scopeTypes = computed((): string[] => {
        if (this.scopes().length == 0) {
            return []
        }
        return Object.keys(this.scopes()[0].scopes)
    })
    private readonly _cache = inject(CacheService)

    constructor() {
        this.load()
    }

    load() {
        const data = this._cache.load('scopes')
        if (data) {
            this.scopes.set(data)
        }
        console.log('load from local storage', this.scopes())
    }

    sync() {
        this._cache.save('scopes', this.scopes())
        console.log('sync to local storage', this.scopes())
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

    delScopeType(t: ScopeType) {
        this.scopes.update(scopes => {
            return [
                ...scopes.map(scope => {
                    delete scope.scopes[t]
                    return scope
                })
            ]
        })
        this.sync()
    }

    isStudentExist(name: string) {
        return this.scopes().some(scope => scope.name == name)
    }

    isScopeTypeExist(scopeType: ScopeType): boolean {
        return this.scopes().some(scope => scope.scopes[scopeType] !== undefined)
    }

    updateScope(name: string, type: ScopeType, value: number) {
        if (!this.isScopeTypeExist(type)) {
            this.addScopeType(type)
        }
        if (!this.isStudentExist(name)) {
            this.addStudent(name)
        }
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

    clearAllData() {
        this.scopes.set([])
        this.sync()
    }
}
