'use strict';

import './index.css'

import { enableProdMode } from '@angular/core'
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic'
import { NgModule } from '@angular/core'

import AppModule from './app.module'
import AppComponent from './app.component'

var IndexModule = NgModule({
    imports: [ AppModule ],
    bootstrap: [ AppComponent ]
}).Class({
    constructor: function IndexModule() {
    }
})

if (IS_PRODUCTION_BUILD) {
    enableProdMode()
}

platformBrowserDynamic().bootstrapModule(IndexModule);
