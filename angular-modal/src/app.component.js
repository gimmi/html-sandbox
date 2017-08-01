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
        var me = this
        me.appDialog.open().then(function(ret) {
            me.logs.push('Dialog closed with value: ' + ret)
        })
        me.logs.push('Dialog open')
    },

    onModalOk: function() {
        this.appDialog.close(true)
    },

    onModalCancel: function() {
        this.appDialog.close(false)
    }
})