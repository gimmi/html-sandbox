'use strict';

import { Component, ViewChild } from '@angular/core';

import _ from 'underscore'
import styles from './app.component.css'
import template from './app.component.html'

import AppModalComponent from './app-modal.component'

export default Component({
    selector: 'app-component',
    styles: [styles],
    template: template,
    queries: {
        appDialog: new ViewChild(AppModalComponent)
    }
}).Class({
    constructor: [function AppComponent() {
        this.message = 'Hello World'
        this.logs = []
    }],

    onOpenClick: function() {
        this.appDialog.open()
        this.logs.push('Dialog open')
    },

    onModalOk: function() {
        this.appDialog.close()
        this.logs.push('Dialog confirmed')
    },

    onModalCancel: function() {
        this.appDialog.close()
        this.logs.push('Dialog canceled')
    }
})