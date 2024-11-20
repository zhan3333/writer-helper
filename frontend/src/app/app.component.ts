import {Component, effect, signal} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DownloadComponent} from "../views/download/download.component";
import {RuiwenDownloadComponent} from "../views/ruiwen-download/ruiwen-download.component";
import {ScopesComponent} from "../views/scopes/scopes.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [MatTabGroup, MatTab, DownloadComponent, RuiwenDownloadComponent, ScopesComponent],
    templateUrl: './app.component.html',
})
export class AppComponent {
    title = 'Writer Helper';
    selectedIndex = signal(0);

    constructor() {
        localStorage.getItem('main-tabs-index') && this.selectedIndex.set(+localStorage.getItem('main-tabs-index')!)

        effect(() => {
            localStorage.setItem('main-tabs-index', this.selectedIndex().toString())
        });
    }
}
