import {Component} from '@angular/core';
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {DownloadComponent} from "../views/download/download.component";
import {RuiwenDownloadComponent} from "../views/ruiwen-download/ruiwen-download.component";

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [MatTabGroup, MatTab, DownloadComponent, RuiwenDownloadComponent],
    templateUrl: './app.component.html',
})
export class AppComponent {
    title = 'Writer Helper';
}
