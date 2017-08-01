'use strict';

import './app.module.css'

import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'
import { HttpClientModule } from '@angular/common/http'
import { FormsModule } from '@angular/forms'

import AppComponent from './app.component'
import AppModalComponent from './app-modal.component'
import AppModalFocusDirective from './app-modal-focus.directive'

export default NgModule({
    imports: [
        BrowserModule,
        HttpClientModule,
        FormsModule
    ],
    declarations: [
        AppComponent,
        AppModalComponent,
        AppModalFocusDirective
    ],
    providers: [
    ]
}).Class({
    constructor: function AppModule() {
    }
})
