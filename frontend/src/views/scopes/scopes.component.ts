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
import {ConfirmService} from "../../shared/confirm/confirm.service";
import {ScopeListChangeResult, ScopeListComponent} from "./scope-list.component";
import {ScopeImportComponent, ScopeImportResult} from "./scope-import.component";
import {MatSnackBar} from "@angular/material/snack-bar";

interface Rank {
    rank: number
    scope: number
    rankChange: number
    scopeChange: number
}

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
    _confirm = inject(ConfirmService)
    _snack = inject(MatSnackBar)
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
        }, {allowSignalWrites: true});
        effect(() => {
            this.dataSource.sort = this._sort()
        });
    }

    rank(scope: Scope, scopeType: ScopeType): Rank {
        // 计算 rank: 当前考试中所在的排名
        let rank = this.getRank(scope.name, scopeType)
        // 前一次排名
        let previousRank = 0
        // 前一次成绩
        let previousScope = 0
        // 这次的成绩
        let scopeNumber = this.getScopeNumber(scope.name, scopeType)
        const previousScopeType = this.getPreviousScopeType(scope.name, scopeType)
        if (previousScopeType) {
            // 有前一次考试，计算前一次考试排名与成绩
            previousRank = this.getRank(scope.name, previousScopeType)
            previousScope = this.getScopeNumber(scope.name, previousScopeType)
        }


        // 计算 rankChange
        // 计算 scopeChange
        return {
            rank: rank,
            rankChange: previousRank - rank,
            scope: scopeNumber,
            scopeChange: scopeNumber - previousScope,
        }
    }

    addStudent() {
        this._dialog.open(AddStudentDialog, {
            minWidth: '400px'
        }).afterClosed().subscribe((name: string | undefined) => {
            if (name) {
                this.scopeService.addStudent(name)
            }
        })
    }

    addScopeType() {
        this._dialog.open(AddScopeTypeDialog, {
            minWidth: '400px'
        }).afterClosed().subscribe((name: string | undefined) => {
            if (name) {
                this.scopeService.addScopeType(name)
            }
        })
    }

    delScopeType(t: ScopeType) {
        this._confirm.open({
            title: '确认删除 ' + t + ' ?',
        }).afterClosed().subscribe(v => {
            if (v) {
                this.scopeService.delScopeType(t)
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
        this._confirm.open({
            title: '确认删除学生 ' + name + ' ?',
        }).afterClosed().subscribe(v => {
            if (v) {
                this.scopeService.delStudent(name)
            }
        })
    }

    isFirstScopeType(scopeType: ScopeType): boolean {
        return this.scopeService.scopeTypes()[0] == scopeType
    }

    showScopeTypeList(scopeType: string) {
        this._dialog.open(ScopeListComponent, {
            minWidth: '400px',
            data: {
                scopeType: scopeType,
                scopes: this.getScopeTypeScopes(scopeType)
            }
        }).afterClosed().subscribe((result: ScopeListChangeResult | null) => {
            if (result) {
                if (result.delete) {
                    this.scopeService.delScopeType(result.scopeType)
                } else {
                    for (let i = 0; i < result.scopes.length; i++) {
                        this.scopeService.updateScope(
                            result.scopes[i].name,
                            result.scopeType,
                            result.scopes[i].scope
                        )
                    }
                }
            }
        })
    }

    import() {
        this._dialog.open(ScopeImportComponent, {
            minWidth: '600px',
            data: {}
        }).afterClosed().subscribe((result: ScopeImportResult | null) => {
            if (result) {
                for (let i = 0; i < result.scopes.length; i++) {
                    this.scopeService.updateScope(
                        result.scopes[i].name,
                        result.scopeType,
                        result.scopes[i].scope
                    )
                }
                this._snack.open(`${result.scopeType} 考试导入 ${result.scopes.length} 个学生成绩成功`, '关闭')
            }
        })
    }

    clearAllData() {
        this._confirm.open({title: '确认清空所有数据?'}).afterClosed().subscribe(v => {
            if (v) {
                this.scopeService.clearAllData()
                this._snack.open('清空成功', '关闭')
            }
        })
    }

    private getScopeNumber(name: string, scopeType: ScopeType): number {
        for (let scope of this.scopeService.scopes()) {
            if (scope.name == name) {
                return scope.scopes[scopeType]
            }
        }
        return 0
    }

    private getPreviousScopeType(name: string, scopeType: ScopeType): ScopeType | null {
        let index = this.scopeService.scopeTypes().indexOf(scopeType)
        if (index == 0) {
            return null
        } else {
            return this.scopeService.scopeTypes()[index - 1]
        }
    }

    private getRank(name: string, scopeType: ScopeType): number {
        const studentScopes: { name: string, scope: number }[] = []
        for (let s of this.scopeService.scopes()) {
            studentScopes.push({
                name: s.name,
                scope: s.scopes[scopeType]
            })
        }

        studentScopes.sort((a, b) => {
            if (a.scope < b.scope) {
                return 1
            } else if (a.scope > b.scope) {
                return -1
            } else {
                return 0
            }
        })

        let rank = 0
        for (let i = studentScopes.length - 1; i >= 0; i--) {
            if (studentScopes[i].name == name) {
                rank = i + 1
            }
        }

        return rank
    }

    private getScopeTypeScopes(scopeType: ScopeType): { name: string, scope: number }[] {
        const studentScopes: { name: string, scope: number }[] = []
        for (let s of this.scopeService.scopes()) {
            studentScopes.push({
                name: s.name,
                scope: s.scopes[scopeType]
            })
        }

        return studentScopes
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
            <form (submit)="confirm()">
                <mat-form-field>
                    <mat-label>学生姓名</mat-label>
                    <input matInput placeholder="学生姓名" [(ngModel)]="name" name="student name">
                </mat-form-field>
            </form>
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
            <form (submit)="confirm()">
                <mat-form-field>
                    <mat-label>考试名称</mat-label>
                    <input matInput placeholder="考试名称" [(ngModel)]="name" name="exam name">
                </mat-form-field>
            </form>
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
