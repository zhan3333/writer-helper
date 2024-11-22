import {bootstrapApplication} from '@angular/platform-browser';
import {appConfig} from './app/app.config';
import {AppComponent} from './app/app.component';
import {WindowSetBackgroundColour} from "../wailsjs/runtime";

WindowSetBackgroundColour(255, 255, 255, 0)

bootstrapApplication(AppComponent, appConfig)
    .catch((err) => console.error(err));
