import {Component, inject, signal} from '@angular/core';
import {
    MatCard,
    MatCardActions,
    MatCardContent,
    MatCardHeader,
    MatCardSubtitle,
    MatCardTitle,
    MatCardTitleGroup
} from "@angular/material/card";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {FormsModule} from "@angular/forms";
import {MatCommonModule} from "@angular/material/core";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {NgIf} from "@angular/common";
import {DownloadRuiWenUrl} from "../../../wailsjs/go/main/App";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
    selector: 'app-ruiwen-download',
    standalone: true,
    imports: [
        MatCard,
        MatCardContent,
        MatFormField,
        MatInput,
        FormsModule,
        MatCommonModule,
        MatButton,
        MatProgressSpinner,
        NgIf,
        MatLabel,
        MatCardTitle,
        MatCardHeader,
        MatCardActions,
        MatCardTitleGroup,
        MatCardSubtitle,
    ],
    templateUrl: './ruiwen-download.component.html',
})
export class RuiwenDownloadComponent {
    ruiwenUrl = signal('https://xiaoxue.ruiwen.com/jiaoxuesheji/176009.html');
    downloading = signal<boolean>(false);
    snack = inject(MatSnackBar);
    content = signal<string>('');

    async downloadRuiwen() {
        if (this.ruiwenUrl().length == 0) {
            this.snack.open('必须传入url', '关闭')
            return
        }
        try {
            this.downloading.set(true)
            const content = await DownloadRuiWenUrl(this.ruiwenUrl())
            console.log('content', content)
            this.content.set(content)
        } catch (e) {
            this.snack.open('下载失败: ' + e, '关闭')
        }
        this.downloading.set(false)
    }

    async copyContent() {
        // await ClipboardSetText(this.content())
        let text = document.getElementById('content');
        if (!text) {
            this.snack.open('查找 content 元素失败')
            return
        }

        if (window.getSelection) {
            const selection = window.getSelection();
            if (!selection) {
                this.snack.open('无法获取 selection')
                return
            }
            const range = document.createRange();
            range.selectNodeContents(text);
            selection.removeAllRanges();
            selection.addRange(range);
            await navigator.clipboard.writeText(selection.toString());
            this.snack.open('复制成功，可以到 word 中粘贴', '关闭')
        } else {
            alert("none");
        }

    }
}
