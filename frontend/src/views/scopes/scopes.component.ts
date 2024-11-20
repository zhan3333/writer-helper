import {ChangeDetectorRef, Component, computed, effect, inject, signal, viewChild} from '@angular/core';
import {
    MatCell,
    MatCellDef,
    MatColumnDef,
    MatHeaderCell,
    MatHeaderCellDef,
    MatHeaderRow,
    MatHeaderRowDef,
    MatRow,
    MatRowDef,
    MatTable,
    MatTableDataSource
} from "@angular/material/table";
import {Scope, ScopesService, ScopeType} from "./scopes.service";
import {MatButton, MatIconButton} from "@angular/material/button";
import {
    MatDialog,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatCommonModule, MatRipple} from "@angular/material/core";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {UpdateScopeNumberComponent} from "./update-scope-number.component";
import {MatSort, MatSortModule, Sort} from "@angular/material/sort";
import {MatIcon, MatIconModule} from "@angular/material/icon";

@Component({
    selector: 'app-scopes',
    standalone: true,
    imports: [
        MatTable,
        MatColumnDef,
        MatHeaderCell,
        MatHeaderCellDef,
        MatCell,
        MatCellDef,
        MatHeaderRow,
        MatRow,
        MatHeaderRowDef,
        MatRowDef,
        MatButton,
        MatRipple,
        MatSortModule,
        MatIconButton,
        MatIcon,
        MatIconModule,
    ],
    templateUrl: './scopes.component.html',
})
export class ScopesComponent {
    scopeService = inject(ScopesService)
    _dialog = inject(MatDialog)
    cdRef = inject(ChangeDetectorRef)
    _sort = viewChild.required(MatSort)
    displayedColumns = computed(() => {
        return this.scopeService.columns()
    });
    dataSource = new MatTableDataSource<Scope>([])

    constructor() {
        effect(() => {
            this.dataSource.data = this.scopeService.scopes()
            this.cdRef.detectChanges()
        });
        effect(() => {
            this.dataSource.sort = this._sort()
        });
    }

    addStudent() {
        this._dialog.open(AddStudentDialog, {
            width: '400px'
        }).afterClosed().subscribe((name: string | undefined) => {
            if (name) {
                this.scopeService.addStudent(name)
            }
        })
    }

    addScopeType() {
        this._dialog.open(AddScopeTypeDialog, {
            width: '400px'
        }).afterClosed().subscribe((name: string | undefined) => {
            if (name) {
                this.scopeService.addScopeType(name)
            }
        })
    }

    updateScopeNumber(name: string, scopeType: ScopeType, scope: number) {
        this._dialog.open(UpdateScopeNumberComponent, {
            width: '400px',
            data: {scope: scope}
        }).afterClosed().subscribe(v => {
            if (v !== undefined) {
                this.scopeService.updateScope(name, scopeType, v)
            }
        })
    }

    sortChange($event: Sort) {
        console.log('sort change', $event)
        this.scopeService.sort($event.active, $event.direction)
    }

    delStudent(name: string) {
        this.scopeService.delStudent(name)
    }
}

@Component({
    selector: 'app-add-student-dialog',
    standalone: true,
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatFormField,
        MatCommonModule,
        MatLabel,
        MatDialogTitle,
        MatDialogContent,
        MatInput,
        FormsModule,
    ],
    template: `
        <h1 mat-dialog-title>添加学生</h1>
        <div mat-dialog-content>
            <mat-form-field>
                <mat-label>学生姓名</mat-label>
                <input matInput placeholder="学生姓名" [(ngModel)]="name">
            </mat-form-field>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button matDialogClose>取消</button>
            <button mat-raised-button (click)="confirm()" [disabled]="name().length == 0">确定</button>
        </div>
    `,
})
class AddStudentDialog {
    name = signal('')
    dialogRef = inject(MatDialogRef<AddStudentDialog>)

    constructor() {
    }

    confirm() {
        this.dialogRef.close(this.name())
    }
}


@Component({
    selector: 'app-add-scope-type-dialog',
    standalone: true,
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogClose,
        MatFormField,
        MatCommonModule,
        MatLabel,
        MatDialogTitle,
        MatDialogContent,
        MatInput,
        FormsModule,
    ],
    template: `
        <h1 mat-dialog-title>添加考试</h1>
        <div mat-dialog-content>
            <mat-form-field>
                <mat-label>考试名称</mat-label>
                <input matInput placeholder="考试名称" [(ngModel)]="name">
            </mat-form-field>
        </div>
        <div mat-dialog-actions align="end">
            <button mat-button matDialogClose>取消</button>
            <button mat-raised-button (click)="confirm()" [disabled]="name().length == 0">确定</button>
        </div>
    `,
})
class AddScopeTypeDialog {
    name = signal('')
    dialogRef = inject(MatDialogRef<AddScopeTypeDialog>)

    constructor() {
    }

    confirm() {
        this.dialogRef.close(this.name())
    }
}
