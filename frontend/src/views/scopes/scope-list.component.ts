import {Component, inject, signal, viewChild} from '@angular/core';
import {
    MAT_DIALOG_DATA,
    MatDialogActions,
    MatDialogContent,
    MatDialogRef,
    MatDialogTitle
} from "@angular/material/dialog";
import {ScopeType} from "./scopes.service";
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {ConfirmService} from "../../shared/confirm/confirm.service";
import {MatTab, MatTabGroup} from "@angular/material/tabs";
import {MatSnackBar} from "@angular/material/snack-bar";

export interface ScopeListChangeResult {
    scopeType: string
    delete: boolean
    scopes: { name: string, scope: number }[]
}

@Component({
    selector: 'app-scope-list',
    standalone: true,
    imports: [
        MatDialogContent,
        MatFormField,
        MatLabel,
        MatInput,
        MatDialogActions,
        MatButton,
        ReactiveFormsModule,
        MatDialogTitle,
        MatTabGroup,
        MatTab,
    ],
    template: `
        <mat-dialog-content>
            <mat-tab-group [(selectedIndex)]="tabIndex">
                <h1 mat-dialog-title>{{ data.scopeType }} 成绩更新</h1>
                <mat-tab label="更新">
                    <form class="flex flex-col">
                        @for (scopeCtrl of form.controls; track scopeCtrl.value.name) {
                            <mat-form-field>
                                <mat-label>{{ scopeCtrl.value.name }}</mat-label>
                                <input matInput [formControl]="scopeCtrl.controls.scope" type="number" min="0"
                                       max="100">
                            </mat-form-field>
                        }
                    </form>
                </mat-tab>
                <mat-tab label="导入">
                    <div class="flex flex-col">
                        <mat-form-field>
                            <mat-label>粘贴 excel 内容，以换行分隔，需要携带名字</mat-label>
                            <textarea matInput [rows]="10" [formControl]="import" placeholder="张三\t99"></textarea>
                        </mat-form-field>
                        <button color="primary" mat-raised-button (click)="parseImport()" [disabled]="import.invalid">解析
                        </button>
                    </div>
                </mat-tab>
            </mat-tab-group>

        </mat-dialog-content>
        <mat-dialog-actions align="end" class="space-x-2">
            <button color="warn" mat-button (click)="delScopeType()">删除</button>
            <button color="" mat-button (click)="_dialogRef.close()">取消</button>
            <button color="primary" mat-raised-button (click)="confirm()">确认</button>
        </mat-dialog-actions>
    `,
    styles: ``
})
export class ScopeListComponent {
    data: {
        scopeType: ScopeType
        scopes: {
            name: string
            scope: number
        }[]
    } = inject(MAT_DIALOG_DATA)
    _dialogRef: MatDialogRef<ScopeListComponent, ScopeListChangeResult | null> = inject(MatDialogRef<ScopeListComponent>)
    _fb = inject(NonNullableFormBuilder)
    _confirm = inject(ConfirmService)
    _snack = inject(MatSnackBar)
    _tabGroup = viewChild.required(MatTabGroup)
    form = this._fb.array(this.data.scopes.map(scope => {
        return this._fb.group(scope)
    }))
    import = this._fb.control('', [Validators.required])
    tabIndex = signal(0)

    confirm() {
        this._dialogRef.close({
            delete: false,
            scopeType: this.data.scopeType,
            scopes: this.form.value.map(scope => {
                return {
                    name: scope.name!,
                    scope: scope.scope!,
                }
            }),
        })
    }

    delScopeType() {
        this._confirm.open({
            title: '确认删除 ' + this.data.scopeType + ' ?',
        }).afterClosed().subscribe(v => {
            if (v) {
                this._dialogRef.close({
                    delete: true,
                    scopeType: this.data.scopeType,
                    scopes: [],
                })
            }
        })
    }

    parseImport() {
        const lines = this.import.value.split('\n')
        if (lines.length > 0) {
            this.form.clear()
            for (let line of lines) {
                const [name, scope] = line.split('\t')
                this.form.push(this._fb.group({
                    name: name.replaceAll(' ', ''),
                    scope: +scope,
                }))
            }
            this.tabIndex.set(0)
            this._snack.open('解析成功', '关闭')
        } else {
            this._snack.open('无有效数据', '关闭')
        }
        console.log("form", this.form.value)
    }
}
