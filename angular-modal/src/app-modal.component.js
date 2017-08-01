'use strict';

import _ from 'underscore'
import { Component } from '@angular/core'
import { EventEmitter } from '@angular/core'

import styles from './app-modal.component.css'
import template from './app-modal.component.html'

export default Component({
    selector: 'app-modal',
    styles: [ styles ],
    template: template,
    outputs: [
        'cancel'
    ],
}).Class({
    constructor: [function AppModalComponent() {
        this.cancel = new EventEmitter()

        this.resolve = null
    }],

    open: function() {
        var me = this
        return new Promise(function(resolve) { me.resolve = resolve })
    },

    close: function(value) {
        if (this.resolve) {
            this.resolve(value)
            this.resolve = null
        }
    },

    onOverlayKeydown: function(event) {
        if (event.key === 'Escape') {
            event.stopPropagation()
            this.cancel.emit({})
        }
    },

    onOverlayClick: function() {
        this.cancel.emit({})
    }
})
