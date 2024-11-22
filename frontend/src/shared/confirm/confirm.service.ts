import {inject, Injectable} from '@angular/core';
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {ConfirmDialog} from "./confirm-dialog.component";

@Injectable({
    providedIn: 'root'
})
export class ConfirmService {
    _dialog = inject(MatDialog)

    constructor() {
    }

    open(options: { title?: string, message?: string }): MatDialogRef<ConfirmDialog, boolean> {
        return this._dialog.open(ConfirmDialog, {
            data: {
                title: options.title,
                message: options.message
            }
        })
    }
}
