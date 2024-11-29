import {Component, effect} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {BrowserOpenURL} from "../../../wailsjs/runtime";

@Component({
    selector: 'app-doubao',
    standalone: true,
    imports: [
        MatButton
    ],
    template: `
        <div class="m-2">
            <button mat-raised-button (click)="open()">打开豆包</button>
        </div>
    `,
    styles: ``
})
export class DouBaoComponent {
    constructor() {
        effect(() => {
            console.log('init')
        })
    }

    open() {
        BrowserOpenURL('https://www.doubao.com')
    }
}
