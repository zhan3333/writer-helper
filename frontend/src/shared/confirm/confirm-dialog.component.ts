import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

@Component({
    standalone: true,
  imports: [
    MatDialogActions,
    MatButton,
    MatDialogContent,
    MatDialogTitle
  ],
    template: `
        <mat-dialog-content>
            @if (data.title) {
                <h1 mat-dialog-title>{{ data.title }}</h1>
            }
            @if (data.content) {
                <p>{{ data.content }}</p>
            }
        </mat-dialog-content>
        <mat-dialog-actions>
            <button mat-button (click)="_dialogRef.close(false)">Cancel</button>
            <button mat-raised-button color="primary" (click)="_dialogRef.close(true)">Ok</button>
        </mat-dialog-actions>
    `,
    styles: ``
})
export class ConfirmDialog {
    data: { title: string, content: string } = inject(MAT_DIALOG_DATA)
    _dialogRef: MatDialogRef<ConfirmDialog, boolean> = inject(MatDialogRef<ConfirmDialog>)
}
