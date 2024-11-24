import {Component, effect, inject, signal} from '@angular/core';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatCommonModule} from "@angular/material/core";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
    DownloadUrl,
    GetDefaultSaveDirectory,
    GetDownloadOutput,
    GetFfmpegPath,
    SelectSaveDirectory
} from "../../../wailsjs/go/main/App";

@Component({
    selector: 'app-download',
    standalone: true,
    imports: [
        MatCard,
        MatCardHeader,
        MatCardContent,
        MatFormField,
        MatCardTitle,
        MatInput,
        FormsModule,
        MatButton,
        MatLabel,
        MatCommonModule,

    ],
    templateUrl: './download.component.html',
})
export class DownloadComponent {
    videoUrl = signal('https://xhslink.com/a/GpOObl8LT33Z')
    savePath = signal('');
    videoName = signal('');
    downloading = signal(false)
    downloadOutput = signal('')
    ffmpegPath = signal('')

    snack = inject(MatSnackBar)

    constructor() {
        effect(async () => {
            this.savePath.set(await GetDefaultSaveDirectory())
        });
        effect(() => {
            setInterval(async () => {
                const out = await GetDownloadOutput()
                if (out != "") {
                    this.downloadOutput.set(out)
                    console.log('download output', out)
                }
            }, 500)
        })
        effect(async () => {
            this.ffmpegPath.set(await GetFfmpegPath())
        });
    }

    async downloadVideo() {
        console.log('download start')
        if (!this.savePath()) {
            this.snack.open('请选择保存文件夹', '关闭')
        }
        this.downloading.set(true)
        try {
            await DownloadUrl(this.videoUrl(), this.savePath())
            this.snack.open('下载成功', '关闭')
        } catch (e) {
            this.snack.open('下载失败: ' + e, '关闭')
        }

        this.downloading.set(false)

    }

    async selectSaveDirectory() {
        const selectedDir = await SelectSaveDirectory()
        console.log('select dir', selectedDir)
        this.savePath.set(selectedDir)
    }
}
