'use strict';

import _ from 'underscore'
import { Component, ContentChild } from '@angular/core'
import { EventEmitter } from '@angular/core'

import styles from './app-modal.component.css'
import template from './app-modal.component.html'

import AppModalFocusDirective from './app-modal-focus.directive'

export default Component({
    selector: 'app-modal',
    styles: [ styles ],
    template: template,
    outputs: [
        'cancel'
    ],
    queries: {
        appModalFocus: new ContentChild(AppModalFocusDirective) // See https://stackoverflow.com/a/34327754/66629
    }
}).Class({
    constructor: [function AppModalComponent() {
        // Inspired by http://blog.angular-university.io/angular-ng-content/
        // And https://stackoverflow.com/a/40144809/66629

        this.cancel = new EventEmitter()

        this.isOpen = false
        this.timeoutId = null
        this.modalClass = 'modal fade'
    }],

    open: function() {
        var me = this
        if (!me.isOpen) {
            if (me.appModalFocus) {
                me.appModalFocus.scheduleFocus()
            }
            me.modalClass = 'modal fade app-modal'
            clearTimeout(me.timeoutId)
            me.timeoutId = setTimeout(function() { me.modalClass = 'modal fade app-modal in' }, 100);
            me.isOpen = true
        }
    },

    close: function(value) {
        var me = this
        if (me.isOpen) {
            me.isOpen = false
            me.modalClass = 'modal fade app-modal'
            clearTimeout(me.timeoutId)
            me.timeoutId = setTimeout(function() { me.modalClass = 'modal fade' }, 300);
        }
    },

    onOverlayKeydown: function(event) {
        if (event.key === 'Escape' || event.key === 'Esc') {
            event.stopPropagation()
            this.cancel.emit({})
        }
    },

    onOverlayClick: function() {
        this.cancel.emit({})
    }
})
