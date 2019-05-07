import * as tslib_1 from "tslib";
var DaterangepickerComponent_1;
import { Component, ElementRef, ViewChild, EventEmitter, Output, Input, forwardRef, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { FormControl } from '@angular/forms';
import * as _moment from 'moment';
import { LocaleService } from './locale.service';
const moment = _moment;
export var SideEnum;
(function (SideEnum) {
    SideEnum["left"] = "left";
    SideEnum["right"] = "right";
})(SideEnum || (SideEnum = {}));
let DaterangepickerComponent = DaterangepickerComponent_1 = class DaterangepickerComponent {
    constructor(el, _ref, _localeService) {
        this.el = el;
        this._ref = _ref;
        this._localeService = _localeService;
        this._old = { start: null, end: null };
        this.calendarVariables = { left: {}, right: {} };
        this.timepickerVariables = { left: {}, right: {} };
        this.daterangepicker = { start: new FormControl(), end: new FormControl() };
        this.applyBtn = { disabled: false };
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.dateLimit = null;
        // used in template for compile time support of enum values.
        this.sideEnum = SideEnum;
        this.minDate = null;
        this.maxDate = null;
        this.autoApply = false;
        this.singleDatePicker = false;
        this.showDropdowns = false;
        this.showWeekNumbers = false;
        this.showISOWeekNumbers = false;
        this.linkedCalendars = false;
        this.autoUpdateInput = true;
        this.alwaysShowCalendars = false;
        this.maxSpan = false;
        // timepicker variables
        this.timePicker = false;
        this.timePicker24Hour = false;
        this.timePickerIncrement = 1;
        this.timePickerSeconds = false;
        // end of timepicker variables
        this.showClearButton = false;
        this.firstMonthDayClass = null;
        this.lastMonthDayClass = null;
        this.emptyWeekRowClass = null;
        this.firstDayOfNextMonthClass = null;
        this.lastDayOfPreviousMonthClass = null;
        this._locale = {};
        // custom ranges
        this._ranges = {};
        this.showCancel = false;
        this.keepCalendarOpeningWithRange = false;
        this.showRangeLabelOnInput = false;
        this.rangesArray = [];
        // some state information
        this.isShown = false;
        this.inline = true;
        this.leftCalendar = {};
        this.rightCalendar = {};
        this.showCalInRanges = false;
        this.options = {}; // should get some opt from user
        this.choosedDate = new EventEmitter();
        this.rangeClicked = new EventEmitter();
        this.datesUpdated = new EventEmitter();
    }
    set locale(value) {
        this._locale = Object.assign({}, this._localeService.config, value);
    }
    get locale() {
        return this._locale;
    }
    set ranges(value) {
        this._ranges = value;
        this.renderRanges();
    }
    get ranges() {
        return this._ranges;
    }
    ngOnInit() {
        this._buildLocale();
        const daysOfWeek = [...this.locale.daysOfWeek];
        if (this.locale.firstDay != 0) {
            var iterator = this.locale.firstDay;
            while (iterator > 0) {
                daysOfWeek.push(daysOfWeek.shift());
                iterator--;
            }
        }
        this.locale.daysOfWeek = daysOfWeek;
        if (this.inline) {
            this._old.start = this.startDate.clone();
            this._old.end = this.endDate.clone();
        }
        this.updateMonthsInView();
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        this.renderRanges();
    }
    renderRanges() {
        this.rangesArray = [];
        let start, end;
        if (typeof this.ranges === 'object') {
            for (const range in this.ranges) {
                if (typeof this.ranges[range][0] === 'string') {
                    start = moment(this.ranges[range][0], this.locale.format);
                }
                else {
                    start = moment(this.ranges[range][0]);
                }
                if (typeof this.ranges[range][1] === 'string') {
                    end = moment(this.ranges[range][1], this.locale.format);
                }
                else {
                    end = moment(this.ranges[range][1]);
                }
                // If the start or end date exceed those allowed by the minDate or maxSpan
                // options, shorten the range to the allowable period.
                if (this.minDate && start.isBefore(this.minDate)) {
                    start = this.minDate.clone();
                }
                var maxDate = this.maxDate;
                if (this.maxSpan && maxDate && start.clone().add(this.maxSpan).isAfter(maxDate)) {
                    maxDate = start.clone().add(this.maxSpan);
                }
                if (maxDate && end.isAfter(maxDate)) {
                    end = maxDate.clone();
                }
                // If the end of the range is before the minimum or the start of the range is
                // after the maximum, don't display this range option at all.
                if ((this.minDate && end.isBefore(this.minDate, this.timePicker ? 'minute' : 'day'))
                    || (maxDate && start.isAfter(maxDate, this.timePicker ? 'minute' : 'day'))) {
                    continue;
                }
                //Support unicode chars in the range names.
                var elem = document.createElement('textarea');
                elem.innerHTML = range;
                var rangeHtml = elem.value;
                this.ranges[rangeHtml] = [start, end];
            }
            for (const range in this.ranges) {
                this.rangesArray.push(range);
            }
            if (this.showCustomRangeLabel) {
                this.rangesArray.push(this.locale.customRangeLabel);
            }
            this.showCalInRanges = (!this.rangesArray.length) || this.alwaysShowCalendars;
            if (!this.timePicker) {
                this.startDate = this.startDate.startOf('day');
                this.endDate = this.endDate.endOf('day');
            }
            // can't be used together for now
            if (this.timePicker && this.autoApply) {
                this.autoApply = false;
            }
        }
    }
    renderTimePicker(side) {
        if (side == SideEnum.right && !this.endDate) {
            return;
        }
        let selected, minDate;
        let maxDate = this.maxDate;
        if (side === SideEnum.left) {
            selected = this.startDate.clone(),
                minDate = this.minDate;
        }
        else if (side === SideEnum.right) {
            selected = this.endDate.clone(),
                minDate = this.startDate;
        }
        const start = this.timePicker24Hour ? 0 : 1;
        const end = this.timePicker24Hour ? 23 : 12;
        this.timepickerVariables[side] = {
            hours: [],
            minutes: [],
            minutesLabel: [],
            seconds: [],
            secondsLabel: [],
            disabledHours: [],
            disabledMinutes: [],
            disabledSeconds: [],
            selectedHour: 0,
            selectedMinute: 0,
            selectedSecond: 0,
        };
        // generate hours
        for (let i = start; i <= end; i++) {
            let i_in_24 = i;
            if (!this.timePicker24Hour) {
                i_in_24 = selected.hour() >= 12 ? (i == 12 ? 12 : i + 12) : (i == 12 ? 0 : i);
            }
            let time = selected.clone().hour(i_in_24);
            let disabled = false;
            if (minDate && time.minute(59).isBefore(minDate)) {
                disabled = true;
            }
            if (maxDate && time.minute(0).isAfter(maxDate)) {
                disabled = true;
            }
            this.timepickerVariables[side].hours.push(i);
            if (i_in_24 == selected.hour() && !disabled) {
                this.timepickerVariables[side].selectedHour = i;
            }
            else if (disabled) {
                this.timepickerVariables[side].disabledHours.push(i);
            }
        }
        // generate minutes
        for (var i = 0; i < 60; i += this.timePickerIncrement) {
            var padded = i < 10 ? '0' + i : i;
            var time = selected.clone().minute(i);
            var disabled = false;
            if (minDate && time.second(59).isBefore(minDate)) {
                disabled = true;
            }
            if (maxDate && time.second(0).isAfter(maxDate)) {
                disabled = true;
            }
            this.timepickerVariables[side].minutes.push(i);
            this.timepickerVariables[side].minutesLabel.push(padded);
            if (selected.minute() == i && !disabled) {
                this.timepickerVariables[side].selectedMinute = i;
            }
            else if (disabled) {
                this.timepickerVariables[side].disabledMinutes.push(i);
            }
        }
        // generate seconds
        if (this.timePickerSeconds) {
            for (var i = 0; i < 60; i++) {
                var padded = i < 10 ? '0' + i : i;
                var time = selected.clone().second(i);
                var disabled = false;
                if (minDate && time.isBefore(minDate)) {
                    disabled = true;
                }
                if (maxDate && time.isAfter(maxDate)) {
                    disabled = true;
                }
                this.timepickerVariables[side].seconds.push(i);
                this.timepickerVariables[side].secondsLabel.push(padded);
                if (selected.second() == i && !disabled) {
                    this.timepickerVariables[side].selectedSecond = i;
                }
                else if (disabled) {
                    this.timepickerVariables[side].disabledSeconds.push(i);
                }
            }
        }
        // generate AM/PM
        if (!this.timePicker24Hour) {
            var am_html = '';
            var pm_html = '';
            if (minDate && selected.clone().hour(12).minute(0).second(0).isBefore(minDate)) {
                this.timepickerVariables[side].amDisabled = true;
            }
            if (maxDate && selected.clone().hour(0).minute(0).second(0).isAfter(maxDate)) {
                this.timepickerVariables[side].pmDisabled = true;
            }
            if (selected.hour() >= 12) {
                this.timepickerVariables[side].ampmModel = 'PM';
            }
            else {
                this.timepickerVariables[side].ampmModel = 'AM';
            }
        }
        this.timepickerVariables[side].selected = selected;
    }
    renderCalendar(side) {
        let mainCalendar = (side === SideEnum.left) ? this.leftCalendar : this.rightCalendar;
        const month = mainCalendar.month.month();
        const year = mainCalendar.month.year();
        const hour = mainCalendar.month.hour();
        const minute = mainCalendar.month.minute();
        const second = mainCalendar.month.second();
        const daysInMonth = moment([year, month]).daysInMonth();
        const firstDay = moment([year, month, 1]);
        const lastDay = moment([year, month, daysInMonth]);
        const lastMonth = moment(firstDay).subtract(1, 'month').month();
        const lastYear = moment(firstDay).subtract(1, 'month').year();
        const daysInLastMonth = moment([lastYear, lastMonth]).daysInMonth();
        const dayOfWeek = firstDay.day();
        // initialize a 6 rows x 7 columns array for the calendar
        let calendar = [];
        calendar.firstDay = firstDay;
        calendar.lastDay = lastDay;
        for (let i = 0; i < 6; i++) {
            calendar[i] = [];
        }
        // populate the calendar with date objects
        let startDay = daysInLastMonth - dayOfWeek + this.locale.firstDay + 1;
        if (startDay > daysInLastMonth) {
            startDay -= 7;
        }
        if (dayOfWeek === this.locale.firstDay) {
            startDay = daysInLastMonth - 6;
        }
        let curDate = moment([lastYear, lastMonth, startDay, 12, minute, second]);
        for (let i = 0, col = 0, row = 0; i < 42; i++, col++, curDate = moment(curDate).add(24, 'hour')) {
            if (i > 0 && col % 7 === 0) {
                col = 0;
                row++;
            }
            calendar[row][col] = curDate.clone().hour(hour).minute(minute).second(second);
            curDate.hour(12);
            if (this.minDate && calendar[row][col].format('YYYY-MM-DD') === this.minDate.format('YYYY-MM-DD') &&
                calendar[row][col].isBefore(this.minDate) && side === 'left') {
                calendar[row][col] = this.minDate.clone();
            }
            if (this.maxDate && calendar[row][col].format('YYYY-MM-DD') === this.maxDate.format('YYYY-MM-DD') &&
                calendar[row][col].isAfter(this.maxDate) && side === 'right') {
                calendar[row][col] = this.maxDate.clone();
            }
        }
        // make the calendar object available to hoverDate/clickDate
        if (side === SideEnum.left) {
            this.leftCalendar.calendar = calendar;
        }
        else {
            this.rightCalendar.calendar = calendar;
        }
        //
        // Display the calendar
        //
        const minDate = side === 'left' ? this.minDate : this.startDate;
        let maxDate = this.maxDate;
        // adjust maxDate to reflect the dateLimit setting in order to
        // grey out end dates beyond the dateLimit
        if (this.endDate === null && this.dateLimit) {
            const maxLimit = this.startDate.clone().add(this.dateLimit, 'day').endOf('day');
            if (!maxDate || maxLimit.isBefore(maxDate)) {
                maxDate = maxLimit;
            }
        }
        this.calendarVariables[side] = {
            month: month,
            year: year,
            hour: hour,
            minute: minute,
            second: second,
            daysInMonth: daysInMonth,
            firstDay: firstDay,
            lastDay: lastDay,
            lastMonth: lastMonth,
            lastYear: lastYear,
            daysInLastMonth: daysInLastMonth,
            dayOfWeek: dayOfWeek,
            // other vars
            calRows: Array.from(Array(6).keys()),
            calCols: Array.from(Array(7).keys()),
            classes: {},
            minDate: minDate,
            maxDate: maxDate,
            calendar: calendar
        };
        if (this.showDropdowns) {
            const currentMonth = calendar[1][1].month();
            const currentYear = calendar[1][1].year();
            const maxYear = (maxDate && maxDate.year()) || (currentYear + 5);
            const minYear = (minDate && minDate.year()) || (currentYear - 50);
            const inMinYear = currentYear === minYear;
            const inMaxYear = currentYear === maxYear;
            const years = [];
            for (var y = minYear; y <= maxYear; y++) {
                years.push(y);
            }
            this.calendarVariables[side].dropdowns = {
                currentMonth: currentMonth,
                currentYear: currentYear,
                maxYear: maxYear,
                minYear: minYear,
                inMinYear: inMinYear,
                inMaxYear: inMaxYear,
                monthArrays: Array.from(Array(12).keys()),
                yearArrays: years
            };
        }
        this._buildCells(calendar, side);
    }
    setStartDate(startDate) {
        if (typeof startDate === 'string') {
            this.startDate = moment(startDate, this.locale.format);
        }
        if (typeof startDate === 'object') {
            this.startDate = moment(startDate);
        }
        if (!this.timePicker) {
            this.startDate = this.startDate.startOf('day');
        }
        if (this.timePicker && this.timePickerIncrement) {
            this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.minDate && this.startDate.isBefore(this.minDate)) {
            this.startDate = this.minDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate.minute(Math.round(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }
        }
        if (this.maxDate && this.startDate.isAfter(this.maxDate)) {
            this.startDate = this.maxDate.clone();
            if (this.timePicker && this.timePickerIncrement) {
                this.startDate.minute(Math.floor(this.startDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
            }
        }
        if (!this.isShown) {
            this.updateElement();
        }
        this.updateMonthsInView();
    }
    setEndDate(endDate) {
        if (typeof endDate === 'string') {
            this.endDate = moment(endDate, this.locale.format);
        }
        if (typeof endDate === 'object') {
            this.endDate = moment(endDate);
        }
        if (!this.timePicker) {
            this.endDate = this.endDate.add(1, 'd').startOf('day').subtract(1, 'second');
        }
        if (this.timePicker && this.timePickerIncrement) {
            this.endDate.minute(Math.round(this.endDate.minute() / this.timePickerIncrement) * this.timePickerIncrement);
        }
        if (this.endDate.isBefore(this.startDate)) {
            this.endDate = this.startDate.clone();
        }
        if (this.maxDate && this.endDate.isAfter(this.maxDate)) {
            this.endDate = this.maxDate.clone();
        }
        if (this.dateLimit && this.startDate.clone().add(this.dateLimit, 'day').isBefore(this.endDate)) {
            this.endDate = this.startDate.clone().add(this.dateLimit, 'day');
        }
        if (!this.isShown) {
            // this.updateElement();
        }
        this.updateMonthsInView();
    }
    isInvalidDate(date) {
        return false;
    }
    isCustomDate(date) {
        return false;
    }
    updateView() {
        if (this.timePicker) {
            this.renderTimePicker(SideEnum.left);
            this.renderTimePicker(SideEnum.right);
        }
        this.updateMonthsInView();
        this.updateCalendars();
    }
    updateMonthsInView() {
        if (this.endDate) {
            // if both dates are visible already, do nothing
            if (!this.singleDatePicker && this.leftCalendar.month && this.rightCalendar.month &&
                ((this.startDate && this.leftCalendar && this.startDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM')) ||
                    (this.startDate && this.rightCalendar && this.startDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM')))
                &&
                    (this.endDate.format('YYYY-MM') === this.leftCalendar.month.format('YYYY-MM') ||
                        this.endDate.format('YYYY-MM') === this.rightCalendar.month.format('YYYY-MM'))) {
                return;
            }
            if (this.startDate) {
                this.leftCalendar.month = this.startDate.clone().date(2);
                if (!this.linkedCalendars && (this.endDate.month() !== this.startDate.month() ||
                    this.endDate.year() !== this.startDate.year())) {
                    this.rightCalendar.month = this.endDate.clone().date(2);
                }
                else {
                    this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
                }
            }
        }
        else {
            if (this.leftCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM') &&
                this.rightCalendar.month.format('YYYY-MM') !== this.startDate.format('YYYY-MM')) {
                this.leftCalendar.month = this.startDate.clone().date(2);
                this.rightCalendar.month = this.startDate.clone().date(2).add(1, 'month');
            }
        }
        if (this.maxDate && this.linkedCalendars && !this.singleDatePicker && this.rightCalendar.month > this.maxDate) {
            this.rightCalendar.month = this.maxDate.clone().date(2);
            this.leftCalendar.month = this.maxDate.clone().date(2).subtract(1, 'month');
        }
    }
    /**
     *  This is responsible for updating the calendars
     */
    updateCalendars() {
        this.renderCalendar(SideEnum.left);
        this.renderCalendar(SideEnum.right);
        if (this.endDate === null) {
            return;
        }
        this.calculateChosenLabel();
    }
    updateElement() {
        if (!this.singleDatePicker && this.autoUpdateInput) {
            if (this.startDate && this.endDate) {
                // if we use ranges and should show range label on inpu
                if (this.rangesArray.length && this.showRangeLabelOnInput === true && this.chosenRange &&
                    this.locale.customRangeLabel !== this.chosenRange) {
                    this.chosenLabel = this.chosenRange;
                }
                else {
                    this.chosenLabel = this.startDate.format(this.locale.format) +
                        this.locale.separator + this.endDate.format(this.locale.format);
                }
            }
        }
        else if (this.autoUpdateInput) {
            this.chosenLabel = this.startDate.format(this.locale.format);
        }
    }
    remove() {
        this.isShown = false;
    }
    /**
     * this should calculate the label
     */
    calculateChosenLabel() {
        if (!this.locale || !this.locale.separator) {
            this._buildLocale();
        }
        let customRange = true;
        let i = 0;
        if (this.rangesArray.length > 0) {
            for (const range in this.ranges) {
                if (this.timePicker) {
                    var format = this.timePickerSeconds ? "YYYY-MM-DD HH:mm:ss" : "YYYY-MM-DD HH:mm";
                    //ignore times when comparing dates if time picker seconds is not enabled
                    if (this.startDate.format(format) == this.ranges[range][0].format(format) && this.endDate.format(format) == this.ranges[range][1].format(format)) {
                        customRange = false;
                        this.chosenRange = this.rangesArray[i];
                        break;
                    }
                }
                else {
                    //ignore times when comparing dates if time picker is not enabled
                    if (this.startDate.format('YYYY-MM-DD') == this.ranges[range][0].format('YYYY-MM-DD') && this.endDate.format('YYYY-MM-DD') == this.ranges[range][1].format('YYYY-MM-DD')) {
                        customRange = false;
                        this.chosenRange = this.rangesArray[i];
                        break;
                    }
                }
                i++;
            }
            if (customRange) {
                if (this.showCustomRangeLabel) {
                    this.chosenRange = this.locale.customRangeLabel;
                }
                else {
                    this.chosenRange = null;
                }
                // if custom label: show calenar
                this.showCalInRanges = true;
            }
        }
        this.updateElement();
    }
    clickApply(e) {
        if (!this.singleDatePicker && this.startDate && !this.endDate) {
            this.endDate = this.startDate.clone();
            this.calculateChosenLabel();
        }
        if (this.isInvalidDate && this.startDate && this.endDate) {
            // get if there are invalid date between range
            let d = this.startDate.clone();
            while (d.isBefore(this.endDate)) {
                if (this.isInvalidDate(d)) {
                    this.endDate = d.subtract(1, 'days');
                    this.calculateChosenLabel();
                    break;
                }
                d.add(1, 'days');
            }
        }
        if (this.chosenLabel) {
            this.choosedDate.emit({ chosenLabel: this.chosenLabel, startDate: this.startDate, endDate: this.endDate });
        }
        this.datesUpdated.emit({ startDate: this.startDate, endDate: this.endDate });
        this.hide();
    }
    clickCancel(e) {
        this.startDate = this._old.start;
        this.endDate = this._old.end;
        if (this.inline) {
            this.updateView();
        }
        this.hide();
    }
    /**
     * called when month is changed
     * @param monthEvent get value in event.target.value
     * @param side left or right
     */
    monthChanged(monthEvent, side) {
        const year = this.calendarVariables[side].dropdowns.currentYear;
        const month = parseInt(monthEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    }
    /**
     * called when year is changed
     * @param yearEvent get value in event.target.value
     * @param side left or right
     */
    yearChanged(yearEvent, side) {
        const month = this.calendarVariables[side].dropdowns.currentMonth;
        const year = parseInt(yearEvent.target.value, 10);
        this.monthOrYearChanged(month, year, side);
    }
    /**
     * called when time is changed
     * @param timeEvent  an event
     * @param side left or right
     */
    timeChanged(timeEvent, side) {
        var hour = parseInt(this.timepickerVariables[side].selectedHour, 10);
        var minute = parseInt(this.timepickerVariables[side].selectedMinute, 10);
        var second = this.timePickerSeconds ? parseInt(this.timepickerVariables[side].selectedSecond, 10) : 0;
        if (!this.timePicker24Hour) {
            var ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12)
                hour += 12;
            if (ampm === 'AM' && hour === 12)
                hour = 0;
        }
        if (side === SideEnum.left) {
            var start = this.startDate.clone();
            start.hour(hour);
            start.minute(minute);
            start.second(second);
            this.setStartDate(start);
            if (this.singleDatePicker) {
                this.endDate = this.startDate.clone();
            }
            else if (this.endDate && this.endDate.format('YYYY-MM-DD') == start.format('YYYY-MM-DD') && this.endDate.isBefore(start)) {
                this.setEndDate(start.clone());
            }
        }
        else if (this.endDate) {
            var end = this.endDate.clone();
            end.hour(hour);
            end.minute(minute);
            end.second(second);
            this.setEndDate(end);
        }
        //update the calendars so all clickable dates reflect the new time component
        this.updateCalendars();
        //re-render the time pickers because changing one selection can affect what's enabled in another
        this.renderTimePicker(SideEnum.left);
        this.renderTimePicker(SideEnum.right);
    }
    /**
     *  call when month or year changed
     * @param month month number 0 -11
     * @param year year eg: 1995
     * @param side left or right
     */
    monthOrYearChanged(month, year, side) {
        const isLeft = side === SideEnum.left;
        if (!isLeft) {
            if (year < this.startDate.year() || (year === this.startDate.year() && month < this.startDate.month())) {
                month = this.startDate.month();
                year = this.startDate.year();
            }
        }
        if (this.minDate) {
            if (year < this.minDate.year() || (year === this.minDate.year() && month < this.minDate.month())) {
                month = this.minDate.month();
                year = this.minDate.year();
            }
        }
        if (this.maxDate) {
            if (year > this.maxDate.year() || (year === this.maxDate.year() && month > this.maxDate.month())) {
                month = this.maxDate.month();
                year = this.maxDate.year();
            }
        }
        this.calendarVariables[side].dropdowns.currentYear = year;
        this.calendarVariables[side].dropdowns.currentMonth = month;
        if (isLeft) {
            this.leftCalendar.month.month(month).year(year);
            if (this.linkedCalendars) {
                this.rightCalendar.month = this.leftCalendar.month.clone().add(1, 'month');
            }
        }
        else {
            this.rightCalendar.month.month(month).year(year);
            if (this.linkedCalendars) {
                this.leftCalendar.month = this.rightCalendar.month.clone().subtract(1, 'month');
            }
        }
        this.updateCalendars();
    }
    /**
     * Click on previous month
     * @param side left or right calendar
     */
    clickPrev(side) {
        if (side === SideEnum.left) {
            this.leftCalendar.month.subtract(1, 'month');
            if (this.linkedCalendars) {
                this.rightCalendar.month.subtract(1, 'month');
            }
        }
        else {
            this.rightCalendar.month.subtract(1, 'month');
        }
        this.updateCalendars();
    }
    /**
     * Click on next month
     * @param side left or right calendar
     */
    clickNext(side) {
        if (side === SideEnum.left) {
            this.leftCalendar.month.add(1, 'month');
        }
        else {
            this.rightCalendar.month.add(1, 'month');
            if (this.linkedCalendars) {
                this.leftCalendar.month.add(1, 'month');
            }
        }
        this.updateCalendars();
    }
    /**
     * When selecting a date
     * @param e event: get value by e.target.value
     * @param side left or right
     * @param row row position of the current date clicked
     * @param col col position of the current date clicked
     */
    clickDate(e, side, row, col) {
        if (e.target.tagName === 'TD') {
            if (!e.target.classList.contains('available')) {
                return;
            }
        }
        else if (e.target.tagName === 'SPAN') {
            if (!e.target.parentElement.classList.contains('available')) {
                return;
            }
        }
        if (this.rangesArray.length) {
            this.chosenRange = this.locale.customRangeLabel;
        }
        let date = side === SideEnum.left ? this.leftCalendar.calendar[row][col] : this.rightCalendar.calendar[row][col];
        if (this.endDate || date.isBefore(this.startDate, 'day')) { // picking start
            if (this.timePicker) {
                date = this._getDateWithTime(date, SideEnum.left);
            }
            this.endDate = null;
            this.setStartDate(date.clone());
        }
        else if (!this.endDate && date.isBefore(this.startDate)) {
            // special case: clicking the same date for start/end,
            // but the time of the end date is before the start date
            this.setEndDate(this.startDate.clone());
        }
        else { // picking end
            if (this.timePicker) {
                date = this._getDateWithTime(date, SideEnum.right);
            }
            this.setEndDate(date.clone());
            if (this.autoApply) {
                this.calculateChosenLabel();
                this.clickApply();
            }
        }
        if (this.singleDatePicker) {
            this.setEndDate(this.startDate);
            this.updateElement();
            if (this.autoApply) {
                this.clickApply();
            }
        }
        this.updateView();
        // This is to cancel the blur event handler if the mouse was in one of the inputs
        e.stopPropagation();
    }
    /**
     *  Click on the custom range
     * @param e: Event
     * @param label
     */
    clickRange(e, label) {
        this.chosenRange = label;
        if (label == this.locale.customRangeLabel) {
            this.isShown = true; // show calendars
            this.showCalInRanges = true;
        }
        else {
            var dates = this.ranges[label];
            this.startDate = dates[0].clone();
            this.endDate = dates[1].clone();
            if (this.showRangeLabelOnInput && label !== this.locale.customRangeLabel) {
                this.chosenLabel = label;
            }
            else {
                this.calculateChosenLabel();
            }
            this.showCalInRanges = (!this.rangesArray.length) || this.alwaysShowCalendars;
            if (!this.timePicker) {
                this.startDate.startOf('day');
                this.endDate.endOf('day');
            }
            if (!this.alwaysShowCalendars) {
                this.isShown = false; // hide calendars
            }
            this.rangeClicked.emit({ label: label, dates: dates });
            if (!this.keepCalendarOpeningWithRange) {
                this.clickApply();
            }
            else {
                this.leftCalendar.month.month(dates[0].month());
                this.leftCalendar.month.year(dates[0].year());
                this.rightCalendar.month.month(dates[1].month());
                this.rightCalendar.month.year(dates[1].year());
                this.updateCalendars();
                if (this.timePicker) {
                    this.renderTimePicker(SideEnum.left);
                    this.renderTimePicker(SideEnum.right);
                }
            }
        }
    }
    ;
    show(e) {
        if (this.isShown) {
            return;
        }
        this._old.start = this.startDate.clone();
        this._old.end = this.endDate.clone();
        this.isShown = true;
        this.updateView();
    }
    hide(e) {
        if (!this.isShown) {
            return;
        }
        // incomplete date selection, revert to last values
        if (!this.endDate) {
            if (this._old.start) {
                this.startDate = this._old.start.clone();
            }
            if (this._old.end) {
                this.endDate = this._old.end.clone();
            }
        }
        // if a new date range was selected, invoke the user callback function
        if (!this.startDate.isSame(this._old.start) || !this.endDate.isSame(this._old.end)) {
            // this.callback(this.startDate, this.endDate, this.chosenLabel);
        }
        // if picker is attached to a text input, update it
        this.updateElement();
        this.isShown = false;
        this._ref.detectChanges();
    }
    /**
     * handle click on all element in the component, usefull for outside of click
     * @param e event
     */
    handleInternalClick(e) {
        e.stopPropagation();
    }
    /**
     * update the locale options
     * @param locale
     */
    updateLocale(locale) {
        for (const key in locale) {
            if (locale.hasOwnProperty(key)) {
                this.locale[key] = locale[key];
            }
        }
    }
    /**
     *  clear the daterange picker
     */
    clear() {
        this.startDate = moment().startOf('day');
        this.endDate = moment().endOf('day');
        this.choosedDate.emit({ chosenLabel: '', startDate: null, endDate: null });
        this.datesUpdated.emit({ startDate: null, endDate: null });
        this.hide();
    }
    /**
     * Find out if the selected range should be disabled if it doesn't
     * fit into minDate and maxDate limitations.
     */
    disableRange(range) {
        if (range === this.locale.customRangeLabel) {
            return false;
        }
        const rangeMarkers = this.ranges[range];
        const areBothBefore = rangeMarkers.every(date => {
            if (!this.minDate) {
                return false;
            }
            return date.isBefore(this.minDate);
        });
        const areBothAfter = rangeMarkers.every(date => {
            if (!this.maxDate) {
                return false;
            }
            return date.isAfter(this.maxDate);
        });
        return (areBothBefore || areBothAfter);
    }
    /**
     *
     * @param date the date to add time
     * @param side left or right
     */
    _getDateWithTime(date, side) {
        let hour = parseInt(this.timepickerVariables[side].selectedHour, 10);
        if (!this.timePicker24Hour) {
            var ampm = this.timepickerVariables[side].ampmModel;
            if (ampm === 'PM' && hour < 12)
                hour += 12;
            if (ampm === 'AM' && hour === 12)
                hour = 0;
        }
        var minute = parseInt(this.timepickerVariables[side].selectedMinute, 10);
        var second = this.timePickerSeconds ? parseInt(this.timepickerVariables[side].selectedSecond, 10) : 0;
        return date.clone().hour(hour).minute(minute).second(second);
    }
    /**
     *  build the locale config
     */
    _buildLocale() {
        this.locale = Object.assign({}, this._localeService.config, this.locale);
        if (!this.locale.format) {
            if (this.timePicker) {
                this.locale.format = moment.localeData().longDateFormat('lll');
            }
            else {
                this.locale.format = moment.localeData().longDateFormat('L');
            }
        }
    }
    _buildCells(calendar, side) {
        for (let row = 0; row < 6; row++) {
            this.calendarVariables[side].classes[row] = {};
            const rowClasses = [];
            if (this.emptyWeekRowClass && !this.hasCurrentMonthDays(this.calendarVariables[side].month, calendar[row])) {
                rowClasses.push(this.emptyWeekRowClass);
            }
            for (let col = 0; col < 7; col++) {
                const classes = [];
                // highlight today's date
                if (calendar[row][col].isSame(new Date(), 'day')) {
                    classes.push('today');
                }
                // highlight weekends
                if (calendar[row][col].isoWeekday() > 5) {
                    classes.push('weekend');
                }
                // grey out the dates in other months displayed at beginning and end of this calendar
                if (calendar[row][col].month() !== calendar[1][1].month()) {
                    classes.push('off');
                    // mark the last day of the previous month in this calendar
                    if (this.lastDayOfPreviousMonthClass && (calendar[row][col].month() < calendar[1][1].month() || calendar[1][1].month() === 0) && calendar[row][col].date() === this.calendarVariables[side].daysInLastMonth) {
                        classes.push(this.lastDayOfPreviousMonthClass);
                    }
                    // mark the first day of the next month in this calendar
                    if (this.firstDayOfNextMonthClass && (calendar[row][col].month() > calendar[1][1].month() || calendar[row][col].month() === 0) && calendar[row][col].date() === 1) {
                        classes.push(this.firstDayOfNextMonthClass);
                    }
                }
                // mark the first day of the current month with a custom class
                if (this.firstMonthDayClass && calendar[row][col].month() === calendar[1][1].month() && calendar[row][col].date() === calendar.firstDay.date()) {
                    classes.push(this.firstMonthDayClass);
                }
                // mark the last day of the current month with a custom class
                if (this.lastMonthDayClass && calendar[row][col].month() === calendar[1][1].month() && calendar[row][col].date() === calendar.lastDay.date()) {
                    classes.push(this.lastMonthDayClass);
                }
                // don't allow selection of dates before the minimum date
                if (this.minDate && calendar[row][col].isBefore(this.minDate, 'day')) {
                    classes.push('off', 'disabled');
                }
                // don't allow selection of dates after the maximum date
                if (this.calendarVariables[side].maxDate && calendar[row][col].isAfter(this.calendarVariables[side].maxDate, 'day')) {
                    classes.push('off', 'disabled');
                }
                // don't allow selection of date if a custom function decides it's invalid
                if (this.isInvalidDate(calendar[row][col])) {
                    classes.push('off', 'disabled');
                }
                // highlight the currently selected start date
                if (this.startDate && calendar[row][col].format('YYYY-MM-DD') === this.startDate.format('YYYY-MM-DD')) {
                    classes.push('active', 'start-date');
                }
                // highlight the currently selected end date
                if (this.endDate != null && calendar[row][col].format('YYYY-MM-DD') === this.endDate.format('YYYY-MM-DD')) {
                    classes.push('active', 'end-date');
                }
                // highlight dates in-between the selected dates
                if (this.endDate != null && calendar[row][col] > this.startDate && calendar[row][col] < this.endDate) {
                    classes.push('in-range');
                }
                // apply custom classes for this date
                const isCustom = this.isCustomDate(calendar[row][col]);
                if (isCustom !== false) {
                    if (typeof isCustom === 'string') {
                        classes.push(isCustom);
                    }
                    else {
                        Array.prototype.push.apply(classes, isCustom);
                    }
                }
                // store classes var
                let cname = '', disabled = false;
                for (let i = 0; i < classes.length; i++) {
                    cname += classes[i] + ' ';
                    if (classes[i] === 'disabled') {
                        disabled = true;
                    }
                }
                if (!disabled) {
                    cname += 'available';
                }
                this.calendarVariables[side].classes[row][col] = cname.replace(/^\s+|\s+$/g, '');
            }
            this.calendarVariables[side].classes[row].classList = rowClasses.join(' ');
        }
    }
    /**
     * Find out if the current calendar row has current month days
     * (as opposed to consisting of only previous/next month days)
     */
    hasCurrentMonthDays(currentMonth, row) {
        for (let day = 0; day < 7; day++) {
            if (row[day].month() === currentMonth) {
                return true;
            }
        }
        return false;
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Number)
], DaterangepickerComponent.prototype, "dateLimit", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], DaterangepickerComponent.prototype, "minDate", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], DaterangepickerComponent.prototype, "maxDate", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "autoApply", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "singleDatePicker", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showDropdowns", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showWeekNumbers", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showISOWeekNumbers", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "linkedCalendars", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "autoUpdateInput", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "alwaysShowCalendars", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "maxSpan", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "timePicker", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "timePicker24Hour", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Number)
], DaterangepickerComponent.prototype, "timePickerIncrement", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "timePickerSeconds", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showClearButton", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "firstMonthDayClass", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "lastMonthDayClass", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "emptyWeekRowClass", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "firstDayOfNextMonthClass", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "lastDayOfPreviousMonthClass", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [Object])
], DaterangepickerComponent.prototype, "locale", null);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [Object])
], DaterangepickerComponent.prototype, "ranges", null);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showCustomRangeLabel", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showCancel", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "keepCalendarOpeningWithRange", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Boolean)
], DaterangepickerComponent.prototype, "showRangeLabelOnInput", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "drops", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", String)
], DaterangepickerComponent.prototype, "opens", void 0);
tslib_1.__decorate([
    Output('choosedDate'),
    tslib_1.__metadata("design:type", EventEmitter)
], DaterangepickerComponent.prototype, "choosedDate", void 0);
tslib_1.__decorate([
    Output('rangeClicked'),
    tslib_1.__metadata("design:type", EventEmitter)
], DaterangepickerComponent.prototype, "rangeClicked", void 0);
tslib_1.__decorate([
    Output('datesUpdated'),
    tslib_1.__metadata("design:type", EventEmitter)
], DaterangepickerComponent.prototype, "datesUpdated", void 0);
tslib_1.__decorate([
    ViewChild('pickerContainer'),
    tslib_1.__metadata("design:type", ElementRef)
], DaterangepickerComponent.prototype, "pickerContainer", void 0);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], DaterangepickerComponent.prototype, "isInvalidDate", null);
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Function),
    tslib_1.__metadata("design:paramtypes", [Object]),
    tslib_1.__metadata("design:returntype", void 0)
], DaterangepickerComponent.prototype, "isCustomDate", null);
DaterangepickerComponent = DaterangepickerComponent_1 = tslib_1.__decorate([
    Component({
        selector: 'ngx-daterangepicker-material',
        template: "<div class=\"md-drppicker\" #pickerContainer\n[ngClass]=\"{\n    ltr: locale.direction === 'ltr',\n    rtl: this.locale.direction === 'rtl',\n    'shown': isShown || inline,\n    'hidden': !isShown && !inline,\n    'inline': inline,\n    'double': !singleDatePicker && showCalInRanges,\n    'show-ranges': rangesArray.length\n}\" [class]=\"'drops-' + drops + '-' + opens\">\n    <div class=\"ranges\">\n        <ul>\n          <li *ngFor=\"let range of rangesArray\">\n            <button type=\"button\"\n                    (click)=\"clickRange($event, range)\"\n                    [disabled]=\"disableRange(range)\"\n                    [ngClass]=\"{'active': range === chosenRange}\">{{range}}</button>\n          </li>\n        </ul>\n    </div>\n    <div class=\"calendar\" [ngClass]=\"{right: singleDatePicker, left: !singleDatePicker}\"\n        *ngIf=\"showCalInRanges\">\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container *ngIf=\"!calendarVariables.left.minDate || calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) && (!this.linkedCalendars || true)\">\n                            <th (click)=\"clickPrev(sideEnum.left)\" class=\"prev available\" >\n                            </th>\n                        </ng-container>\n                        <ng-container *ngIf=\"!(!calendarVariables.left.minDate || calendarVariables.left.minDate.isBefore(calendarVariables.left.calendar.firstDay) && (!this.linkedCalendars || true))\">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month drp-animate\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.left.dropdowns\">\n                                <div class=\"dropdowns\">\n                                        {{this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()]}}\n                                        <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.left)\">\n                                                <option\n                                                [disabled]=\"(calendarVariables.left.dropdowns.inMinYear && m < calendarVariables.left.minDate.month()) || (calendarVariables.left.dropdowns.inMaxYear && m > calendarVariables.left.maxDate.month())\"\n                                                *ngFor=\"let m of calendarVariables.left.dropdowns.monthArrays\" [value]=\"m\" [selected]=\"calendarVariables.left.dropdowns.currentMonth == m\">\n                                                    {{locale.monthNames[m]}}\n                                                </option>\n                                        </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                    {{ calendarVariables?.left?.calendar[1][1].format(\" YYYY\")}}\n                                    <select class=\"yearselect\"  (change)=\"yearChanged($event, sideEnum.left)\">\n                                        <option *ngFor=\"let y of calendarVariables.left.dropdowns.yearArrays\" [selected]=\"y === calendarVariables.left.dropdowns.currentYear\">\n                                            {{y}}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.left.dropdowns\">\n                                    {{this.locale.monthNames[calendarVariables?.left?.calendar[1][1].month()]}}  {{ calendarVariables?.left?.calendar[1][1].format(\" YYYY\")}}\n                            </ng-container>\n                        </th>\n                        <ng-container *ngIf=\"(!calendarVariables.left.maxDate || calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) && (!linkedCalendars || singleDatePicker )\">\n                            <th class=\"next available\" (click)=\"clickNext(sideEnum.left)\">\n                            </th>\n                        </ng-container>\n                        <ng-container *ngIf=\"!((!calendarVariables.left.maxDate || calendarVariables.left.maxDate.isAfter(calendarVariables.left.calendar.lastDay)) && (!linkedCalendars || singleDatePicker ))\">\n                            <th></th>\n                        </ng-container>\n                    </tr>\n                    <tr class='week-days'>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\"><span>{{this.locale.weekLabel}}</span></th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\"><span>{{dayofweek}}</span></th>\n                    </tr>\n                </thead>\n                <tbody class=\"drp-animate\">\n                    <tr *ngFor=\"let row of calendarVariables.left.calRows\" [class]=\"calendarVariables.left.classes[row].classList\">\n                        <!-- add week number -->\n                        <td  class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{calendarVariables.left.calendar[row][0].week()}}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{calendarVariables.left.calendar[row][0].isoWeek()}}</span>\n                        </td>\n                        <!-- cal -->\n                        <td *ngFor=\"let col of calendarVariables.left.calCols\" [class]=\"calendarVariables.left.classes[row][col]\" (click)=\"clickDate($event, sideEnum.left, row, col)\">\n                            <span>{{calendarVariables.left.calendar[row][col].date()}}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select class=\"hourselect select-item\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.left.selectedHour\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option *ngFor=\"let i of timepickerVariables.left.hours\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.left.disabledHours.indexOf(i) > -1\">{{i}}</option>\n                </select>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item minuteselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.left.selectedMinute\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option *ngFor=\"let i of timepickerVariables.left.minutes; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.left.disabledMinutes.indexOf(i) > -1\">{{timepickerVariables.left.minutesLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item secondselect\" *ngIf=\"timePickerSeconds\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.left.selectedSecond\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option *ngFor=\"let i of timepickerVariables.left.seconds; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.left.disabledSeconds.indexOf(i) > -1\">{{timepickerVariables.left.secondsLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item ampmselect\" *ngIf=\"!timePicker24Hour\" [(ngModel)]=\"timepickerVariables.left.ampmModel\" (ngModelChange)=\"timeChanged($event, sideEnum.left)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.left.amDisabled\">AM</option>\n                    <option value=\"PM\"  [disabled]=\"timepickerVariables.left.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"calendar right\"\n        *ngIf=\"showCalInRanges && !singleDatePicker\"\n        >\n        <div class=\"calendar-table\">\n            <table class=\"table-condensed\" *ngIf=\"calendarVariables\">\n                <thead>\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\"></th>\n                        <ng-container *ngIf=\"(!calendarVariables.right.minDate || calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) && (!this.linkedCalendars)\">\n                            <th (click)=\"clickPrev(sideEnum.right)\" class=\"prev available\" >\n                            </th>\n                        </ng-container>\n                        <ng-container *ngIf=\"!((!calendarVariables.right.minDate || calendarVariables.right.minDate.isBefore(calendarVariables.right.calendar.firstDay)) && (!this.linkedCalendars))\">\n                            <th></th>\n                        </ng-container>\n                        <th colspan=\"5\" class=\"month\">\n                            <ng-container *ngIf=\"showDropdowns && calendarVariables.right.dropdowns\">\n                                <div class=\"dropdowns\">\n                                    {{this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()]}}\n                                    <select class=\"monthselect\" (change)=\"monthChanged($event, sideEnum.right)\">\n                                            <option\n                                            [disabled]=\"(calendarVariables.right.dropdowns.inMinYear && m < calendarVariables.right.minDate.month()) || (calendarVariables.right.dropdowns.inMaxYear && m > calendarVariables.right.maxDate.month())\"\n                                            *ngFor=\"let m of calendarVariables.right.dropdowns.monthArrays\" [value]=\"m\" [selected]=\"calendarVariables.right.dropdowns.currentMonth == m\">\n                                                {{locale.monthNames[m]}}\n                                            </option>\n                                    </select>\n                                </div>\n                                <div class=\"dropdowns\">\n                                        {{ calendarVariables?.right?.calendar[1][1].format(\" YYYY\")}}\n                                        <select class=\"yearselect\" (change)=\"yearChanged($event, sideEnum.right)\">\n                                        <option *ngFor=\"let y of calendarVariables.right.dropdowns.yearArrays\" [selected]=\"y === calendarVariables.right.dropdowns.currentYear\">\n                                            {{y}}\n                                        </option>\n                                    </select>\n                                </div>\n                            </ng-container>\n                            <ng-container *ngIf=\"!showDropdowns || !calendarVariables.right.dropdowns\">\n                                    {{this.locale.monthNames[calendarVariables?.right?.calendar[1][1].month()]}}  {{ calendarVariables?.right?.calendar[1][1].format(\" YYYY\")}}\n                            </ng-container>\n                        </th>\n                            <ng-container *ngIf=\"!calendarVariables.right.maxDate || calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) && (!linkedCalendars || singleDatePicker || true)\">\n                                <th class=\"next available\" (click)=\"clickNext(sideEnum.right)\">\n                                </th>\n                            </ng-container>\n                            <ng-container *ngIf=\"!(!calendarVariables.right.maxDate || calendarVariables.right.maxDate.isAfter(calendarVariables.right.calendar.lastDay) && (!linkedCalendars || singleDatePicker || true))\">\n                                <th></th>\n                            </ng-container>\n                    </tr>\n\n                    <tr>\n                        <th *ngIf=\"showWeekNumbers || showISOWeekNumbers\" class=\"week\"><span>{{this.locale.weekLabel}}</span></th>\n                        <th *ngFor=\"let dayofweek of locale.daysOfWeek\"><span>{{dayofweek}}</span></th>\n                    </tr>\n                </thead>\n                <tbody>\n                    <tr *ngFor=\"let row of calendarVariables.right.calRows\" [class]=\"calendarVariables.right.classes[row].classList\">\n                        <td class=\"week\" *ngIf=\"showWeekNumbers\">\n                            <span>{{calendarVariables.right.calendar[row][0].week()}}</span>\n                        </td>\n                        <td class=\"week\" *ngIf=\"showISOWeekNumbers\">\n                            <span>{{calendarVariables.right.calendar[row][0].isoWeek()}}</span>\n                        </td>\n                        <td *ngFor=\"let col of calendarVariables.right.calCols\" [class]=\"calendarVariables.right.classes[row][col]\" (click)=\"clickDate($event, sideEnum.right, row, col)\">\n                            <span>{{calendarVariables.right.calendar[row][col].date()}}</span>\n                        </td>\n                    </tr>\n                </tbody>\n            </table>\n        </div>\n        <div class=\"calendar-time\" *ngIf=\"timePicker\">\n            <div class=\"select\">\n                <select class=\"select-item hourselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.right.selectedHour\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option *ngFor=\"let i of timepickerVariables.right.hours\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.right.disabledHours.indexOf(i) > -1\">{{i}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select class=\"select-item minuteselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.right.selectedMinute\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option *ngFor=\"let i of timepickerVariables.right.minutes; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.right.disabledMinutes.indexOf(i) > -1\">{{timepickerVariables.right.minutesLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select *ngIf=\"timePickerSeconds\" class=\"select-item secondselect\" [disabled]=\"!endDate\" [(ngModel)]=\"timepickerVariables.right.selectedSecond\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option *ngFor=\"let i of timepickerVariables.right.seconds; let index = index;\"\n                    [value]=\"i\"\n                    [disabled]=\"timepickerVariables.right.disabledSeconds.indexOf(i) > -1\">{{timepickerVariables.right.secondsLabel[index]}}</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n            <div class=\"select\">\n                <select *ngIf=\"!timePicker24Hour\" class=\"select-item ampmselect\" [(ngModel)]=\"timepickerVariables.right.ampmModel\" (ngModelChange)=\"timeChanged($event, sideEnum.right)\">\n                    <option value=\"AM\" [disabled]=\"timepickerVariables.right.amDisabled\">AM</option>\n                    <option value=\"PM\"  [disabled]=\"timepickerVariables.right.pmDisabled\">PM</option>\n                </select>\n                <span class=\"select-highlight\"></span>\n                <span class=\"select-bar\"></span>\n            </div>\n        </div>\n    </div>\n    <div class=\"buttons\" *ngIf=\"!autoApply && ( !rangesArray.length || (showCalInRanges && !singleDatePicker))\">\n        <div class=\"buttons_input\">\n            <button  *ngIf=\"showClearButton\" class=\"btn btn-default clear\" type=\"button\" (click)=\"clear()\" title=\"clear the date\">\n                <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"30\" height=\"30\" viewBox=\"0 -5 24 24\"><path d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>\n            </button>\n            <button class=\"btn btn-default\" *ngIf=\"showCancel\" type=\"button\" (click)=\"clickCancel($event)\">{{locale.cancelLabel}}</button>\n            <button class=\"btn\"  [disabled]=\"applyBtn.disabled\" type=\"button\" (click)=\"clickApply($event)\">{{locale.applyLabel}}</button>\n        </div>\n    </div>\n</div>\n",
        host: {
            '(click)': 'handleInternalClick($event)',
        },
        encapsulation: ViewEncapsulation.None,
        providers: [{
                provide: NG_VALUE_ACCESSOR,
                useExisting: forwardRef(() => DaterangepickerComponent_1),
                multi: true
            }],
        styles: [".md-drppicker{position:absolute;font-family:Roboto,sans-serif;color:inherit;border-radius:4px;width:278px;padding:4px;margin-top:-10px;overflow:hidden;z-index:1000;font-size:14px;background-color:#fff;box-shadow:0 2px 4px 0 rgba(0,0,0,.16),0 2px 8px 0 rgba(0,0,0,.12)}.md-drppicker.double{width:auto}.md-drppicker.inline{position:relative;display:inline-block}.md-drppicker:after,.md-drppicker:before{position:absolute;display:inline-block;border-bottom-color:rgba(0,0,0,.2);content:''}.md-drppicker.openscenter:after,.md-drppicker.openscenter:before{left:0;right:0;width:0;margin-left:auto;margin-right:auto}.md-drppicker.single .calendar,.md-drppicker.single .ranges{float:none}.md-drppicker.shown{-webkit-transform:scale(1);transform:scale(1);transition:.1s ease-in-out;-webkit-transform-origin:0 0;transform-origin:0 0;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.md-drppicker.shown.drops-up-left{-webkit-transform-origin:100% 100%;transform-origin:100% 100%}.md-drppicker.shown.drops-up-right{-webkit-transform-origin:0 100%;transform-origin:0 100%}.md-drppicker.shown.drops-down-left{-webkit-transform-origin:100% 0;transform-origin:100% 0}.md-drppicker.shown.drops-down-right{-webkit-transform-origin:0 0;transform-origin:0 0}.md-drppicker.shown.drops-down-center{-webkit-transform-origin:NaN;transform-origin:NaN}.md-drppicker.shown.drops-up-center{-webkit-transform-origin:50%;transform-origin:50%}.md-drppicker.shown .calendar{display:block}.md-drppicker.hidden{transition:.1s;-webkit-transform:scale(0);transform:scale(0);-webkit-transform-origin:0 0;transform-origin:0 0;cursor:default;-webkit-touch-callout:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none}.md-drppicker.hidden.drops-up-left{-webkit-transform-origin:100% 100%;transform-origin:100% 100%}.md-drppicker.hidden.drops-up-right{-webkit-transform-origin:0 100%;transform-origin:0 100%}.md-drppicker.hidden.drops-down-left{-webkit-transform-origin:100% 0;transform-origin:100% 0}.md-drppicker.hidden.drops-down-right{-webkit-transform-origin:0 0;transform-origin:0 0}.md-drppicker.hidden.drops-down-center{-webkit-transform-origin:NaN;transform-origin:NaN}.md-drppicker.hidden.drops-up-center{-webkit-transform-origin:50%;transform-origin:50%}.md-drppicker.hidden .calendar{display:none}.md-drppicker .calendar{max-width:270px;margin:4px}.md-drppicker .calendar.single .calendar-table{border:none}.md-drppicker .calendar td,.md-drppicker .calendar th{padding:0;white-space:nowrap;text-align:center;min-width:32px}.md-drppicker .calendar td span,.md-drppicker .calendar th span{pointer-events:none}.md-drppicker .calendar-table{border:1px solid #fff;padding:4px;border-radius:4px;background-color:#fff}.md-drppicker table{width:100%;margin:0}.md-drppicker th{color:#988c8c}.md-drppicker td,.md-drppicker th{text-align:center;border-radius:4px;border:1px solid transparent;white-space:nowrap;cursor:pointer;height:2em;width:2em}.md-drppicker td.available.prev,.md-drppicker th.available.prev{display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s;border-radius:2em}.md-drppicker td.available.prev:hover,.md-drppicker th.available.prev:hover{margin:0}.md-drppicker td.available.next,.md-drppicker th.available.next{-webkit-transform:rotate(180deg);transform:rotate(180deg);display:block;background-image:url(data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4Ig0KCSB2aWV3Qm94PSIwIDAgMy43IDYiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCAwIDMuNyA2IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxnPg0KCTxwYXRoIGQ9Ik0zLjcsMC43TDEuNCwzbDIuMywyLjNMMyw2TDAsM2wzLTNMMy43LDAuN3oiLz4NCjwvZz4NCjwvc3ZnPg0K);background-repeat:no-repeat;background-size:.5em;background-position:center;opacity:.8;transition:background-color .2s;border-radius:2em}.md-drppicker td.available.next:hover,.md-drppicker th.available.next:hover{margin:0;-webkit-transform:rotate(180deg);transform:rotate(180deg)}.md-drppicker td.available:hover,.md-drppicker th.available:hover{background-color:#eee;border-color:transparent;color:inherit;background-repeat:no-repeat;background-size:.5em;background-position:center;margin:.25em 0;opacity:.8;border-radius:2em;-webkit-transform:scale(1);transform:scale(1);transition:450ms cubic-bezier(.23,1,.32,1)}.md-drppicker td.week,.md-drppicker th.week{font-size:80%;color:#ccc}.md-drppicker td{margin:.25em 0;opacity:.8;transition:450ms cubic-bezier(.23,1,.32,1);border-radius:2em;-webkit-transform:scale(1);transform:scale(1)}.md-drppicker td.off,.md-drppicker td.off.end-date,.md-drppicker td.off.in-range,.md-drppicker td.off.start-date{background-color:#fff;border-color:transparent;color:#999}.md-drppicker td.in-range{background-color:#dde2e4;border-color:transparent;color:#000;border-radius:0}.md-drppicker td.start-date{border-radius:2em 0 0 2em}.md-drppicker td.end-date{border-radius:0 2em 2em 0}.md-drppicker td.start-date.end-date{border-radius:4px}.md-drppicker td.active{transition:background .3s ease-out;background:rgba(0,0,0,.1)}.md-drppicker td.active,.md-drppicker td.active:hover{background-color:#3f51b5;border-color:transparent;color:#fff}.md-drppicker th.month{width:auto}.md-drppicker option.disabled,.md-drppicker td.disabled{color:#999;cursor:not-allowed;text-decoration:line-through}.md-drppicker .dropdowns{background-repeat:no-repeat;background-size:10px;background-position-y:center;background-position-x:right;width:50px;background-image:url(data:image/svg+xml;utf8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iaXNvLTg4NTktMSI/Pgo8IS0tIEdlbmVyYXRvcjogQWRvYmUgSWxsdXN0cmF0b3IgMTYuMC4wLCBTVkcgRXhwb3J0IFBsdWctSW4gLiBTVkcgVmVyc2lvbjogNi4wMCBCdWlsZCAwKSAgLS0+CjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgdmVyc2lvbj0iMS4xIiBpZD0iQ2FwYV8xIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjE2cHgiIGhlaWdodD0iMTZweCIgdmlld0JveD0iMCAwIDI1NSAyNTUiIHN0eWxlPSJlbmFibGUtYmFja2dyb3VuZDpuZXcgMCAwIDI1NSAyNTU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPGc+Cgk8ZyBpZD0iYXJyb3ctZHJvcC1kb3duIj4KCQk8cG9seWdvbiBwb2ludHM9IjAsNjMuNzUgMTI3LjUsMTkxLjI1IDI1NSw2My43NSAgICIgZmlsbD0iIzk4OGM4YyIvPgoJPC9nPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+CjxnPgo8L2c+Cjwvc3ZnPgo=)}.md-drppicker .dropdowns select{display:inline-block;background-color:rgba(255,255,255,.9);width:100%;padding:5px;border:1px solid #f2f2f2;border-radius:2px;height:3rem}.md-drppicker .dropdowns select.ampmselect,.md-drppicker .dropdowns select.hourselect,.md-drppicker .dropdowns select.minuteselect,.md-drppicker .dropdowns select.secondselect{width:50px;margin:0 auto;background:#eee;border:1px solid #eee;padding:2px;outline:0;font-size:12px}.md-drppicker .dropdowns select.monthselect,.md-drppicker .dropdowns select.yearselect{font-size:12px;height:auto;cursor:pointer;opacity:0;position:absolute;top:0;left:0;margin:0;padding:0}.md-drppicker th.month>div{position:relative;display:inline-block}.md-drppicker .calendar-time{text-align:center;margin:4px auto 0;line-height:30px;position:relative}.md-drppicker .calendar-time .select{display:inline}.md-drppicker .calendar-time .select .select-item{display:inline-block;width:auto;position:relative;font-family:inherit;background-color:transparent;padding:10px 10px 10px 0;font-size:18px;border-radius:0;border:none;border-bottom:1px solid rgba(0,0,0,.12)}.md-drppicker .calendar-time .select .select-item:after{position:absolute;top:18px;right:10px;width:0;height:0;padding:0;content:'';border-left:6px solid transparent;border-right:6px solid transparent;border-top:6px solid rgba(0,0,0,.12);pointer-events:none}.md-drppicker .calendar-time .select .select-item:focus{outline:0}.md-drppicker .calendar-time .select .select-item .select-label{color:rgba(0,0,0,.26);font-size:16px;font-weight:400;position:absolute;pointer-events:none;left:0;top:10px;transition:.2s}.md-drppicker .calendar-time select.disabled{color:#ccc;cursor:not-allowed}.md-drppicker .label-input{border:1px solid #ccc;border-radius:4px;color:#555;height:30px;line-height:30px;display:block;vertical-align:middle;margin:0 auto 5px;padding:0 0 0 28px;width:100%}.md-drppicker .label-input.active{border:1px solid #08c;border-radius:4px}.md-drppicker .md-drppicker_input{position:relative;padding:0 30px 0 0}.md-drppicker .md-drppicker_input i,.md-drppicker .md-drppicker_input svg{position:absolute;left:8px;top:8px}.md-drppicker.rtl .label-input{padding-right:28px;padding-left:6px}.md-drppicker.rtl .md-drppicker_input i,.md-drppicker.rtl .md-drppicker_input svg{left:auto;right:8px}.md-drppicker .show-ranges .drp-calendar.left{border-left:1px solid #ddd}.md-drppicker .ranges{float:none;text-align:left;margin:0}.md-drppicker .ranges ul{list-style:none;margin:0 auto;padding:0;width:100%}.md-drppicker .ranges ul li{font-size:12px}.md-drppicker .ranges ul li button{padding:8px 12px;width:100%;background:0 0;border:none;text-align:left;cursor:pointer}.md-drppicker .ranges ul li button.active{background-color:#3f51b5;color:#fff}.md-drppicker .ranges ul li button[disabled]{opacity:.3}.md-drppicker .ranges ul li button:active{background:0 0}.md-drppicker .ranges ul li:hover{background-color:#eee}.md-drppicker .show-calendar .ranges{margin-top:8px}.md-drppicker [hidden]{display:none}.md-drppicker .buttons{text-align:right;margin:0 5px 5px 0}.md-drppicker .btn{position:relative;overflow:hidden;border-width:0;outline:0;padding:0 6px;cursor:pointer;border-radius:2px;box-shadow:0 1px 4px rgba(0,0,0,.6);background-color:#3f51b5;color:#ecf0f1;transition:background-color .4s;height:auto;text-transform:uppercase;line-height:36px;border:none}.md-drppicker .btn:focus,.md-drppicker .btn:hover{background-color:#3f51b5}.md-drppicker .btn>*{position:relative}.md-drppicker .btn span{display:block;padding:12px 24px}.md-drppicker .btn:before{content:\"\";position:absolute;top:50%;left:50%;display:block;width:0;padding-top:0;border-radius:100%;background-color:rgba(236,240,241,.3);-webkit-transform:translate(-50%,-50%);transform:translate(-50%,-50%)}.md-drppicker .btn:active:before{width:120%;padding-top:120%;transition:width .2s ease-out,padding-top .2s ease-out}.md-drppicker .btn:disabled{opacity:.5}.md-drppicker .btn.btn-default{color:#000;background-color:#dcdcdc}.md-drppicker .clear{box-shadow:none;background-color:#fff!important}.md-drppicker .clear svg{color:#eb3232;fill:currentColor}@media (min-width:564px){.md-drppicker{width:auto}.md-drppicker.single .calendar.left{clear:none}.md-drppicker.ltr{direction:ltr;text-align:left}.md-drppicker.ltr .calendar.left{clear:left}.md-drppicker.ltr .calendar.left .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0;padding-right:12px}.md-drppicker.ltr .calendar.right{margin-left:0}.md-drppicker.ltr .calendar.right .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.ltr .left .md-drppicker_input,.md-drppicker.ltr .right .md-drppicker_input{padding-right:35px}.md-drppicker.ltr .calendar,.md-drppicker.ltr .ranges{float:left}.md-drppicker.rtl{direction:rtl;text-align:right}.md-drppicker.rtl .calendar.left{clear:right;margin-left:0}.md-drppicker.rtl .calendar.left .calendar-table{border-left:none;border-top-left-radius:0;border-bottom-left-radius:0}.md-drppicker.rtl .calendar.right{margin-right:0}.md-drppicker.rtl .calendar.right .calendar-table{border-right:none;border-top-right-radius:0;border-bottom-right-radius:0}.md-drppicker.rtl .calendar.left .calendar-table,.md-drppicker.rtl .left .md-drppicker_input{padding-left:12px}.md-drppicker.rtl .calendar,.md-drppicker.rtl .ranges{text-align:right;float:right}.drp-animate{-webkit-transform:translate(0);transform:translate(0);transition:transform .2s,opacity .2s,-webkit-transform .2s}.drp-animate.drp-picker-site-this{transition-timing-function:linear}.drp-animate.drp-animate-right{-webkit-transform:translateX(10%);transform:translateX(10%);opacity:0}.drp-animate.drp-animate-left{-webkit-transform:translateX(-10%);transform:translateX(-10%);opacity:0}}@media (min-width:730px){.md-drppicker .ranges{width:auto}.md-drppicker.ltr .ranges{float:left}.md-drppicker.rtl .ranges{float:right}.md-drppicker .calendar.left{clear:none!important}}"]
    }),
    tslib_1.__metadata("design:paramtypes", [ElementRef,
        ChangeDetectorRef,
        LocaleService])
], DaterangepickerComponent);
export { DaterangepickerComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGF0ZXJhbmdlcGlja2VyLmNvbXBvbmVudC5qcyIsInNvdXJjZVJvb3QiOiJuZzovL25neC1kYXRlcmFuZ2VwaWNrZXItbWF0ZXJpYWwvIiwic291cmNlcyI6WyJkYXRlcmFuZ2VwaWNrZXIuY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsT0FBTyxFQUNILFNBQVMsRUFBVSxVQUFVLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxpQkFBaUIsRUFBRSxpQkFBaUIsRUFDMUgsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFFLGlCQUFpQixFQUF3QixNQUFNLGdCQUFnQixDQUFDO0FBQ3pFLE9BQU8sRUFBRSxXQUFXLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUc1QyxPQUFPLEtBQUssT0FBTyxNQUFNLFFBQVEsQ0FBQztBQUNsQyxPQUFPLEVBQUUsYUFBYSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDakQsTUFBTSxNQUFNLEdBQUcsT0FBTyxDQUFDO0FBRXZCLE1BQU0sQ0FBTixJQUFZLFFBR1g7QUFIRCxXQUFZLFFBQVE7SUFDaEIseUJBQWEsQ0FBQTtJQUNiLDJCQUFlLENBQUE7QUFDbkIsQ0FBQyxFQUhXLFFBQVEsS0FBUixRQUFRLFFBR25CO0FBZ0JELElBQWEsd0JBQXdCLGdDQUFyQyxNQUFhLHdCQUF3QjtJQXNHakMsWUFDWSxFQUFjLEVBQ2QsSUFBdUIsRUFDdkIsY0FBNkI7UUFGN0IsT0FBRSxHQUFGLEVBQUUsQ0FBWTtRQUNkLFNBQUksR0FBSixJQUFJLENBQW1CO1FBQ3ZCLG1CQUFjLEdBQWQsY0FBYyxDQUFlO1FBeEdqQyxTQUFJLEdBQTJCLEVBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFDLENBQUM7UUFFaEUsc0JBQWlCLEdBQTRCLEVBQUMsSUFBSSxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFDLENBQUM7UUFD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UUFDL0MsSUFBSSxFQUFFO1lBQ04sU0FBUyxFQUFFLDZCQUE2QjtTQUN2QztRQUNELGFBQWEsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJO1FBQ3JDLFNBQVMsRUFBRSxDQUFDO2dCQUNSLE9BQU8sRUFBRSxpQkFBaUI7Z0JBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUMsR0FBRyxFQUFFLENBQUMsMEJBQXdCLENBQUM7Z0JBQ3ZELEtBQUssRUFBRSxJQUFJO2FBQ2QsQ0FBQzs7S0FDTCxDQUFDOzZDQXdHa0IsVUFBVTtRQUNSLGlCQUFpQjtRQUNQLGFBQWE7R0F6R2hDLHdCQUF3QixDQTJtQ3BDO1NBM21DWSx3QkFBd0IiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1xuICAgIENvbXBvbmVudCwgT25Jbml0LCBFbGVtZW50UmVmLCBWaWV3Q2hpbGQsIEV2ZW50RW1pdHRlciwgT3V0cHV0LCBJbnB1dCwgZm9yd2FyZFJlZiwgVmlld0VuY2Fwc3VsYXRpb24sIENoYW5nZURldGVjdG9yUmVmLCBJbmplY3Rcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQgeyBOR19WQUxVRV9BQ0NFU1NPUiwgQ29udHJvbFZhbHVlQWNjZXNzb3IgfSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5pbXBvcnQgeyBGb3JtQ29udHJvbH0gZnJvbSAnQGFuZ3VsYXIvZm9ybXMnO1xuaW1wb3J0IHsgTG9jYWxlQ29uZmlnLCBMT0NBTEVfQ09ORklHIH0gZnJvbSAnLi9kYXRlcmFuZ2VwaWNrZXIuY29uZmlnJztcblxuaW1wb3J0ICogYXMgX21vbWVudCBmcm9tICdtb21lbnQnO1xuaW1wb3J0IHsgTG9jYWxlU2VydmljZSB9IGZyb20gJy4vbG9jYWxlLnNlcnZpY2UnO1xuY29uc3QgbW9tZW50ID0gX21vbWVudDtcblxuZXhwb3J0IGVudW0gU2lkZUVudW0ge1xuICAgIGxlZnQgPSAnbGVmdCcsXG4gICAgcmlnaHQgPSAncmlnaHQnXG59XG5cbkBDb21wb25lbnQoe1xuICAgIHNlbGVjdG9yOiAnbmd4LWRhdGVyYW5nZXBpY2tlci1tYXRlcmlhbCcsXG4gICAgc3R5bGVVcmxzOiBbJy4vZGF0ZXJhbmdlcGlja2VyLmNvbXBvbmVudC5zY3NzJ10sXG4gICAgdGVtcGxhdGVVcmw6ICcuL2RhdGVyYW5nZXBpY2tlci5jb21wb25lbnQuaHRtbCcsXG4gICAgaG9zdDoge1xuICAgICcoY2xpY2spJzogJ2hhbmRsZUludGVybmFsQ2xpY2soJGV2ZW50KScsXG4gICAgfSxcbiAgICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICAgIHByb3ZpZGVyczogW3tcbiAgICAgICAgcHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG4gICAgICAgIHVzZUV4aXN0aW5nOiBmb3J3YXJkUmVmKCgpID0+IERhdGVyYW5nZXBpY2tlckNvbXBvbmVudCksXG4gICAgICAgIG11bHRpOiB0cnVlXG4gICAgfV1cbn0pXG5leHBvcnQgY2xhc3MgRGF0ZXJhbmdlcGlja2VyQ29tcG9uZW50IGltcGxlbWVudHMgT25Jbml0IHtcbiAgICBwcml2YXRlIF9vbGQ6IHtzdGFydDogYW55LCBlbmQ6IGFueX0gPSB7c3RhcnQ6IG51bGwsIGVuZDogbnVsbH07XG4gICAgY2hvc2VuTGFiZWw6IHN0cmluZztcbiAgICBjYWxlbmRhclZhcmlhYmxlczoge2xlZnQ6IGFueSwgcmlnaHQ6IGFueX0gPSB7bGVmdDoge30sIHJpZ2h0OiB7fX07XG4gICAgdGltZXBpY2tlclZhcmlhYmxlczoge2xlZnQ6IGFueSwgcmlnaHQ6IGFueX0gPSB7bGVmdDoge30sIHJpZ2h0OiB7fX07XG4gICAgZGF0ZXJhbmdlcGlja2VyOiB7c3RhcnQ6IEZvcm1Db250cm9sLCBlbmQ6IEZvcm1Db250cm9sfSA9IHtzdGFydDogbmV3IEZvcm1Db250cm9sKCksIGVuZDogbmV3IEZvcm1Db250cm9sKCl9O1xuICAgIGFwcGx5QnRuOiB7ZGlzYWJsZWQ6IGJvb2xlYW59ID0ge2Rpc2FibGVkOiBmYWxzZX07XG4gICAgc3RhcnREYXRlID0gbW9tZW50KCkuc3RhcnRPZignZGF5Jyk7XG4gICAgZW5kRGF0ZSA9IG1vbWVudCgpLmVuZE9mKCdkYXknKTtcbiAgICBASW5wdXQoKVxuICAgIGRhdGVMaW1pdDogbnVtYmVyID0gbnVsbDtcbiAgICAvLyB1c2VkIGluIHRlbXBsYXRlIGZvciBjb21waWxlIHRpbWUgc3VwcG9ydCBvZiBlbnVtIHZhbHVlcy5cbiAgICBzaWRlRW51bSA9IFNpZGVFbnVtO1xuXG4gICAgQElucHV0KClcbiAgICBtaW5EYXRlOiBfbW9tZW50Lk1vbWVudCA9IG51bGw7XG4gICAgQElucHV0KClcbiAgICBtYXhEYXRlOiBfbW9tZW50Lk1vbWVudCA9IG51bGw7XG4gICAgQElucHV0KClcbiAgICBhdXRvQXBwbHk6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIHNpbmdsZURhdGVQaWNrZXI6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIHNob3dEcm9wZG93bnM6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIHNob3dXZWVrTnVtYmVyczogQm9vbGVhbiA9IGZhbHNlO1xuICAgIEBJbnB1dCgpXG4gICAgc2hvd0lTT1dlZWtOdW1iZXJzIDogQm9vbGVhbj0gZmFsc2U7XG4gICAgQElucHV0KClcbiAgICBsaW5rZWRDYWxlbmRhcnM6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIGF1dG9VcGRhdGVJbnB1dDogQm9vbGVhbiA9IHRydWU7XG4gICAgQElucHV0KClcbiAgICBhbHdheXNTaG93Q2FsZW5kYXJzOiBCb29sZWFuID0gZmFsc2U7XG4gICAgQElucHV0KClcbiAgICBtYXhTcGFuOiBCb29sZWFuID0gZmFsc2U7XG4gICAgLy8gdGltZXBpY2tlciB2YXJpYWJsZXNcbiAgICBASW5wdXQoKVxuICAgIHRpbWVQaWNrZXI6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIHRpbWVQaWNrZXIyNEhvdXI6IEJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIHRpbWVQaWNrZXJJbmNyZW1lbnQ6IG51bWJlciA9IDE7XG4gICAgQElucHV0KClcbiAgICB0aW1lUGlja2VyU2Vjb25kczogQm9vbGVhbiA9IGZhbHNlO1xuICAgIC8vIGVuZCBvZiB0aW1lcGlja2VyIHZhcmlhYmxlc1xuICAgIEBJbnB1dCgpXG4gICAgc2hvd0NsZWFyQnV0dG9uOiBCb29sZWFuID0gZmFsc2U7XG4gICAgQElucHV0KClcbiAgICBmaXJzdE1vbnRoRGF5Q2xhc3M6IHN0cmluZyA9IG51bGw7XG4gICAgQElucHV0KClcbiAgICBsYXN0TW9udGhEYXlDbGFzczogc3RyaW5nID0gbnVsbDtcbiAgICBASW5wdXQoKVxuICAgIGVtcHR5V2Vla1Jvd0NsYXNzOiBzdHJpbmcgPSBudWxsO1xuICAgIEBJbnB1dCgpXG4gICAgZmlyc3REYXlPZk5leHRNb250aENsYXNzOiBzdHJpbmcgPSBudWxsO1xuICAgIEBJbnB1dCgpXG4gICAgbGFzdERheU9mUHJldmlvdXNNb250aENsYXNzOiBzdHJpbmcgPSBudWxsO1xuICAgIF9sb2NhbGU6IExvY2FsZUNvbmZpZyA9IHt9O1xuICAgIEBJbnB1dCgpIHNldCBsb2NhbGUodmFsdWUpIHtcbiAgICAgIHRoaXMuX2xvY2FsZSA9IHsuLi50aGlzLl9sb2NhbGVTZXJ2aWNlLmNvbmZpZywgLi4udmFsdWV9O1xuICAgIH1cbiAgICBnZXQgbG9jYWxlKCk6IGFueSB7XG4gICAgICByZXR1cm4gdGhpcy5fbG9jYWxlO1xuICAgIH1cbiAgICAvLyBjdXN0b20gcmFuZ2VzXG4gICAgX3JhbmdlczogYW55ID0ge307XG5cbiAgICBASW5wdXQoKSBzZXQgcmFuZ2VzKHZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3JhbmdlcyA9IHZhbHVlO1xuICAgICAgICB0aGlzLnJlbmRlclJhbmdlcygpO1xuICAgIH1cbiAgICBnZXQgcmFuZ2VzKCk6IGFueSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yYW5nZXM7XG4gICAgfVxuXG4gICAgQElucHV0KClcbiAgICBzaG93Q3VzdG9tUmFuZ2VMYWJlbDogYm9vbGVhbjtcbiAgICBASW5wdXQoKVxuICAgIHNob3dDYW5jZWw6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIGtlZXBDYWxlbmRhck9wZW5pbmdXaXRoUmFuZ2U6IGJvb2xlYW4gPSBmYWxzZTtcbiAgICBASW5wdXQoKVxuICAgIHNob3dSYW5nZUxhYmVsT25JbnB1dDogYm9vbGVhbiA9IGZhbHNlO1xuICAgIGNob3NlblJhbmdlOiBzdHJpbmc7XG4gICAgcmFuZ2VzQXJyYXk6IEFycmF5PGFueT4gPSBbXTtcblxuICAgIC8vIHNvbWUgc3RhdGUgaW5mb3JtYXRpb25cbiAgICBpc1Nob3duOiBCb29sZWFuID0gZmFsc2U7XG4gICAgaW5saW5lOiBib29sZWFuID0gdHJ1ZTtcbiAgICBsZWZ0Q2FsZW5kYXI6IGFueSA9IHt9O1xuICAgIHJpZ2h0Q2FsZW5kYXI6IGFueSA9IHt9O1xuICAgIHNob3dDYWxJblJhbmdlczogQm9vbGVhbiA9IGZhbHNlO1xuXG4gICAgb3B0aW9uczogYW55ID0ge30gOyAvLyBzaG91bGQgZ2V0IHNvbWUgb3B0IGZyb20gdXNlclxuICAgIEBJbnB1dCgpIGRyb3BzOiBzdHJpbmc7XG4gICAgQElucHV0KCkgb3BlbnM6IHN0cmluZztcbiAgICBAT3V0cHV0KCdjaG9vc2VkRGF0ZScpIGNob29zZWREYXRlOiBFdmVudEVtaXR0ZXI8T2JqZWN0PjtcbiAgICBAT3V0cHV0KCdyYW5nZUNsaWNrZWQnKSByYW5nZUNsaWNrZWQ6IEV2ZW50RW1pdHRlcjxPYmplY3Q+O1xuICAgIEBPdXRwdXQoJ2RhdGVzVXBkYXRlZCcpIGRhdGVzVXBkYXRlZDogRXZlbnRFbWl0dGVyPE9iamVjdD47XG4gICAgQFZpZXdDaGlsZCgncGlja2VyQ29udGFpbmVyJykgcGlja2VyQ29udGFpbmVyOiBFbGVtZW50UmVmO1xuXG4gICAgY29uc3RydWN0b3IoXG4gICAgICAgIHByaXZhdGUgZWw6IEVsZW1lbnRSZWYsXG4gICAgICAgIHByaXZhdGUgX3JlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgIHByaXZhdGUgX2xvY2FsZVNlcnZpY2U6IExvY2FsZVNlcnZpY2VcbiAgICApIHtcbiAgICAgICAgdGhpcy5jaG9vc2VkRGF0ZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbiAgICAgICAgdGhpcy5yYW5nZUNsaWNrZWQgPSBuZXcgRXZlbnRFbWl0dGVyKCk7XG4gICAgICAgIHRoaXMuZGF0ZXNVcGRhdGVkID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAgICAgICBcbiAgICB9XG5cbiAgICBuZ09uSW5pdCgpIHtcbiAgICAgICAgdGhpcy5fYnVpbGRMb2NhbGUoKTtcbiAgICAgICAgY29uc3QgZGF5c09mV2VlayA9IFsuLi50aGlzLmxvY2FsZS5kYXlzT2ZXZWVrXTtcbiAgICAgICAgaWYgKHRoaXMubG9jYWxlLmZpcnN0RGF5ICE9IDApIHtcbiAgICAgICAgICAgIHZhciBpdGVyYXRvciA9IHRoaXMubG9jYWxlLmZpcnN0RGF5O1xuXG4gICAgICAgICAgICB3aGlsZSAoaXRlcmF0b3IgPiAwKSB7XG4gICAgICAgICAgICAgICAgZGF5c09mV2Vlay5wdXNoKGRheXNPZldlZWsuc2hpZnQoKSk7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3ItLTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvY2FsZS5kYXlzT2ZXZWVrID0gZGF5c09mV2VlaztcbiAgICAgICAgaWYgKHRoaXMuaW5saW5lKSB7XG4gICAgICAgICAgICB0aGlzLl9vbGQuc3RhcnQgPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5fb2xkLmVuZCA9IHRoaXMuZW5kRGF0ZS5jbG9uZSgpO1xuICAgICAgICB9XG4gICAgICAgXG4gICAgICAgIHRoaXMudXBkYXRlTW9udGhzSW5WaWV3KCk7XG4gICAgICAgIHRoaXMucmVuZGVyQ2FsZW5kYXIoU2lkZUVudW0ubGVmdCk7XG4gICAgICAgIHRoaXMucmVuZGVyQ2FsZW5kYXIoU2lkZUVudW0ucmlnaHQpO1xuICAgICAgICB0aGlzLnJlbmRlclJhbmdlcygpO1xuICAgIH1cbiAgICByZW5kZXJSYW5nZXMoKSB7XG4gICAgICAgIHRoaXMucmFuZ2VzQXJyYXkgPSBbXTtcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XG4gICAgICAgIGlmICh0eXBlb2YgdGhpcy5yYW5nZXMgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJhbmdlIGluIHRoaXMucmFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLnJhbmdlc1tyYW5nZV1bMF0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gbW9tZW50KHRoaXMucmFuZ2VzW3JhbmdlXVswXSwgdGhpcy5sb2NhbGUuZm9ybWF0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdGFydCA9IG1vbWVudCh0aGlzLnJhbmdlc1tyYW5nZV1bMF0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5yYW5nZXNbcmFuZ2VdWzFdID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBtb21lbnQodGhpcy5yYW5nZXNbcmFuZ2VdWzFdLCB0aGlzLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVuZCA9IG1vbWVudCh0aGlzLnJhbmdlc1tyYW5nZV1bMV0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBzdGFydCBvciBlbmQgZGF0ZSBleGNlZWQgdGhvc2UgYWxsb3dlZCBieSB0aGUgbWluRGF0ZSBvciBtYXhTcGFuXG4gICAgICAgICAgICAgICAgLy8gb3B0aW9ucywgc2hvcnRlbiB0aGUgcmFuZ2UgdG8gdGhlIGFsbG93YWJsZSBwZXJpb2QuXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWluRGF0ZSAmJiBzdGFydC5pc0JlZm9yZSh0aGlzLm1pbkRhdGUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0YXJ0ID0gdGhpcy5taW5EYXRlLmNsb25lKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIG1heERhdGUgPSB0aGlzLm1heERhdGU7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWF4U3BhbiAmJiBtYXhEYXRlICYmIHN0YXJ0LmNsb25lKCkuYWRkKHRoaXMubWF4U3BhbikuaXNBZnRlcihtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgICAgICBtYXhEYXRlID0gc3RhcnQuY2xvbmUoKS5hZGQodGhpcy5tYXhTcGFuKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKG1heERhdGUgJiYgZW5kLmlzQWZ0ZXIobWF4RGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWF4RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIElmIHRoZSBlbmQgb2YgdGhlIHJhbmdlIGlzIGJlZm9yZSB0aGUgbWluaW11bSBvciB0aGUgc3RhcnQgb2YgdGhlIHJhbmdlIGlzXG4gICAgICAgICAgICAgICAgLy8gYWZ0ZXIgdGhlIG1heGltdW0sIGRvbid0IGRpc3BsYXkgdGhpcyByYW5nZSBvcHRpb24gYXQgYWxsLlxuICAgICAgICAgICAgICAgIGlmICgodGhpcy5taW5EYXRlICYmIGVuZC5pc0JlZm9yZSh0aGlzLm1pbkRhdGUsIHRoaXMudGltZVBpY2tlciA/ICdtaW51dGUnIDogJ2RheScpKVxuICAgICAgICAgICAgICAgIHx8IChtYXhEYXRlICYmIHN0YXJ0LmlzQWZ0ZXIobWF4RGF0ZSwgdGhpcy50aW1lUGlja2VyID8gJ21pbnV0ZScgOiAnZGF5JykpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vU3VwcG9ydCB1bmljb2RlIGNoYXJzIGluIHRoZSByYW5nZSBuYW1lcy5cbiAgICAgICAgICAgICAgICB2YXIgZWxlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJyk7XG4gICAgICAgICAgICAgICAgZWxlbS5pbm5lckhUTUwgPSByYW5nZTtcbiAgICAgICAgICAgICAgICB2YXIgcmFuZ2VIdG1sID0gZWxlbS52YWx1ZTtcblxuICAgICAgICAgICAgICAgIHRoaXMucmFuZ2VzW3JhbmdlSHRtbF0gPSBbc3RhcnQsIGVuZF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmb3IgKGNvbnN0IHJhbmdlIGluIHRoaXMucmFuZ2VzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZXNBcnJheS5wdXNoKHJhbmdlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dDdXN0b21SYW5nZUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yYW5nZXNBcnJheS5wdXNoKHRoaXMubG9jYWxlLmN1c3RvbVJhbmdlTGFiZWwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zaG93Q2FsSW5SYW5nZXMgPSAoIXRoaXMucmFuZ2VzQXJyYXkubGVuZ3RoKSB8fCB0aGlzLmFsd2F5c1Nob3dDYWxlbmRhcnM7XG4gICAgICAgICAgICBpZiAoIXRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlID0gdGhpcy5zdGFydERhdGUuc3RhcnRPZignZGF5Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5lbmREYXRlLmVuZE9mKCdkYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGNhbid0IGJlIHVzZWQgdG9nZXRoZXIgZm9yIG5vd1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlciAmJiB0aGlzLmF1dG9BcHBseSkge1xuICAgICAgICAgICAgICAgIHRoaXMuYXV0b0FwcGx5ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cbiAgICByZW5kZXJUaW1lUGlja2VyKHNpZGU6IFNpZGVFbnVtKSB7XG4gICAgICAgIGlmIChzaWRlID09IFNpZGVFbnVtLnJpZ2h0ICYmICF0aGlzLmVuZERhdGUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgc2VsZWN0ZWQsIG1pbkRhdGU7XG4gICAgICAgIGxldCBtYXhEYXRlID0gdGhpcy5tYXhEYXRlXG4gICAgICAgIGlmIChzaWRlID09PSBTaWRlRW51bS5sZWZ0KSB7XG4gICAgICAgICAgICBzZWxlY3RlZCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCksXG4gICAgICAgICAgICBtaW5EYXRlID0gdGhpcy5taW5EYXRlXG4gICAgICAgIH0gZWxzZSBpZiAoc2lkZSA9PT0gU2lkZUVudW0ucmlnaHQpIHtcbiAgICAgICAgICAgIHNlbGVjdGVkID0gdGhpcy5lbmREYXRlLmNsb25lKCksXG4gICAgICAgICAgICBtaW5EYXRlID0gdGhpcy5zdGFydERhdGVcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzdGFydCA9IHRoaXMudGltZVBpY2tlcjI0SG91ciA/IDAgOiAxO1xuICAgICAgICBjb25zdCBlbmQgPSB0aGlzLnRpbWVQaWNrZXIyNEhvdXIgPyAyMyA6IDEyO1xuICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0gPSB7XG4gICAgICAgICAgICBob3VyczogW10sXG4gICAgICAgICAgICBtaW51dGVzOiBbXSxcbiAgICAgICAgICAgIG1pbnV0ZXNMYWJlbDogW10sXG4gICAgICAgICAgICBzZWNvbmRzOiBbXSxcbiAgICAgICAgICAgIHNlY29uZHNMYWJlbDogW10sXG4gICAgICAgICAgICBkaXNhYmxlZEhvdXJzOiBbXSxcbiAgICAgICAgICAgIGRpc2FibGVkTWludXRlczogW10sXG4gICAgICAgICAgICBkaXNhYmxlZFNlY29uZHM6IFtdLFxuICAgICAgICAgICAgc2VsZWN0ZWRIb3VyOiAwLFxuICAgICAgICAgICAgc2VsZWN0ZWRNaW51dGU6IDAsXG4gICAgICAgICAgICBzZWxlY3RlZFNlY29uZDogMCxcbiAgICAgICAgfTtcbiAgICAgICAgLy8gZ2VuZXJhdGUgaG91cnNcbiAgICAgICAgZm9yIChsZXQgaSA9IHN0YXJ0OyBpIDw9IGVuZDsgaSsrKSB7XG4gICAgICAgICAgICBsZXQgaV9pbl8yNCA9IGk7XG4gICAgICAgICAgICBpZiAoIXRoaXMudGltZVBpY2tlcjI0SG91cikge1xuICAgICAgICAgICAgICAgIGlfaW5fMjQgPSBzZWxlY3RlZC5ob3VyKCkgPj0gMTIgPyAoaSA9PSAxMiA/IDEyIDogaSArIDEyKSA6IChpID09IDEyID8gMCA6IGkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdGltZSA9IHNlbGVjdGVkLmNsb25lKCkuaG91cihpX2luXzI0KTtcbiAgICAgICAgICAgIGxldCBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKG1pbkRhdGUgJiYgdGltZS5taW51dGUoNTkpLmlzQmVmb3JlKG1pbkRhdGUpKSB7XG4gICAgICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1heERhdGUgJiYgdGltZS5taW51dGUoMCkuaXNBZnRlcihtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLmhvdXJzLnB1c2goaSk7XG4gICAgICAgICAgICBpZiAoaV9pbl8yNCA9PSBzZWxlY3RlZC5ob3VyKCkgJiYgIWRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlbGVjdGVkSG91ciA9IGk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLmRpc2FibGVkSG91cnMucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBnZW5lcmF0ZSBtaW51dGVzXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjA7IGkgKz0gdGhpcy50aW1lUGlja2VySW5jcmVtZW50KSB7XG4gICAgICAgICAgICB2YXIgcGFkZGVkID0gaSA8IDEwID8gJzAnICsgaSA6IGk7XG4gICAgICAgICAgICB2YXIgdGltZSA9IHNlbGVjdGVkLmNsb25lKCkubWludXRlKGkpO1xuXG4gICAgICAgICAgICB2YXIgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgIGlmIChtaW5EYXRlICYmIHRpbWUuc2Vjb25kKDU5KS5pc0JlZm9yZShtaW5EYXRlKSkge1xuICAgICAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXhEYXRlICYmIHRpbWUuc2Vjb25kKDApLmlzQWZ0ZXIobWF4RGF0ZSkpIHtcbiAgICAgICAgICAgICAgICBkaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0ubWludXRlcy5wdXNoKGkpO1xuICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLm1pbnV0ZXNMYWJlbC5wdXNoKHBhZGRlZCk7XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQubWludXRlKCkgPT0gaSAmJiAhZGlzYWJsZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uc2VsZWN0ZWRNaW51dGUgPSBpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5kaXNhYmxlZE1pbnV0ZXMucHVzaChpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBnZW5lcmF0ZSBzZWNvbmRzXG4gICAgICAgIGlmICh0aGlzLnRpbWVQaWNrZXJTZWNvbmRzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDYwOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgcGFkZGVkID0gaSA8IDEwID8gJzAnICsgaSA6IGk7XG4gICAgICAgICAgICAgICAgdmFyIHRpbWUgPSBzZWxlY3RlZC5jbG9uZSgpLnNlY29uZChpKTtcblxuICAgICAgICAgICAgICAgIHZhciBkaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmIChtaW5EYXRlICYmIHRpbWUuaXNCZWZvcmUobWluRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAobWF4RGF0ZSAmJiB0aW1lLmlzQWZ0ZXIobWF4RGF0ZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWNvbmRzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLnNlY29uZHNMYWJlbC5wdXNoKHBhZGRlZCk7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGVjdGVkLnNlY29uZCgpID09IGkgJiYgIWRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZFNlY29uZCA9IGk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChkaXNhYmxlZCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uZGlzYWJsZWRTZWNvbmRzLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGdlbmVyYXRlIEFNL1BNXG4gICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyMjRIb3VyKSB7XG5cbiAgICAgICAgICAgIHZhciBhbV9odG1sID0gJyc7XG4gICAgICAgICAgICB2YXIgcG1faHRtbCA9ICcnO1xuXG4gICAgICAgICAgICBpZiAobWluRGF0ZSAmJiBzZWxlY3RlZC5jbG9uZSgpLmhvdXIoMTIpLm1pbnV0ZSgwKS5zZWNvbmQoMCkuaXNCZWZvcmUobWluRGF0ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uYW1EaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChtYXhEYXRlICYmIHNlbGVjdGVkLmNsb25lKCkuaG91cigwKS5taW51dGUoMCkuc2Vjb25kKDApLmlzQWZ0ZXIobWF4RGF0ZSkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0ucG1EaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc2VsZWN0ZWQuaG91cigpID49IDEyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy50aW1lcGlja2VyVmFyaWFibGVzW3NpZGVdLmFtcG1Nb2RlbCA9ICdQTSc7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5hbXBtTW9kZWwgPSAnQU0nO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZCA9IHNlbGVjdGVkO1xuICAgIH1cbiAgICByZW5kZXJDYWxlbmRhcihzaWRlOiBTaWRlRW51bSkgeyAvLyBzaWRlIGVudW1cbiAgICAgICAgbGV0IG1haW5DYWxlbmRhcjogYW55ID0gKCBzaWRlID09PSBTaWRlRW51bS5sZWZ0ICkgPyB0aGlzLmxlZnRDYWxlbmRhciA6IHRoaXMucmlnaHRDYWxlbmRhcjtcbiAgICAgICAgY29uc3QgbW9udGggPSBtYWluQ2FsZW5kYXIubW9udGgubW9udGgoKTtcbiAgICAgICAgY29uc3QgeWVhciA9IG1haW5DYWxlbmRhci5tb250aC55ZWFyKCk7XG4gICAgICAgIGNvbnN0IGhvdXIgPSBtYWluQ2FsZW5kYXIubW9udGguaG91cigpO1xuICAgICAgICBjb25zdCBtaW51dGUgPSBtYWluQ2FsZW5kYXIubW9udGgubWludXRlKCk7XG4gICAgICAgIGNvbnN0IHNlY29uZCA9IG1haW5DYWxlbmRhci5tb250aC5zZWNvbmQoKTtcbiAgICAgICAgY29uc3QgZGF5c0luTW9udGggPSBtb21lbnQoW3llYXIsIG1vbnRoXSkuZGF5c0luTW9udGgoKTtcbiAgICAgICAgY29uc3QgZmlyc3REYXkgPSBtb21lbnQoW3llYXIsIG1vbnRoLCAxXSk7XG4gICAgICAgIGNvbnN0IGxhc3REYXkgPSBtb21lbnQoW3llYXIsIG1vbnRoLCBkYXlzSW5Nb250aF0pO1xuICAgICAgICBjb25zdCBsYXN0TW9udGggPSBtb21lbnQoZmlyc3REYXkpLnN1YnRyYWN0KDEsICdtb250aCcpLm1vbnRoKCk7XG4gICAgICAgIGNvbnN0IGxhc3RZZWFyID0gbW9tZW50KGZpcnN0RGF5KS5zdWJ0cmFjdCgxLCAnbW9udGgnKS55ZWFyKCk7XG4gICAgICAgIGNvbnN0IGRheXNJbkxhc3RNb250aCA9IG1vbWVudChbbGFzdFllYXIsIGxhc3RNb250aF0pLmRheXNJbk1vbnRoKCk7XG4gICAgICAgIGNvbnN0IGRheU9mV2VlayA9IGZpcnN0RGF5LmRheSgpO1xuICAgICAgICAvLyBpbml0aWFsaXplIGEgNiByb3dzIHggNyBjb2x1bW5zIGFycmF5IGZvciB0aGUgY2FsZW5kYXJcbiAgICAgICAgbGV0IGNhbGVuZGFyOiBhbnkgPSBbXTtcbiAgICAgICAgY2FsZW5kYXIuZmlyc3REYXkgPSBmaXJzdERheTtcbiAgICAgICAgY2FsZW5kYXIubGFzdERheSA9IGxhc3REYXk7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgICAgIGNhbGVuZGFyW2ldID0gW107XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwb3B1bGF0ZSB0aGUgY2FsZW5kYXIgd2l0aCBkYXRlIG9iamVjdHNcbiAgICAgICAgbGV0IHN0YXJ0RGF5ID0gZGF5c0luTGFzdE1vbnRoIC0gZGF5T2ZXZWVrICsgdGhpcy5sb2NhbGUuZmlyc3REYXkgKyAxO1xuICAgICAgICBpZiAoc3RhcnREYXkgPiBkYXlzSW5MYXN0TW9udGgpIHtcbiAgICAgICAgICAgIHN0YXJ0RGF5IC09IDc7XG4gICAgICAgIH1cbiAgICAgICAgXG4gICAgICAgIGlmIChkYXlPZldlZWsgPT09IHRoaXMubG9jYWxlLmZpcnN0RGF5KSB7XG4gICAgICAgICAgICBzdGFydERheSA9IGRheXNJbkxhc3RNb250aCAtIDY7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgY3VyRGF0ZSA9IG1vbWVudChbbGFzdFllYXIsIGxhc3RNb250aCwgc3RhcnREYXksIDEyLCBtaW51dGUsIHNlY29uZF0pO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwLCBjb2wgPSAwLCByb3cgPSAwOyBpIDwgNDI7IGkrKywgY29sKyssIGN1ckRhdGUgPSBtb21lbnQoY3VyRGF0ZSkuYWRkKDI0LCAnaG91cicpKSB7XG4gICAgICAgICAgICBpZiAoaSA+IDAgJiYgY29sICUgNyA9PT0gMCkge1xuICAgICAgICAgICAgICAgIGNvbCA9IDA7XG4gICAgICAgICAgICAgICAgcm93Kys7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxlbmRhcltyb3ddW2NvbF0gPSBjdXJEYXRlLmNsb25lKCkuaG91cihob3VyKS5taW51dGUobWludXRlKS5zZWNvbmQoc2Vjb25kKTtcbiAgICAgICAgICAgIGN1ckRhdGUuaG91cigxMik7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1pbkRhdGUgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmZvcm1hdCgnWVlZWS1NTS1ERCcpID09PSB0aGlzLm1pbkRhdGUuZm9ybWF0KCdZWVlZLU1NLUREJykgJiZcbiAgICAgICAgICAgIGNhbGVuZGFyW3Jvd11bY29sXS5pc0JlZm9yZSh0aGlzLm1pbkRhdGUpICYmIHNpZGUgPT09ICdsZWZ0Jykge1xuICAgICAgICAgICAgICAgIGNhbGVuZGFyW3Jvd11bY29sXSA9IHRoaXMubWluRGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAodGhpcy5tYXhEYXRlICYmIGNhbGVuZGFyW3Jvd11bY29sXS5mb3JtYXQoJ1lZWVktTU0tREQnKSA9PT0gdGhpcy5tYXhEYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpICYmXG4gICAgICAgICAgICBjYWxlbmRhcltyb3ddW2NvbF0uaXNBZnRlcih0aGlzLm1heERhdGUpICYmIHNpZGUgPT09ICdyaWdodCcpIHtcbiAgICAgICAgICAgICAgICBjYWxlbmRhcltyb3ddW2NvbF0gPSB0aGlzLm1heERhdGUuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG1ha2UgdGhlIGNhbGVuZGFyIG9iamVjdCBhdmFpbGFibGUgdG8gaG92ZXJEYXRlL2NsaWNrRGF0ZVxuICAgICAgICBpZiAoc2lkZSA9PT0gU2lkZUVudW0ubGVmdCkge1xuICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIuY2FsZW5kYXIgPSBjYWxlbmRhcjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5jYWxlbmRhciA9IGNhbGVuZGFyO1xuICAgICAgICB9XG4gICAgICAgIC8vXG4gICAgICAgIC8vIERpc3BsYXkgdGhlIGNhbGVuZGFyXG4gICAgICAgIC8vXG4gICAgICAgIGNvbnN0IG1pbkRhdGUgPSBzaWRlID09PSAnbGVmdCcgPyB0aGlzLm1pbkRhdGUgOiB0aGlzLnN0YXJ0RGF0ZTtcbiAgICAgICAgbGV0IG1heERhdGUgPSB0aGlzLm1heERhdGU7XG4gICAgICAgIC8vIGFkanVzdCBtYXhEYXRlIHRvIHJlZmxlY3QgdGhlIGRhdGVMaW1pdCBzZXR0aW5nIGluIG9yZGVyIHRvXG4gICAgICAgIC8vIGdyZXkgb3V0IGVuZCBkYXRlcyBiZXlvbmQgdGhlIGRhdGVMaW1pdFxuICAgICAgICBpZiAodGhpcy5lbmREYXRlID09PSBudWxsICYmIHRoaXMuZGF0ZUxpbWl0KSB7XG4gICAgICAgICAgICBjb25zdCBtYXhMaW1pdCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCkuYWRkKHRoaXMuZGF0ZUxpbWl0LCAnZGF5JykuZW5kT2YoJ2RheScpO1xuICAgICAgICAgICAgICAgIGlmICghbWF4RGF0ZSB8fCBtYXhMaW1pdC5pc0JlZm9yZShtYXhEYXRlKSkge1xuICAgICAgICAgICAgICAgIG1heERhdGUgPSBtYXhMaW1pdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdID0ge1xuICAgICAgICAgICAgbW9udGg6IG1vbnRoLFxuICAgICAgICAgICAgeWVhcjogeWVhcixcbiAgICAgICAgICAgIGhvdXI6IGhvdXIsXG4gICAgICAgICAgICBtaW51dGU6IG1pbnV0ZSxcbiAgICAgICAgICAgIHNlY29uZDogc2Vjb25kLFxuICAgICAgICAgICAgZGF5c0luTW9udGg6IGRheXNJbk1vbnRoLFxuICAgICAgICAgICAgZmlyc3REYXk6IGZpcnN0RGF5LFxuICAgICAgICAgICAgbGFzdERheTogbGFzdERheSxcbiAgICAgICAgICAgIGxhc3RNb250aDogbGFzdE1vbnRoLFxuICAgICAgICAgICAgbGFzdFllYXI6IGxhc3RZZWFyLFxuICAgICAgICAgICAgZGF5c0luTGFzdE1vbnRoOiBkYXlzSW5MYXN0TW9udGgsXG4gICAgICAgICAgICBkYXlPZldlZWs6IGRheU9mV2VlayxcbiAgICAgICAgICAgIC8vIG90aGVyIHZhcnNcbiAgICAgICAgICAgIGNhbFJvd3M6IEFycmF5LmZyb20oQXJyYXkoNikua2V5cygpKSxcbiAgICAgICAgICAgIGNhbENvbHM6IEFycmF5LmZyb20oQXJyYXkoNykua2V5cygpKSxcbiAgICAgICAgICAgIGNsYXNzZXM6IHt9LFxuICAgICAgICAgICAgbWluRGF0ZTogbWluRGF0ZSxcbiAgICAgICAgICAgIG1heERhdGU6IG1heERhdGUsXG4gICAgICAgICAgICBjYWxlbmRhcjogY2FsZW5kYXJcbiAgICAgICAgfTtcbiAgICAgICAgaWYgKHRoaXMuc2hvd0Ryb3Bkb3ducykge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudE1vbnRoID0gY2FsZW5kYXJbMV1bMV0ubW9udGgoKTtcbiAgICAgICAgICAgIGNvbnN0IGN1cnJlbnRZZWFyID0gY2FsZW5kYXJbMV1bMV0ueWVhcigpO1xuICAgICAgICAgICAgY29uc3QgbWF4WWVhciA9IChtYXhEYXRlICYmIG1heERhdGUueWVhcigpKSB8fCAoY3VycmVudFllYXIgKyA1KTtcbiAgICAgICAgICAgIGNvbnN0IG1pblllYXIgPSAobWluRGF0ZSAmJiBtaW5EYXRlLnllYXIoKSkgfHwgKGN1cnJlbnRZZWFyIC0gNTApO1xuICAgICAgICAgICAgY29uc3QgaW5NaW5ZZWFyID0gY3VycmVudFllYXIgPT09IG1pblllYXI7XG4gICAgICAgICAgICBjb25zdCBpbk1heFllYXIgPSBjdXJyZW50WWVhciA9PT0gbWF4WWVhcjtcbiAgICAgICAgICAgIGNvbnN0IHllYXJzID0gW107XG4gICAgICAgICAgICBmb3IgKHZhciB5ID0gbWluWWVhcjsgeSA8PSBtYXhZZWFyOyB5KyspIHtcbiAgICAgICAgICAgICAgICB5ZWFycy5wdXNoKHkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5kcm9wZG93bnMgPSB7XG4gICAgICAgICAgICAgICAgY3VycmVudE1vbnRoOiBjdXJyZW50TW9udGgsXG4gICAgICAgICAgICAgICAgY3VycmVudFllYXI6IGN1cnJlbnRZZWFyLFxuICAgICAgICAgICAgICAgIG1heFllYXI6IG1heFllYXIsXG4gICAgICAgICAgICAgICAgbWluWWVhcjogbWluWWVhcixcbiAgICAgICAgICAgICAgICBpbk1pblllYXI6IGluTWluWWVhcixcbiAgICAgICAgICAgICAgICBpbk1heFllYXI6IGluTWF4WWVhcixcbiAgICAgICAgICAgICAgICBtb250aEFycmF5czogQXJyYXkuZnJvbShBcnJheSgxMikua2V5cygpKSxcbiAgICAgICAgICAgICAgICB5ZWFyQXJyYXlzOiB5ZWFyc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBcbiAgICAgICAgdGhpcy5fYnVpbGRDZWxscyhjYWxlbmRhciwgc2lkZSlcbiAgICB9XG4gICAgc2V0U3RhcnREYXRlKHN0YXJ0RGF0ZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0YXJ0RGF0ZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlID0gbW9tZW50KHN0YXJ0RGF0ZSwgdGhpcy5sb2NhbGUuZm9ybWF0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2Ygc3RhcnREYXRlID09PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSBtb21lbnQoc3RhcnREYXRlKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSB0aGlzLnN0YXJ0RGF0ZS5zdGFydE9mKCdkYXknKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnRpbWVQaWNrZXIgJiYgdGhpcy50aW1lUGlja2VySW5jcmVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZS5taW51dGUoTWF0aC5yb3VuZCh0aGlzLnN0YXJ0RGF0ZS5taW51dGUoKSAvIHRoaXMudGltZVBpY2tlckluY3JlbWVudCkgKiB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAodGhpcy5taW5EYXRlICYmIHRoaXMuc3RhcnREYXRlLmlzQmVmb3JlKHRoaXMubWluRGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlID0gdGhpcy5taW5EYXRlLmNsb25lKCk7XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyICYmIHRoaXMudGltZVBpY2tlckluY3JlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlLm1pbnV0ZShNYXRoLnJvdW5kKHRoaXMuc3RhcnREYXRlLm1pbnV0ZSgpIC8gdGhpcy50aW1lUGlja2VySW5jcmVtZW50KSAqIHRoaXMudGltZVBpY2tlckluY3JlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1heERhdGUgJiYgdGhpcy5zdGFydERhdGUuaXNBZnRlcih0aGlzLm1heERhdGUpKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZSA9IHRoaXMubWF4RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlciAmJiB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0RGF0ZS5taW51dGUoTWF0aC5mbG9vcih0aGlzLnN0YXJ0RGF0ZS5taW51dGUoKSAvIHRoaXMudGltZVBpY2tlckluY3JlbWVudCkgKiB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCF0aGlzLmlzU2hvd24pIHtcbiAgICAgICAgICAgIHRoaXMudXBkYXRlRWxlbWVudCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVNb250aHNJblZpZXcoKTtcbiAgICB9XG5cbiAgICBzZXRFbmREYXRlKGVuZERhdGUpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBlbmREYXRlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gbW9tZW50KGVuZERhdGUsIHRoaXMubG9jYWxlLmZvcm1hdCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZW9mIGVuZERhdGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICB0aGlzLmVuZERhdGUgPSBtb21lbnQoZW5kRGF0ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLnRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kRGF0ZSA9IHRoaXMuZW5kRGF0ZS5hZGQoMSwnZCcpLnN0YXJ0T2YoJ2RheScpLnN1YnRyYWN0KDEsJ3NlY29uZCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlciAmJiB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kRGF0ZS5taW51dGUoTWF0aC5yb3VuZCh0aGlzLmVuZERhdGUubWludXRlKCkgLyB0aGlzLnRpbWVQaWNrZXJJbmNyZW1lbnQpICogdGhpcy50aW1lUGlja2VySW5jcmVtZW50KTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKHRoaXMuZW5kRGF0ZS5pc0JlZm9yZSh0aGlzLnN0YXJ0RGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kRGF0ZSA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5tYXhEYXRlICYmIHRoaXMuZW5kRGF0ZS5pc0FmdGVyKHRoaXMubWF4RGF0ZSkpIHtcbiAgICAgICAgICAgIHRoaXMuZW5kRGF0ZSA9IHRoaXMubWF4RGF0ZS5jbG9uZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMuZGF0ZUxpbWl0ICYmIHRoaXMuc3RhcnREYXRlLmNsb25lKCkuYWRkKHRoaXMuZGF0ZUxpbWl0LCAnZGF5JykuaXNCZWZvcmUodGhpcy5lbmREYXRlKSkge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKS5hZGQodGhpcy5kYXRlTGltaXQsICdkYXknKTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKCF0aGlzLmlzU2hvd24pIHtcbiAgICAgICAgICAgIC8vIHRoaXMudXBkYXRlRWxlbWVudCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlTW9udGhzSW5WaWV3KCk7XG4gICAgfVxuICAgIEBJbnB1dCgpXG4gICAgaXNJbnZhbGlkRGF0ZShkYXRlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgQElucHV0KClcbiAgICBpc0N1c3RvbURhdGUoZGF0ZSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdXBkYXRlVmlldygpIHtcbiAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJUaW1lUGlja2VyKFNpZGVFbnVtLmxlZnQpO1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJUaW1lUGlja2VyKFNpZGVFbnVtLnJpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVwZGF0ZU1vbnRoc0luVmlldygpO1xuICAgICAgICB0aGlzLnVwZGF0ZUNhbGVuZGFycygpO1xuICAgIH1cblxuICAgIHVwZGF0ZU1vbnRoc0luVmlldygpIHtcbiAgICAgICAgaWYgKHRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgLy8gaWYgYm90aCBkYXRlcyBhcmUgdmlzaWJsZSBhbHJlYWR5LCBkbyBub3RoaW5nXG4gICAgICAgICAgICBpZiAoIXRoaXMuc2luZ2xlRGF0ZVBpY2tlciAmJiB0aGlzLmxlZnRDYWxlbmRhci5tb250aCAmJiB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGggJiZcbiAgICAgICAgICAgICAgICAoKHRoaXMuc3RhcnREYXRlICYmIHRoaXMubGVmdENhbGVuZGFyICYmIHRoaXMuc3RhcnREYXRlLmZvcm1hdCgnWVlZWS1NTScpID09PSB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5mb3JtYXQoJ1lZWVktTU0nKSkgfHxcbiAgICAgICAgICAgICAgICAodGhpcy5zdGFydERhdGUgJiYgdGhpcy5yaWdodENhbGVuZGFyICYmIHRoaXMuc3RhcnREYXRlLmZvcm1hdCgnWVlZWS1NTScpID09PSB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGguZm9ybWF0KCdZWVlZLU1NJykpKVxuICAgICAgICAgICAgICAgICYmXG4gICAgICAgICAgICAgICAgKHRoaXMuZW5kRGF0ZS5mb3JtYXQoJ1lZWVktTU0nKSA9PT0gdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGguZm9ybWF0KCdZWVlZLU1NJykgfHxcbiAgICAgICAgICAgICAgICB0aGlzLmVuZERhdGUuZm9ybWF0KCdZWVlZLU1NJykgPT09IHRoaXMucmlnaHRDYWxlbmRhci5tb250aC5mb3JtYXQoJ1lZWVktTU0nKSlcbiAgICAgICAgICAgICAgICApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5zdGFydERhdGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCkuZGF0ZSgyKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRoaXMubGlua2VkQ2FsZW5kYXJzICYmICh0aGlzLmVuZERhdGUubW9udGgoKSAhPT0gdGhpcy5zdGFydERhdGUubW9udGgoKSB8fFxuICAgICAgICAgICAgICAgICAgICB0aGlzLmVuZERhdGUueWVhcigpICE9PSB0aGlzLnN0YXJ0RGF0ZS55ZWFyKCkpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aCA9IHRoaXMuZW5kRGF0ZS5jbG9uZSgpLmRhdGUoMik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCkuZGF0ZSgyKS5hZGQoMSwgJ21vbnRoJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAodGhpcy5sZWZ0Q2FsZW5kYXIubW9udGguZm9ybWF0KCdZWVlZLU1NJykgIT09IHRoaXMuc3RhcnREYXRlLmZvcm1hdCgnWVlZWS1NTScpICYmXG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGguZm9ybWF0KCdZWVlZLU1NJykgIT09IHRoaXMuc3RhcnREYXRlLmZvcm1hdCgnWVlZWS1NTScpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGggPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpLmRhdGUoMik7XG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKS5kYXRlKDIpLmFkZCgxLCAnbW9udGgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5tYXhEYXRlICYmIHRoaXMubGlua2VkQ2FsZW5kYXJzICYmICF0aGlzLnNpbmdsZURhdGVQaWNrZXIgJiYgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoID4gdGhpcy5tYXhEYXRlKSB7XG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGggPSB0aGlzLm1heERhdGUuY2xvbmUoKS5kYXRlKDIpO1xuICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGggPSB0aGlzLm1heERhdGUuY2xvbmUoKS5kYXRlKDIpLnN1YnRyYWN0KDEsICdtb250aCcpO1xuICAgICAgICB9XG4gICAgfVxuICAgIC8qKlxuICAgICAqICBUaGlzIGlzIHJlc3BvbnNpYmxlIGZvciB1cGRhdGluZyB0aGUgY2FsZW5kYXJzXG4gICAgICovXG4gICAgdXBkYXRlQ2FsZW5kYXJzKCkge1xuICAgICAgICB0aGlzLnJlbmRlckNhbGVuZGFyKFNpZGVFbnVtLmxlZnQpO1xuICAgICAgICB0aGlzLnJlbmRlckNhbGVuZGFyKFNpZGVFbnVtLnJpZ2h0KTtcblxuICAgICAgICBpZiAodGhpcy5lbmREYXRlID09PSBudWxsKSB7IHJldHVybjsgfVxuICAgICAgICB0aGlzLmNhbGN1bGF0ZUNob3NlbkxhYmVsKCk7XG4gICAgfVxuICAgIHVwZGF0ZUVsZW1lbnQoKSB7XG4gICAgICAgIGlmICghdGhpcy5zaW5nbGVEYXRlUGlja2VyICYmIHRoaXMuYXV0b1VwZGF0ZUlucHV0KSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zdGFydERhdGUgJiYgdGhpcy5lbmREYXRlKSB7XG4gICAgICAgICAgICAgICAgLy8gaWYgd2UgdXNlIHJhbmdlcyBhbmQgc2hvdWxkIHNob3cgcmFuZ2UgbGFiZWwgb24gaW5wdVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLnJhbmdlc0FycmF5Lmxlbmd0aCAmJiB0aGlzLnNob3dSYW5nZUxhYmVsT25JbnB1dCA9PT0gdHJ1ZSAmJiB0aGlzLmNob3NlblJhbmdlICYmXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubG9jYWxlLmN1c3RvbVJhbmdlTGFiZWwgIT09IHRoaXMuY2hvc2VuUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5MYWJlbCA9IHRoaXMuY2hvc2VuUmFuZ2U7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5MYWJlbCA9IHRoaXMuc3RhcnREYXRlLmZvcm1hdCh0aGlzLmxvY2FsZS5mb3JtYXQpICtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sb2NhbGUuc2VwYXJhdG9yICsgdGhpcy5lbmREYXRlLmZvcm1hdCh0aGlzLmxvY2FsZS5mb3JtYXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICggdGhpcy5hdXRvVXBkYXRlSW5wdXQpIHtcbiAgICAgICAgICAgIHRoaXMuY2hvc2VuTGFiZWwgPSB0aGlzLnN0YXJ0RGF0ZS5mb3JtYXQodGhpcy5sb2NhbGUuZm9ybWF0KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbW92ZSgpIHtcbiAgICAgICAgdGhpcy5pc1Nob3duID0gZmFsc2U7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIHRoaXMgc2hvdWxkIGNhbGN1bGF0ZSB0aGUgbGFiZWxcbiAgICAgKi9cbiAgICBjYWxjdWxhdGVDaG9zZW5MYWJlbCAoKSB7XG4gICAgICAgIGlmICghdGhpcy5sb2NhbGUgfHwgIXRoaXMubG9jYWxlLnNlcGFyYXRvcikge1xuICAgICAgICAgICAgdGhpcy5fYnVpbGRMb2NhbGUoKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgY3VzdG9tUmFuZ2UgPSB0cnVlO1xuICAgICAgICBsZXQgaSA9IDA7XG4gICAgICAgIGlmICh0aGlzLnJhbmdlc0FycmF5Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGZvciAoY29uc3QgcmFuZ2UgaW4gdGhpcy5yYW5nZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBmb3JtYXQgPSB0aGlzLnRpbWVQaWNrZXJTZWNvbmRzID8gXCJZWVlZLU1NLUREIEhIOm1tOnNzXCIgOiBcIllZWVktTU0tREQgSEg6bW1cIjtcbiAgICAgICAgICAgICAgICAgICAgLy9pZ25vcmUgdGltZXMgd2hlbiBjb21wYXJpbmcgZGF0ZXMgaWYgdGltZSBwaWNrZXIgc2Vjb25kcyBpcyBub3QgZW5hYmxlZFxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGFydERhdGUuZm9ybWF0KGZvcm1hdCkgPT0gdGhpcy5yYW5nZXNbcmFuZ2VdWzBdLmZvcm1hdChmb3JtYXQpICYmIHRoaXMuZW5kRGF0ZS5mb3JtYXQoZm9ybWF0KSA9PSB0aGlzLnJhbmdlc1tyYW5nZV1bMV0uZm9ybWF0KGZvcm1hdCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVJhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNob3NlblJhbmdlID0gdGhpcy5yYW5nZXNBcnJheVtpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgLy9pZ25vcmUgdGltZXMgd2hlbiBjb21wYXJpbmcgZGF0ZXMgaWYgdGltZSBwaWNrZXIgaXMgbm90IGVuYWJsZWRcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRoaXMuc3RhcnREYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpID09IHRoaXMucmFuZ2VzW3JhbmdlXVswXS5mb3JtYXQoJ1lZWVktTU0tREQnKSAmJiB0aGlzLmVuZERhdGUuZm9ybWF0KCdZWVlZLU1NLUREJykgPT0gdGhpcy5yYW5nZXNbcmFuZ2VdWzFdLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdXN0b21SYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jaG9zZW5SYW5nZSA9IHRoaXMucmFuZ2VzQXJyYXlbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjdXN0b21SYW5nZSkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNob3dDdXN0b21SYW5nZUxhYmVsKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hvc2VuUmFuZ2UgPSB0aGlzLmxvY2FsZS5jdXN0b21SYW5nZUxhYmVsO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2hvc2VuUmFuZ2UgPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBpZiBjdXN0b20gbGFiZWw6IHNob3cgY2FsZW5hclxuICAgICAgICAgICAgICAgIHRoaXMuc2hvd0NhbEluUmFuZ2VzID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMudXBkYXRlRWxlbWVudCgpO1xuICAgIH1cblxuICAgIGNsaWNrQXBwbHkoZT8pIHtcbiAgICAgICAgaWYgKCF0aGlzLnNpbmdsZURhdGVQaWNrZXIgJiYgdGhpcy5zdGFydERhdGUgJiYgIXRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKTtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQ2hvc2VuTGFiZWwoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0ludmFsaWREYXRlICYmIHRoaXMuc3RhcnREYXRlICYmIHRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgLy8gZ2V0IGlmIHRoZXJlIGFyZSBpbnZhbGlkIGRhdGUgYmV0d2VlbiByYW5nZVxuICAgICAgICAgICAgbGV0IGQgPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgd2hpbGUoZC5pc0JlZm9yZSh0aGlzLmVuZERhdGUpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNJbnZhbGlkRGF0ZShkKSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmVuZERhdGUgPSBkLnN1YnRyYWN0KDEsICdkYXlzJyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQ2hvc2VuTGFiZWwoKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGQuYWRkKDEsICdkYXlzJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hvc2VuTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMuY2hvb3NlZERhdGUuZW1pdCh7Y2hvc2VuTGFiZWw6IHRoaXMuY2hvc2VuTGFiZWwsIHN0YXJ0RGF0ZTogdGhpcy5zdGFydERhdGUsIGVuZERhdGU6IHRoaXMuZW5kRGF0ZX0pO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5kYXRlc1VwZGF0ZWQuZW1pdCh7c3RhcnREYXRlOiB0aGlzLnN0YXJ0RGF0ZSwgZW5kRGF0ZTogdGhpcy5lbmREYXRlfSk7XG4gICAgICAgIHRoaXMuaGlkZSgpO1xuICAgIH1cblxuICAgIGNsaWNrQ2FuY2VsKGUpIHtcbiAgICAgICAgdGhpcy5zdGFydERhdGUgPSB0aGlzLl9vbGQuc3RhcnQ7XG4gICAgICAgIHRoaXMuZW5kRGF0ZSA9IHRoaXMuX29sZC5lbmQ7XG4gICAgICAgIGlmKHRoaXMuaW5saW5lKSB7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZVZpZXcoKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmhpZGUoKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogY2FsbGVkIHdoZW4gbW9udGggaXMgY2hhbmdlZFxuICAgICAqIEBwYXJhbSBtb250aEV2ZW50IGdldCB2YWx1ZSBpbiBldmVudC50YXJnZXQudmFsdWVcbiAgICAgKiBAcGFyYW0gc2lkZSBsZWZ0IG9yIHJpZ2h0XG4gICAgICovXG4gICAgbW9udGhDaGFuZ2VkKG1vbnRoRXZlbnQ6IGFueSwgc2lkZTogU2lkZUVudW0pIHtcbiAgICAgICAgY29uc3QgeWVhciA9IHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0uZHJvcGRvd25zLmN1cnJlbnRZZWFyO1xuICAgICAgICBjb25zdCBtb250aCA9IHBhcnNlSW50KG1vbnRoRXZlbnQudGFyZ2V0LnZhbHVlLCAxMCk7XG4gICAgICAgIHRoaXMubW9udGhPclllYXJDaGFuZ2VkKG1vbnRoLCB5ZWFyLCBzaWRlKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogY2FsbGVkIHdoZW4geWVhciBpcyBjaGFuZ2VkXG4gICAgICogQHBhcmFtIHllYXJFdmVudCBnZXQgdmFsdWUgaW4gZXZlbnQudGFyZ2V0LnZhbHVlXG4gICAgICogQHBhcmFtIHNpZGUgbGVmdCBvciByaWdodFxuICAgICAqL1xuICAgIHllYXJDaGFuZ2VkKHllYXJFdmVudDogYW55LCBzaWRlOiBTaWRlRW51bSkge1xuICAgICAgICBjb25zdCBtb250aCA9IHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0uZHJvcGRvd25zLmN1cnJlbnRNb250aDtcbiAgICAgICAgY29uc3QgeWVhciA9IHBhcnNlSW50KHllYXJFdmVudC50YXJnZXQudmFsdWUsIDEwKTtcbiAgICAgICAgdGhpcy5tb250aE9yWWVhckNoYW5nZWQobW9udGgsIHllYXIsIHNpZGUpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiBjYWxsZWQgd2hlbiB0aW1lIGlzIGNoYW5nZWRcbiAgICAgKiBAcGFyYW0gdGltZUV2ZW50ICBhbiBldmVudFxuICAgICAqIEBwYXJhbSBzaWRlIGxlZnQgb3IgcmlnaHRcbiAgICAgKi9cbiAgICB0aW1lQ2hhbmdlZCh0aW1lRXZlbnQ6IGFueSwgc2lkZTogU2lkZUVudW0pIHtcblxuICAgICAgICB2YXIgaG91ciA9IHBhcnNlSW50KHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZEhvdXIsIDEwKTtcbiAgICAgICAgdmFyIG1pbnV0ZSA9IHBhcnNlSW50KHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZE1pbnV0ZSwgMTApO1xuICAgICAgICB2YXIgc2Vjb25kID0gdGhpcy50aW1lUGlja2VyU2Vjb25kcyA/IHBhcnNlSW50KHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5zZWxlY3RlZFNlY29uZCwgMTApIDogMDtcblxuICAgICAgICBpZiAoIXRoaXMudGltZVBpY2tlcjI0SG91cikge1xuICAgICAgICAgICAgdmFyIGFtcG0gPSB0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uYW1wbU1vZGVsO1xuICAgICAgICAgICAgaWYgKGFtcG0gPT09ICdQTScgJiYgaG91ciA8IDEyKVxuICAgICAgICAgICAgICAgIGhvdXIgKz0gMTI7XG4gICAgICAgICAgICBpZiAoYW1wbSA9PT0gJ0FNJyAmJiBob3VyID09PSAxMilcbiAgICAgICAgICAgICAgICBob3VyID0gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzaWRlID09PSBTaWRlRW51bS5sZWZ0KSB7XG4gICAgICAgICAgICB2YXIgc3RhcnQgPSB0aGlzLnN0YXJ0RGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgc3RhcnQuaG91cihob3VyKTtcbiAgICAgICAgICAgIHN0YXJ0Lm1pbnV0ZShtaW51dGUpO1xuICAgICAgICAgICAgc3RhcnQuc2Vjb25kKHNlY29uZCk7XG4gICAgICAgICAgICB0aGlzLnNldFN0YXJ0RGF0ZShzdGFydCk7XG4gICAgICAgICAgICBpZiAodGhpcy5zaW5nbGVEYXRlUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gdGhpcy5zdGFydERhdGUuY2xvbmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5lbmREYXRlICYmIHRoaXMuZW5kRGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKSA9PSBzdGFydC5mb3JtYXQoJ1lZWVktTU0tREQnKSAmJiB0aGlzLmVuZERhdGUuaXNCZWZvcmUoc3RhcnQpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRFbmREYXRlKHN0YXJ0LmNsb25lKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgdmFyIGVuZCA9IHRoaXMuZW5kRGF0ZS5jbG9uZSgpO1xuICAgICAgICAgICAgZW5kLmhvdXIoaG91cik7XG4gICAgICAgICAgICBlbmQubWludXRlKG1pbnV0ZSk7XG4gICAgICAgICAgICBlbmQuc2Vjb25kKHNlY29uZCk7XG4gICAgICAgICAgICB0aGlzLnNldEVuZERhdGUoZW5kKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vdXBkYXRlIHRoZSBjYWxlbmRhcnMgc28gYWxsIGNsaWNrYWJsZSBkYXRlcyByZWZsZWN0IHRoZSBuZXcgdGltZSBjb21wb25lbnRcbiAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhcnMoKTtcblxuICAgICAgICAvL3JlLXJlbmRlciB0aGUgdGltZSBwaWNrZXJzIGJlY2F1c2UgY2hhbmdpbmcgb25lIHNlbGVjdGlvbiBjYW4gYWZmZWN0IHdoYXQncyBlbmFibGVkIGluIGFub3RoZXJcbiAgICAgICAgdGhpcy5yZW5kZXJUaW1lUGlja2VyKFNpZGVFbnVtLmxlZnQpO1xuICAgICAgICB0aGlzLnJlbmRlclRpbWVQaWNrZXIoU2lkZUVudW0ucmlnaHQpO1xuICAgIH1cbiAgICAvKipcbiAgICAgKiAgY2FsbCB3aGVuIG1vbnRoIG9yIHllYXIgY2hhbmdlZFxuICAgICAqIEBwYXJhbSBtb250aCBtb250aCBudW1iZXIgMCAtMTFcbiAgICAgKiBAcGFyYW0geWVhciB5ZWFyIGVnOiAxOTk1XG4gICAgICogQHBhcmFtIHNpZGUgbGVmdCBvciByaWdodFxuICAgICAqL1xuICAgIG1vbnRoT3JZZWFyQ2hhbmdlZChtb250aDogbnVtYmVyLCB5ZWFyOiBudW1iZXIsIHNpZGU6IFNpZGVFbnVtKSB7XG4gICAgICAgIGNvbnN0IGlzTGVmdCA9IHNpZGUgPT09IFNpZGVFbnVtLmxlZnQ7XG5cbiAgICAgICAgaWYgKCFpc0xlZnQpIHtcbiAgICAgICAgICAgIGlmICh5ZWFyIDwgdGhpcy5zdGFydERhdGUueWVhcigpIHx8ICh5ZWFyID09PSB0aGlzLnN0YXJ0RGF0ZS55ZWFyKCkgJiYgbW9udGggPCB0aGlzLnN0YXJ0RGF0ZS5tb250aCgpKSkge1xuICAgICAgICAgICAgICAgIG1vbnRoID0gdGhpcy5zdGFydERhdGUubW9udGgoKTtcbiAgICAgICAgICAgICAgICB5ZWFyID0gdGhpcy5zdGFydERhdGUueWVhcigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMubWluRGF0ZSkge1xuICAgICAgICAgICAgaWYgKHllYXIgPCB0aGlzLm1pbkRhdGUueWVhcigpIHx8ICh5ZWFyID09PSB0aGlzLm1pbkRhdGUueWVhcigpICYmIG1vbnRoIDwgdGhpcy5taW5EYXRlLm1vbnRoKCkpKSB7XG4gICAgICAgICAgICAgICAgbW9udGggPSB0aGlzLm1pbkRhdGUubW9udGgoKTtcbiAgICAgICAgICAgICAgICB5ZWFyID0gdGhpcy5taW5EYXRlLnllYXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLm1heERhdGUpIHtcbiAgICAgICAgICAgIGlmICh5ZWFyID4gdGhpcy5tYXhEYXRlLnllYXIoKSB8fCAoeWVhciA9PT0gdGhpcy5tYXhEYXRlLnllYXIoKSAmJiBtb250aCA+IHRoaXMubWF4RGF0ZS5tb250aCgpKSkge1xuICAgICAgICAgICAgICAgIG1vbnRoID0gdGhpcy5tYXhEYXRlLm1vbnRoKCk7XG4gICAgICAgICAgICAgICAgeWVhciA9IHRoaXMubWF4RGF0ZS55ZWFyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5kcm9wZG93bnMuY3VycmVudFllYXIgPSB5ZWFyO1xuICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLmRyb3Bkb3ducy5jdXJyZW50TW9udGggPSBtb250aDtcbiAgICAgICAgaWYgKGlzTGVmdCkge1xuICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGgubW9udGgobW9udGgpLnllYXIoeWVhcik7XG4gICAgICAgICAgICBpZiAodGhpcy5saW5rZWRDYWxlbmRhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGggPSB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5jbG9uZSgpLmFkZCgxLCAnbW9udGgnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aC5tb250aChtb250aCkueWVhcih5ZWFyKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmxpbmtlZENhbGVuZGFycykge1xuICAgICAgICAgICAgICAgIHRoaXMubGVmdENhbGVuZGFyLm1vbnRoID0gdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoLmNsb25lKCkuc3VidHJhY3QoMSwgJ21vbnRoJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy51cGRhdGVDYWxlbmRhcnMoKTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDbGljayBvbiBwcmV2aW91cyBtb250aFxuICAgICAqIEBwYXJhbSBzaWRlIGxlZnQgb3IgcmlnaHQgY2FsZW5kYXJcbiAgICAgKi9cbiAgICBjbGlja1ByZXYoc2lkZTogU2lkZUVudW0pIHtcbiAgICAgICAgaWYgKHNpZGUgPT09IFNpZGVFbnVtLmxlZnQpIHtcbiAgICAgICAgICAgIHRoaXMubGVmdENhbGVuZGFyLm1vbnRoLnN1YnRyYWN0KDEsICdtb250aCcpO1xuICAgICAgICAgICAgaWYgKHRoaXMubGlua2VkQ2FsZW5kYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoLnN1YnRyYWN0KDEsICdtb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5yaWdodENhbGVuZGFyLm1vbnRoLnN1YnRyYWN0KDEsICdtb250aCcpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIENsaWNrIG9uIG5leHQgbW9udGhcbiAgICAgKiBAcGFyYW0gc2lkZSBsZWZ0IG9yIHJpZ2h0IGNhbGVuZGFyXG4gICAgICovXG4gICAgY2xpY2tOZXh0KHNpZGU6IFNpZGVFbnVtKSB7XG4gICAgICAgIGlmIChzaWRlID09PSBTaWRlRW51bS5sZWZ0KSB7XG4gICAgICAgICAgICB0aGlzLmxlZnRDYWxlbmRhci5tb250aC5hZGQoMSwgJ21vbnRoJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGguYWRkKDEsICdtb250aCcpO1xuICAgICAgICAgICAgaWYgKHRoaXMubGlua2VkQ2FsZW5kYXJzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGguYWRkKDEsICdtb250aCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJzKCk7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFdoZW4gc2VsZWN0aW5nIGEgZGF0ZVxuICAgICAqIEBwYXJhbSBlIGV2ZW50OiBnZXQgdmFsdWUgYnkgZS50YXJnZXQudmFsdWVcbiAgICAgKiBAcGFyYW0gc2lkZSBsZWZ0IG9yIHJpZ2h0XG4gICAgICogQHBhcmFtIHJvdyByb3cgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgZGF0ZSBjbGlja2VkXG4gICAgICogQHBhcmFtIGNvbCBjb2wgcG9zaXRpb24gb2YgdGhlIGN1cnJlbnQgZGF0ZSBjbGlja2VkXG4gICAgICovXG4gICAgY2xpY2tEYXRlKGUsIHNpZGU6IFNpZGVFbnVtLCByb3c6IG51bWJlciwgY29sOiBudW1iZXIpIHtcbiAgICAgICAgaWYgKGUudGFyZ2V0LnRhZ05hbWUgPT09ICdURCcpIHtcbiAgICAgICAgICAgIGlmICghZS50YXJnZXQuY2xhc3NMaXN0LmNvbnRhaW5zKCdhdmFpbGFibGUnKSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChlLnRhcmdldC50YWdOYW1lID09PSAnU1BBTicpIHtcbiAgICAgICAgICAgIGlmICghZS50YXJnZXQucGFyZW50RWxlbWVudC5jbGFzc0xpc3QuY29udGFpbnMoJ2F2YWlsYWJsZScpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnJhbmdlc0FycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5jaG9zZW5SYW5nZSA9IHRoaXMubG9jYWxlLmN1c3RvbVJhbmdlTGFiZWw7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgZGF0ZSA9IHNpZGUgPT09ICBTaWRlRW51bS5sZWZ0ID8gdGhpcy5sZWZ0Q2FsZW5kYXIuY2FsZW5kYXJbcm93XVtjb2xdIDogdGhpcy5yaWdodENhbGVuZGFyLmNhbGVuZGFyW3Jvd11bY29sXTtcblxuICAgICAgICBpZiAodGhpcy5lbmREYXRlIHx8IGRhdGUuaXNCZWZvcmUodGhpcy5zdGFydERhdGUsICdkYXknKSkgeyAvLyBwaWNraW5nIHN0YXJ0XG4gICAgICAgICAgICBpZiAodGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgZGF0ZSA9IHRoaXMuX2dldERhdGVXaXRoVGltZShkYXRlLCBTaWRlRW51bS5sZWZ0KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMuc2V0U3RhcnREYXRlKGRhdGUuY2xvbmUoKSk7XG4gICAgICAgIH0gZWxzZSBpZiAoIXRoaXMuZW5kRGF0ZSAmJiBkYXRlLmlzQmVmb3JlKHRoaXMuc3RhcnREYXRlKSkge1xuICAgICAgICAgICAgLy8gc3BlY2lhbCBjYXNlOiBjbGlja2luZyB0aGUgc2FtZSBkYXRlIGZvciBzdGFydC9lbmQsXG4gICAgICAgICAgICAvLyBidXQgdGhlIHRpbWUgb2YgdGhlIGVuZCBkYXRlIGlzIGJlZm9yZSB0aGUgc3RhcnQgZGF0ZVxuICAgICAgICAgICAgdGhpcy5zZXRFbmREYXRlKHRoaXMuc3RhcnREYXRlLmNsb25lKCkpO1xuICAgICAgICB9IGVsc2UgeyAvLyBwaWNraW5nIGVuZFxuICAgICAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgICAgIGRhdGUgPSB0aGlzLl9nZXREYXRlV2l0aFRpbWUoZGF0ZSwgU2lkZUVudW0ucmlnaHQpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnNldEVuZERhdGUoZGF0ZS5jbG9uZSgpKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF1dG9BcHBseSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlQ2hvc2VuTGFiZWwoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrQXBwbHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLnNpbmdsZURhdGVQaWNrZXIpIHtcbiAgICAgICAgICAgIHRoaXMuc2V0RW5kRGF0ZSh0aGlzLnN0YXJ0RGF0ZSk7XG4gICAgICAgICAgICB0aGlzLnVwZGF0ZUVsZW1lbnQoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLmF1dG9BcHBseSkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2xpY2tBcHBseSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XG5cbiAgICAgICAgLy8gVGhpcyBpcyB0byBjYW5jZWwgdGhlIGJsdXIgZXZlbnQgaGFuZGxlciBpZiB0aGUgbW91c2Ugd2FzIGluIG9uZSBvZiB0aGUgaW5wdXRzXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG5cbiAgICB9XG4gICAgLyoqXG4gICAgICogIENsaWNrIG9uIHRoZSBjdXN0b20gcmFuZ2VcbiAgICAgKiBAcGFyYW0gZTogRXZlbnRcbiAgICAgKiBAcGFyYW0gbGFiZWxcbiAgICAgKi9cbiAgICBjbGlja1JhbmdlKGUsIGxhYmVsKSB7XG4gICAgICAgIHRoaXMuY2hvc2VuUmFuZ2UgPSBsYWJlbDtcbiAgICAgICAgaWYgKGxhYmVsID09IHRoaXMubG9jYWxlLmN1c3RvbVJhbmdlTGFiZWwpIHtcbiAgICAgICAgICAgIHRoaXMuaXNTaG93biAgPSB0cnVlOyAvLyBzaG93IGNhbGVuZGFyc1xuICAgICAgICAgICAgdGhpcy5zaG93Q2FsSW5SYW5nZXMgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdmFyIGRhdGVzID0gdGhpcy5yYW5nZXNbbGFiZWxdO1xuICAgICAgICAgICAgdGhpcy5zdGFydERhdGUgPSBkYXRlc1swXS5jbG9uZSgpO1xuICAgICAgICAgICAgdGhpcy5lbmREYXRlID0gZGF0ZXNbMV0uY2xvbmUoKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnNob3dSYW5nZUxhYmVsT25JbnB1dCAmJiBsYWJlbCAhPT0gdGhpcy5sb2NhbGUuY3VzdG9tUmFuZ2VMYWJlbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hvc2VuTGFiZWwgPSBsYWJlbDtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVDaG9zZW5MYWJlbCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5zaG93Q2FsSW5SYW5nZXMgPSAoIXRoaXMucmFuZ2VzQXJyYXkubGVuZ3RoKSB8fCB0aGlzLmFsd2F5c1Nob3dDYWxlbmRhcnM7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdGFydERhdGUuc3RhcnRPZignZGF5Jyk7XG4gICAgICAgICAgICAgICAgdGhpcy5lbmREYXRlLmVuZE9mKCdkYXknKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCF0aGlzLmFsd2F5c1Nob3dDYWxlbmRhcnMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlzU2hvd24gID0gZmFsc2U7IC8vIGhpZGUgY2FsZW5kYXJzXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLnJhbmdlQ2xpY2tlZC5lbWl0KHtsYWJlbDogbGFiZWwsIGRhdGVzOiBkYXRlc30pO1xuICAgICAgICAgICAgaWYgKCF0aGlzLmtlZXBDYWxlbmRhck9wZW5pbmdXaXRoUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNsaWNrQXBwbHkoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGgubW9udGgoZGF0ZXNbMF0ubW9udGgoKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5sZWZ0Q2FsZW5kYXIubW9udGgueWVhcihkYXRlc1swXS55ZWFyKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMucmlnaHRDYWxlbmRhci5tb250aC5tb250aChkYXRlc1sxXS5tb250aCgpKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJpZ2h0Q2FsZW5kYXIubW9udGgueWVhcihkYXRlc1sxXS55ZWFyKCkpO1xuICAgICAgICAgICAgICAgIHRoaXMudXBkYXRlQ2FsZW5kYXJzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMudGltZVBpY2tlcikge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlclRpbWVQaWNrZXIoU2lkZUVudW0ubGVmdClcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJUaW1lUGlja2VyKFNpZGVFbnVtLnJpZ2h0KVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG4gICAgfTtcblxuXG5cbiAgICBzaG93KGU/KSB7XG4gICAgICAgIGlmICh0aGlzLmlzU2hvd24pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRoaXMuX29sZC5zdGFydCA9IHRoaXMuc3RhcnREYXRlLmNsb25lKCk7XG4gICAgICAgIHRoaXMuX29sZC5lbmQgPSB0aGlzLmVuZERhdGUuY2xvbmUoKTtcbiAgICAgICAgdGhpcy5pc1Nob3duID0gdHJ1ZTtcbiAgICAgICAgdGhpcy51cGRhdGVWaWV3KCk7XG4gICAgfVxuXG4gICAgaGlkZShlPykge1xuICAgICAgICBpZiAoIXRoaXMuaXNTaG93bikge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGluY29tcGxldGUgZGF0ZSBzZWxlY3Rpb24sIHJldmVydCB0byBsYXN0IHZhbHVlc1xuICAgICAgICBpZiAoIXRoaXMuZW5kRGF0ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX29sZC5zdGFydCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhcnREYXRlID0gdGhpcy5fb2xkLnN0YXJ0LmNsb25lKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGhpcy5fb2xkLmVuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZW5kRGF0ZSA9IHRoaXMuX29sZC5lbmQuY2xvbmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIGEgbmV3IGRhdGUgcmFuZ2Ugd2FzIHNlbGVjdGVkLCBpbnZva2UgdGhlIHVzZXIgY2FsbGJhY2sgZnVuY3Rpb25cbiAgICAgICAgaWYgKCF0aGlzLnN0YXJ0RGF0ZS5pc1NhbWUodGhpcy5fb2xkLnN0YXJ0KSB8fCAhdGhpcy5lbmREYXRlLmlzU2FtZSh0aGlzLl9vbGQuZW5kKSkge1xuICAgICAgICAgICAvLyB0aGlzLmNhbGxiYWNrKHRoaXMuc3RhcnREYXRlLCB0aGlzLmVuZERhdGUsIHRoaXMuY2hvc2VuTGFiZWwpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gaWYgcGlja2VyIGlzIGF0dGFjaGVkIHRvIGEgdGV4dCBpbnB1dCwgdXBkYXRlIGl0XG4gICAgICAgIHRoaXMudXBkYXRlRWxlbWVudCgpO1xuICAgICAgICB0aGlzLmlzU2hvd24gPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcmVmLmRldGVjdENoYW5nZXMoKTtcbiAgICAgICAgXG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogaGFuZGxlIGNsaWNrIG9uIGFsbCBlbGVtZW50IGluIHRoZSBjb21wb25lbnQsIHVzZWZ1bGwgZm9yIG91dHNpZGUgb2YgY2xpY2tcbiAgICAgKiBAcGFyYW0gZSBldmVudFxuICAgICAqL1xuICAgIGhhbmRsZUludGVybmFsQ2xpY2soZSkge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpXG4gICAgfVxuICAgIC8qKlxuICAgICAqIHVwZGF0ZSB0aGUgbG9jYWxlIG9wdGlvbnNcbiAgICAgKiBAcGFyYW0gbG9jYWxlXG4gICAgICovXG4gICAgdXBkYXRlTG9jYWxlKGxvY2FsZSkge1xuICAgICAgICBmb3IgKGNvbnN0IGtleSBpbiBsb2NhbGUpIHtcbiAgICAgICAgICBpZiAobG9jYWxlLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgIHRoaXMubG9jYWxlW2tleV0gPSBsb2NhbGVba2V5XTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgLyoqXG4gICAgICogIGNsZWFyIHRoZSBkYXRlcmFuZ2UgcGlja2VyXG4gICAgICovXG4gICAgY2xlYXIoKSB7XG4gICAgICAgIHRoaXMuc3RhcnREYXRlID0gbW9tZW50KCkuc3RhcnRPZignZGF5Jyk7XG4gICAgICAgIHRoaXMuZW5kRGF0ZSA9IG1vbWVudCgpLmVuZE9mKCdkYXknKTtcbiAgICAgICAgdGhpcy5jaG9vc2VkRGF0ZS5lbWl0KHtjaG9zZW5MYWJlbDogJycsIHN0YXJ0RGF0ZTogbnVsbCwgZW5kRGF0ZTogbnVsbH0pO1xuICAgICAgICB0aGlzLmRhdGVzVXBkYXRlZC5lbWl0KHtzdGFydERhdGU6IG51bGwsIGVuZERhdGU6IG51bGx9KTtcbiAgICAgICAgdGhpcy5oaWRlKCk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogRmluZCBvdXQgaWYgdGhlIHNlbGVjdGVkIHJhbmdlIHNob3VsZCBiZSBkaXNhYmxlZCBpZiBpdCBkb2Vzbid0XG4gICAgICogZml0IGludG8gbWluRGF0ZSBhbmQgbWF4RGF0ZSBsaW1pdGF0aW9ucy5cbiAgICAgKi9cbiAgICBkaXNhYmxlUmFuZ2UocmFuZ2UpIHtcbiAgICAgIGlmIChyYW5nZSA9PT0gdGhpcy5sb2NhbGUuY3VzdG9tUmFuZ2VMYWJlbCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBjb25zdCByYW5nZU1hcmtlcnMgPSB0aGlzLnJhbmdlc1tyYW5nZV07XG4gICAgICBjb25zdCBhcmVCb3RoQmVmb3JlID0gcmFuZ2VNYXJrZXJzLmV2ZXJ5KCBkYXRlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1pbkRhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0ZS5pc0JlZm9yZSh0aGlzLm1pbkRhdGUpXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgYXJlQm90aEFmdGVyID0gcmFuZ2VNYXJrZXJzLmV2ZXJ5KCBkYXRlID0+IHtcbiAgICAgICAgaWYgKCF0aGlzLm1heERhdGUpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGF0ZS5pc0FmdGVyKHRoaXMubWF4RGF0ZSlcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIChhcmVCb3RoQmVmb3JlIHx8IGFyZUJvdGhBZnRlcik7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIFxuICAgICAqIEBwYXJhbSBkYXRlIHRoZSBkYXRlIHRvIGFkZCB0aW1lXG4gICAgICogQHBhcmFtIHNpZGUgbGVmdCBvciByaWdodFxuICAgICAqL1xuICAgIHByaXZhdGUgX2dldERhdGVXaXRoVGltZShkYXRlLCBzaWRlOiBTaWRlRW51bSk6IF9tb21lbnQuTW9tZW50IHtcbiAgICAgICAgbGV0IGhvdXIgPSBwYXJzZUludCh0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uc2VsZWN0ZWRIb3VyLCAxMCk7XG4gICAgICAgIGlmICghdGhpcy50aW1lUGlja2VyMjRIb3VyKSB7XG4gICAgICAgICAgICB2YXIgYW1wbSA9IHRoaXMudGltZXBpY2tlclZhcmlhYmxlc1tzaWRlXS5hbXBtTW9kZWw7XG4gICAgICAgICAgICBpZiAoYW1wbSA9PT0gJ1BNJyAmJiBob3VyIDwgMTIpXG4gICAgICAgICAgICAgICAgaG91ciArPSAxMjtcbiAgICAgICAgICAgIGlmIChhbXBtID09PSAnQU0nICYmIGhvdXIgPT09IDEyKVxuICAgICAgICAgICAgICAgIGhvdXIgPSAwO1xuICAgICAgICB9XG4gICAgICAgIHZhciBtaW51dGUgPSBwYXJzZUludCh0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uc2VsZWN0ZWRNaW51dGUsIDEwKTtcbiAgICAgICAgdmFyIHNlY29uZCA9IHRoaXMudGltZVBpY2tlclNlY29uZHMgPyBwYXJzZUludCh0aGlzLnRpbWVwaWNrZXJWYXJpYWJsZXNbc2lkZV0uc2VsZWN0ZWRTZWNvbmQsIDEwKSA6IDA7XG4gICAgICAgIHJldHVybiBkYXRlLmNsb25lKCkuaG91cihob3VyKS5taW51dGUobWludXRlKS5zZWNvbmQoc2Vjb25kKTtcbiAgICB9XG4gICAgLyoqXG4gICAgICogIGJ1aWxkIHRoZSBsb2NhbGUgY29uZmlnXG4gICAgICovXG4gICAgcHJpdmF0ZSBfYnVpbGRMb2NhbGUoKSB7XG4gICAgICAgIHRoaXMubG9jYWxlID0gey4uLnRoaXMuX2xvY2FsZVNlcnZpY2UuY29uZmlnLCAuLi50aGlzLmxvY2FsZX07XG4gICAgICAgICBpZiAoIXRoaXMubG9jYWxlLmZvcm1hdCkgeyBcbiAgICAgICAgICAgIGlmICh0aGlzLnRpbWVQaWNrZXIpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmxvY2FsZS5mb3JtYXQgPSBtb21lbnQubG9jYWxlRGF0YSgpLmxvbmdEYXRlRm9ybWF0KCdsbGwnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7IFxuICAgICAgICAgICAgICAgIHRoaXMubG9jYWxlLmZvcm1hdCA9IG1vbWVudC5sb2NhbGVEYXRhKCkubG9uZ0RhdGVGb3JtYXQoJ0wnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBwcml2YXRlIF9idWlsZENlbGxzKGNhbGVuZGFyLCBzaWRlOiBTaWRlRW51bSkge1xuICAgICAgICBmb3IgKGxldCByb3cgPSAwOyByb3cgPCA2OyByb3crKykge1xuICAgICAgICAgICAgdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5jbGFzc2VzW3Jvd10gPSB7fTtcbiAgICAgICAgICAgIGNvbnN0IHJvd0NsYXNzZXMgPSBbXTtcbiAgICAgICAgICAgIGlmKHRoaXMuZW1wdHlXZWVrUm93Q2xhc3MgJiYgIXRoaXMuaGFzQ3VycmVudE1vbnRoRGF5cyh0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLm1vbnRoLCBjYWxlbmRhcltyb3ddKSkge1xuICAgICAgICAgICAgICAgIHJvd0NsYXNzZXMucHVzaCh0aGlzLmVtcHR5V2Vla1Jvd0NsYXNzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZvciAobGV0IGNvbCA9IDA7IGNvbCA8IDc7IGNvbCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgY2xhc3NlcyA9IFtdO1xuICAgICAgICAgICAgICAgIC8vIGhpZ2hsaWdodCB0b2RheSdzIGRhdGVcbiAgICAgICAgICAgICAgICBpZiAoY2FsZW5kYXJbcm93XVtjb2xdLmlzU2FtZShuZXcgRGF0ZSgpLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCd0b2RheScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBoaWdobGlnaHQgd2Vla2VuZHNcbiAgICAgICAgICAgICAgICBpZiAoY2FsZW5kYXJbcm93XVtjb2xdLmlzb1dlZWtkYXkoKSA+IDUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCd3ZWVrZW5kJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGdyZXkgb3V0IHRoZSBkYXRlcyBpbiBvdGhlciBtb250aHMgZGlzcGxheWVkIGF0IGJlZ2lubmluZyBhbmQgZW5kIG9mIHRoaXMgY2FsZW5kYXJcbiAgICAgICAgICAgICAgICBpZiAoY2FsZW5kYXJbcm93XVtjb2xdLm1vbnRoKCkgIT09IGNhbGVuZGFyWzFdWzFdLm1vbnRoKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdvZmYnKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBtYXJrIHRoZSBsYXN0IGRheSBvZiB0aGUgcHJldmlvdXMgbW9udGggaW4gdGhpcyBjYWxlbmRhclxuICAgICAgICAgICAgICAgICAgICBpZih0aGlzLmxhc3REYXlPZlByZXZpb3VzTW9udGhDbGFzcyAmJiAoY2FsZW5kYXJbcm93XVtjb2xdLm1vbnRoKCkgPCBjYWxlbmRhclsxXVsxXS5tb250aCgpIHx8IGNhbGVuZGFyWzFdWzFdLm1vbnRoKCkgPT09IDApICYmIGNhbGVuZGFyW3Jvd11bY29sXS5kYXRlKCkgPT09IHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0uZGF5c0luTGFzdE1vbnRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2godGhpcy5sYXN0RGF5T2ZQcmV2aW91c01vbnRoQ2xhc3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gbWFyayB0aGUgZmlyc3QgZGF5IG9mIHRoZSBuZXh0IG1vbnRoIGluIHRoaXMgY2FsZW5kYXJcbiAgICAgICAgICAgICAgICAgICAgaWYodGhpcy5maXJzdERheU9mTmV4dE1vbnRoQ2xhc3MgJiYgKGNhbGVuZGFyW3Jvd11bY29sXS5tb250aCgpID4gY2FsZW5kYXJbMV1bMV0ubW9udGgoKSB8fCBjYWxlbmRhcltyb3ddW2NvbF0ubW9udGgoKSA9PT0gMCkgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmRhdGUoKSA9PT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHRoaXMuZmlyc3REYXlPZk5leHRNb250aENsYXNzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBtYXJrIHRoZSBmaXJzdCBkYXkgb2YgdGhlIGN1cnJlbnQgbW9udGggd2l0aCBhIGN1c3RvbSBjbGFzc1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZpcnN0TW9udGhEYXlDbGFzcyAmJiBjYWxlbmRhcltyb3ddW2NvbF0ubW9udGgoKSA9PT0gY2FsZW5kYXJbMV1bMV0ubW9udGgoKSAmJiBjYWxlbmRhcltyb3ddW2NvbF0uZGF0ZSgpID09PSBjYWxlbmRhci5maXJzdERheS5kYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKHRoaXMuZmlyc3RNb250aERheUNsYXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gbWFyayB0aGUgbGFzdCBkYXkgb2YgdGhlIGN1cnJlbnQgbW9udGggd2l0aCBhIGN1c3RvbSBjbGFzc1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RNb250aERheUNsYXNzICYmIGNhbGVuZGFyW3Jvd11bY29sXS5tb250aCgpID09PSBjYWxlbmRhclsxXVsxXS5tb250aCgpICYmIGNhbGVuZGFyW3Jvd11bY29sXS5kYXRlKCkgPT09IGNhbGVuZGFyLmxhc3REYXkuZGF0ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCh0aGlzLmxhc3RNb250aERheUNsYXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgc2VsZWN0aW9uIG9mIGRhdGVzIGJlZm9yZSB0aGUgbWluaW11bSBkYXRlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubWluRGF0ZSAmJiBjYWxlbmRhcltyb3ddW2NvbF0uaXNCZWZvcmUodGhpcy5taW5EYXRlLCAnZGF5JykpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdvZmYnLCAnZGlzYWJsZWQnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gZG9uJ3QgYWxsb3cgc2VsZWN0aW9uIG9mIGRhdGVzIGFmdGVyIHRoZSBtYXhpbXVtIGRhdGVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5tYXhEYXRlICYmIGNhbGVuZGFyW3Jvd11bY29sXS5pc0FmdGVyKHRoaXMuY2FsZW5kYXJWYXJpYWJsZXNbc2lkZV0ubWF4RGF0ZSwgJ2RheScpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnb2ZmJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGRvbid0IGFsbG93IHNlbGVjdGlvbiBvZiBkYXRlIGlmIGEgY3VzdG9tIGZ1bmN0aW9uIGRlY2lkZXMgaXQncyBpbnZhbGlkXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuaXNJbnZhbGlkRGF0ZShjYWxlbmRhcltyb3ddW2NvbF0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnb2ZmJywgJ2Rpc2FibGVkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhpZ2hsaWdodCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHN0YXJ0IGRhdGVcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zdGFydERhdGUgJiYgY2FsZW5kYXJbcm93XVtjb2xdLmZvcm1hdCgnWVlZWS1NTS1ERCcpID09PSB0aGlzLnN0YXJ0RGF0ZS5mb3JtYXQoJ1lZWVktTU0tREQnKSkge1xuICAgICAgICAgICAgICAgICAgICBjbGFzc2VzLnB1c2goJ2FjdGl2ZScsICdzdGFydC1kYXRlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhpZ2hsaWdodCB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGVuZCBkYXRlXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZW5kRGF0ZSAhPSBudWxsICYmIGNhbGVuZGFyW3Jvd11bY29sXS5mb3JtYXQoJ1lZWVktTU0tREQnKSA9PT0gdGhpcy5lbmREYXRlLmZvcm1hdCgnWVlZWS1NTS1ERCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaCgnYWN0aXZlJywgJ2VuZC1kYXRlJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIGhpZ2hsaWdodCBkYXRlcyBpbi1iZXR3ZWVuIHRoZSBzZWxlY3RlZCBkYXRlc1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmVuZERhdGUgIT0gbnVsbCAmJiBjYWxlbmRhcltyb3ddW2NvbF0gPiB0aGlzLnN0YXJ0RGF0ZSAmJiBjYWxlbmRhcltyb3ddW2NvbF0gPCB0aGlzLmVuZERhdGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xhc3Nlcy5wdXNoKCdpbi1yYW5nZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBhcHBseSBjdXN0b20gY2xhc3NlcyBmb3IgdGhpcyBkYXRlXG4gICAgICAgICAgICAgICAgY29uc3QgaXNDdXN0b20gPSB0aGlzLmlzQ3VzdG9tRGF0ZShjYWxlbmRhcltyb3ddW2NvbF0pO1xuICAgICAgICAgICAgICAgIGlmIChpc0N1c3RvbSAhPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpc0N1c3RvbSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzZXMucHVzaChpc0N1c3RvbSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBBcnJheS5wcm90b3R5cGUucHVzaC5hcHBseShjbGFzc2VzLCBpc0N1c3RvbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgLy8gc3RvcmUgY2xhc3NlcyB2YXJcbiAgICAgICAgICAgICAgICBsZXQgY25hbWUgPSAnJywgZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGNsYXNzZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgY25hbWUgKz0gY2xhc3Nlc1tpXSArICcgJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNsYXNzZXNbaV0gPT09ICdkaXNhYmxlZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoIWRpc2FibGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNuYW1lICs9ICdhdmFpbGFibGUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmNhbGVuZGFyVmFyaWFibGVzW3NpZGVdLmNsYXNzZXNbcm93XVtjb2xdID0gY25hbWUucmVwbGFjZSgvXlxccyt8XFxzKyQvZywgJycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5jYWxlbmRhclZhcmlhYmxlc1tzaWRlXS5jbGFzc2VzW3Jvd10uY2xhc3NMaXN0ID0gcm93Q2xhc3Nlcy5qb2luKCcgJyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kIG91dCBpZiB0aGUgY3VycmVudCBjYWxlbmRhciByb3cgaGFzIGN1cnJlbnQgbW9udGggZGF5c1xuICAgICAqIChhcyBvcHBvc2VkIHRvIGNvbnNpc3Rpbmcgb2Ygb25seSBwcmV2aW91cy9uZXh0IG1vbnRoIGRheXMpXG4gICAgICovXG4gICAgaGFzQ3VycmVudE1vbnRoRGF5cyhjdXJyZW50TW9udGgsIHJvdykge1xuICAgICAgICBmb3IgKGxldCBkYXkgPSAwOyBkYXkgPCA3OyBkYXkrKykge1xuICAgICAgICAgICAgaWYocm93W2RheV0ubW9udGgoKSA9PT0gY3VycmVudE1vbnRoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiJdfQ==