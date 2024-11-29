import {Component, inject} from '@angular/core';
import {ScopeType} from "./scopes.service";
import {MatButton} from "@angular/material/button";
import {MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {MatSnackBar} from "@angular/material/snack-bar";

export interface ScopeImportResult {
    scopeType: ScopeType
    scopes: { name: string, scope: number }[]
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
        MatStepperPrevious
    ],
    template: `
        <mat-dialog-content>

            <mat-stepper [linear]="true" #stepper>
                <mat-step [stepControl]="firstFormGroup">
                    <div [formGroup]="firstFormGroup" class="flex flex-col">
                        <ng-template matStepLabel>填写导入信息</ng-template>
                        <mat-form-field>
                            <mat-label>考试名称</mat-label>
                            <input matInput type="text" [formControl]="firstFormGroup.controls.scopeType"
                                   placeholder="期中考试"/>
                        </mat-form-field>
                        <mat-form-field>
                            <mat-label>粘贴 excel 内容，以换行分隔，需要携带名字</mat-label>
                            <textarea matInput [rows]="10" [formControl]="firstFormGroup.controls.importData"
                                      placeholder="张三\t99"></textarea>
                        </mat-form-field>
                        <div class="flex justify-end">
                            <button mat-button matStepperNext>下一步</button>
                        </div>
                    </div>
                </mat-step>
                <mat-step [stepControl]="secondFormGroup" label="Fill out your address">
                    <div class="flex flex-col">
                        <ng-template matStepLabel>预览导入内容</ng-template>
                        @for (scopeCtrl of secondFormGroup.controls; track scopeCtrl.value.name) {
                            <mat-form-field>
                                <mat-label>{{ scopeCtrl.value.name }}</mat-label>
                                <input matInput [formControl]="scopeCtrl.controls.scope" type="number" min="0"
                                       max="100">
                            </mat-form-field>
                        }

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
        scopeType: ['', Validators.required],
        importData: ['', Validators.required],
    })
    secondFormGroup = this._fb.array([] as Array<FormGroup<{
        name: FormControl<string>,
        scope: FormControl<number>
    }>>)

    constructor() {
        this.firstFormGroup.controls.importData.valueChanges.subscribe(data => {
            const lines = data.split('\n')
            if (lines.length > 0) {
                this.secondFormGroup.clear()
                for (let line of lines) {
                    const [name, scope] = line.split('\t')
                    this.secondFormGroup.push(this._fb.group({
                        name: name.replaceAll(' ', ''),
                        scope: +scope,
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
            scopeType: this.firstFormGroup.value.scopeType!,
            scopes: this.secondFormGroup.value.map(scope => {
                return {
                    name: scope.name!,
                    scope: scope.scope!,
                }
            }),
        })
    }
}
