import {Component, computed, inject, signal} from '@angular/core';
import {ScopeType} from "./scopes.service";
import {MatButton} from "@angular/material/button";
import {MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatSnackBar} from "@angular/material/snack-bar";
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
    MatTable
} from "@angular/material/table";

export interface ScopeImportResult {
    scopes: { name: string, scopes: { [key: ScopeType]: number } }[]
}

@Component({
    selector: 'app-scope-import',
    standalone: true,
    imports: [
        MatButton,
        MatDialogContent,
        MatFormField,
        MatInput,
        MatLabel,
        ReactiveFormsModule,
        MatStepper,
        MatStep,
        MatStepLabel,
        MatStepperNext,
        MatStepperPrevious,
        MatTable,
        MatColumnDef,
        MatHeaderCell,
        MatCell,
        MatCellDef,
        MatHeaderCellDef,
        MatRow,
        MatHeaderRow,
        MatHeaderRowDef,
        MatRowDef
    ],
    template: `
        <mat-dialog-content>

            <mat-stepper [linear]="true" #stepper>
                <mat-step [stepControl]="firstFormGroup">
                    <div [formGroup]="firstFormGroup" class="flex flex-col">
                        <ng-template matStepLabel>填写导入信息</ng-template>
                        <span>- 粘贴 excel 内容，以换行分隔</span>
                        <span>- 首行为标题+考试名称，需要携带学生名字</span>
                        <span>- 已存在的考试名称不会重复录入，需要删除考试后再次导入</span>
                        <mat-form-field>
                            <mat-label>{{ '粘贴 excel 内容' }}</mat-label>
                            <textarea matInput [rows]="10" [formControl]="firstFormGroup.controls.importData"
                                      placeholder="姓名\t考试1\t考试2\n张三\t99\t98"></textarea>
                        </mat-form-field>
                        <div class="flex justify-end">
                            <button mat-button matStepperNext>下一步</button>
                        </div>
                    </div>
                </mat-step>
                <mat-step [stepControl]="secondFormGroup" label="Fill out your address">
                    <div class="flex flex-col">
                        <ng-template matStepLabel>预览导入内容</ng-template>

                        <table mat-table [dataSource]="secondFormGroup.controls" class="mat-elevation-z8 my-2">
                            <!--- Note that these columns can be defined in any order.
                                  The actual rendered columns are set as a property on the row definition" -->

                            <!--name-->
                            <ng-container matColumnDef="name">
                                <th mat-header-cell *matHeaderCellDef>姓名</th>
                                <td mat-cell *matCellDef="let lineCtrl"> {{ lineCtrl.value.name }}</td>
                            </ng-container>

                            <!--scopes-->
                            @for (scopeType of scopeTypes(); let index = $index; track scopeType) {
                                <ng-container matColumnDef="{{scopeType}}">
                                    <th mat-header-cell *matHeaderCellDef>{{ scopeType }}</th>
                                    <td mat-cell *matCellDef="let lineCtrl"> {{ lineCtrl.value.scopes![scopeType] }}
                                    </td>
                                </ng-container>
                            }

                            <tr mat-header-row *matHeaderRowDef="displayHeaders()"></tr>
                            <tr mat-row *matRowDef="let row; columns: displayHeaders();"></tr>
                        </table>

                        <div class="flex justify-end">
                            <button mat-button matStepperPrevious>上一步</button>
                            <button color="" mat-button (click)="_dialogRef.close()">取消</button>
                            <button mat-raised-button color="primary" (click)="confirm()"
                                    [disabled]="firstFormGroup.invalid || secondFormGroup.invalid">提交
                            </button>
                        </div>
                    </div>
                </mat-step>
            </mat-stepper>
        </mat-dialog-content>
    `,
    styles: ``
})
export class ScopeImportComponent {
    _fb = inject(NonNullableFormBuilder)
    _dialogRef: MatDialogRef<ScopeImportComponent, ScopeImportResult> = inject(MatDialogRef<ScopeImportComponent>)
    _snack = inject(MatSnackBar)
    firstFormGroup = this._fb.group({
        importData: ['', Validators.required],
    })
    secondFormGroup = this._fb.array([] as Array<FormGroup<{
        name: FormControl<string>, // 学生姓名
        scopes: FormGroup<{ [key: string]: FormControl<number> }>
    }>>)
    scopeTypes = signal<string[]>([])
    displayHeaders = computed(() => {
        return ['name', ...this.scopeTypes()]
    })

    constructor() {
        this.firstFormGroup.controls.importData.valueChanges.subscribe(data => {
            const lines = data.split('\n')
            if (lines.length > 1) {
                // header
                const sps = lines[0].split('\t')
                this.scopeTypes.set(sps.slice(1)) // first header cell is "姓名"
                this.secondFormGroup.clear()
                for (let i = 1; i < lines.length; i++) {
                    const line = lines[i]
                    const sps = line.split('\t')
                    const scopes: FormGroup<{ [key: string]: FormControl<number> }> = this._fb.group({})
                    for (let j = 0; j < this.scopeTypes().length; j++) {
                        const scopeType = this.scopeTypes()[j]
                        const scope = sps[j + 1]
                        let scopeNum = 0
                        if (!isNaN(+scope)) {
                            scopeNum = +scope
                        }
                        scopes.addControl(scopeType, this._fb.control(scopeNum))  // first sp is student name
                    }
                    this.secondFormGroup.push(this._fb.group({
                        name: sps[0].replaceAll(' ', ''), // student name
                        scopes: scopes,
                    }))
                }
                this._snack.open('解析成功', '关闭')
            } else {
                this._snack.open('无有效数据', '关闭')
            }
            console.log("form", this.secondFormGroup.value)
        })
    }

    confirm() {
        this._dialogRef.close({
            scopes: this.secondFormGroup.value.map(scope => {
                let scopes: { [key: ScopeType]: number } = {}
                for (let scopeType in scope.scopes) {
                    scopes[scopeType] = scope.scopes[scopeType] || 0
                }
                return {
                    name: scope.name!,
                    scopes: scopes,
                }
            }),
        })
    }
}
