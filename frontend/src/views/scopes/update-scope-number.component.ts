import {Component, inject, signal} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

@Component({
    standalone: true,
    imports: [
        MatDialogContent,
        MatDialogActions,
        MatButton,
        FormsModule,
        MatLabel,
        MatFormField,
        MatInput
    ],
    template: `
        <mat-dialog-content>
            <mat-form-field>
                <mat-label>分数</mat-label>
                <input [(ngModel)]="newScope" matInput type="number">
            </mat-form-field>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button mat-button (click)="_dialogRef.close()">取消</button>
            <button mat-raised-button (click)="confirm()">确认</button>
        </mat-dialog-actions>
    `,
})
export class UpdateScopeNumberComponent {
    _dialogRef = inject(MatDialogRef<UpdateScopeNumberComponent>)
    data: { scope: number } = inject(MAT_DIALOG_DATA)
    newScope = signal(this.data.scope)

    constructor() {
    }

    confirm() {
        this._dialogRef.close(this.newScope())
    }
}
