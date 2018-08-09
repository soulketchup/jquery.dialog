(function ($) {

	DateValue = function (jsDate) {
		var value = (jsDate ? new Date(jsDate) : new Date());
		this.update = function (y, m, d) {
			value.setFullYear(y, m - 1, d);
			return this;
		};
		this.year = function (y) {
			if (y === undefined) return value.getFullYear();
			value.setFullYear(y);
			return this;
		};
		this.month = function (m) {
			if (m === undefined) return value.getMonth() + 1;
			value.setMonth(m - 1);
			return this;
		};
		this.date = function (d) {
			if (d === undefined) return value.getDate();
			value.setDate(d);
			return this;
		};
		this.weekday = function () {
			return value.getDay();
		};
		this.calendarMove = function (months) {
			var d = new Date(value);
			if ((months || 0) != 0) {
				months += 1;
				d.setMonth(d.getMonth() + months, 0);
				if (d.getDate() > value.getDate()) d.setDate(value.getDate());
			}
			return new DateValue(d);
		};
		this.calendarStart = function () {
			var d = new Date(value);
			d.setDate(1);
			d.setDate(1 - d.getDay());
			return new DateValue(d);
		};
		this.daysOfMonth = function () {
			return new Date(value.getFullYear(), value.getMonth() + 1, 0).getDate();
		};
		this.tick = function (tick) {
			if (tick === undefined) return parseInt((value.getTime() - DateValue.tickMargin) / DateValue.tickOffset, 10);
			value.setTime(tick * DateValue.tickOffset + DateValue.tickMargin);
			return this;
		};
		this.value = function (newDate) {
			if (newDate === undefined) return value;
			value = new Date(newDate);
			return this;
		};
		this.dateAdd = function (y, m, d) {
			return this.update(value.getFullYear() + y, value.getMonth() + m + 1, value.getDate() + d);
		};
		this.copy = function () {
			return new DateValue(new Date(value));
		};
		this.parse = function (date) {
			if (date) {
				if (typeof (date) == 'string') {
					date = $.trim(date);
					var y, m, d;
					if (/^(\d{2}|\d{4})(\d{2})(\d{2})($|[^\d])/.test(date)) {
						var y = parseInt(RegExp.$1, 10), m = parseInt(RegExp.$2, 10), d = parseInt(RegExp.$3, 10);
					} else if (/^(\d{2}|\d{4})([^\d]+)(\d{1,2})([^\d]+)(\d{1,2})/.test(date)) {
						var y = parseInt(RegExp.$1, 10), m = parseInt(RegExp.$3, 10), d = parseInt(RegExp.$5, 10);
					} else if (/^today/i.test(date)) {
						var now = new Date(), match, reg = new RegExp('([+\\-\\!])(\\d+)([ymd])', 'ig');
						y = now.getFullYear(), m = now.getMonth() + 1, d = now.getDate();
						while ((match = reg.exec(date)) !== null) {
							switch (match[3].toLowerCase()) {
								case 'y': y = (match[1] == '!' ? ~~match[2] : y + ~~(match[1] + match[2])); break;
								case 'm': m = (match[1] == '!' ? ~~match[2] : m + ~~(match[1] + match[2])); break;
								case 'd': d = (match[1] == '!' ? ~~match[2] : d + ~~(match[1] + match[2])); break;
							}
						}
						this.update(y, m, d);
						return true;
					} else {
						return false;
					}
					if (RegExp.$1.length == 2) {
						if (y < 50) {
							y += (new Date().getFullYear() / 100).toFixed(0) * 100;
						} else {
							y += (new Date().getFullYear() / 100).toFixed(0) * 100 - 100;
						}
					}
					this.update(y, m, d);
					return true;
				}
				else if (date instanceof DateValue) {
					value.setTime(date.value().getTime());
					return true;
				}
				else if (date instanceof Date) {
					value.setTime(date.getTime());
					return true;
				}
			}
			return false;
		};
		this.format = function (format) {
			return format.replace(/yyyy|mm|dd|ww|yy|m|d|w|y/ig, function ($0) {
				switch ($0.toLowerCase()) {
					case 'yyyy': return ('0000' + value.getFullYear()).slice(-4);
					case 'yy': return ('00' + (value.getFullYear() % 100)).slice(-2);
					case 'y': return value.getFullYear();
					case 'mm': return ('0' + (value.getMonth() + 1)).slice(-2);
					case 'm': return (value.getMonth() + 1);
					case 'dd': return ('0' + value.getDate()).slice(-2);
					case 'd': return value.getDate();
					case 'ww': return DateRangeDialog.defaultOption.days[value.getDay()];
					case 'w': return DateRangeDialog.defaultOption.shortdays[value.getDay()];
				}
			});
		};
		this.toString = function () {
			return this.format('yyyy-mm-dd');
		};
	};
	DateValue.tickOffset = 1000 * 60 * 60 * 24;
	DateValue.tickMargin = new Date().getTimezoneOffset() * 1000 * 60;
	DateValue.from = function (dateExpr) {
		var t = new DateValue();
		if (t.parse(dateExpr)) return t;
		return (t = null);
	};

	DateRangeDialog = function () {

		var me = this;
		var valueDate1 = null;
		var valueDate2 = null;
		var viewDate = new DateValue();
		var handleHover = function (e) {
			if (!me.option.range || valueDate1 == null || valueDate2 != null) return;
			var target = $(this);
			var navInfo = me.control.find('.jq-dlg-date-info');
			var rangeStart = null, rangeEnd = null;
			if (e.type == 'mouseenter') {
				var ymd = [valueDate1.format('yyyymmdd'), target.find('button').attr('data-ymd')].sort();
				var ranges = [DateValue.from(ymd[0]), DateValue.from(ymd[1])];
				if (validate.apply(me, ranges) === false) return;
				target.closest('tbody').find('td').each(function (i, cell) {
					var self = $(cell), data = self.find('button').attr('data-ymd');
					if (data == ymd[0]) self.addClass('jq-dlg-range-start');
					if (data > ymd[0] && data < ymd[1]) self.addClass('jq-dlg-range-on');
					if (data == ymd[1]) return self.addClass('jq-dlg-range-end'), false;
				});
				rangeStart = ranges[0];
				rangeEnd = ranges[1];
			} else if (e.type == 'mouseleave') {
				rangeStart = valueDate1;
				target.closest('tbody').find('td').removeClass('jq-dlg-range-start jq-dlg-range-end jq-dlg-range-on');
			}
			var info = '';
			if (rangeStart) {
				info += rangeStart.format(me.option.format.info);
				if (rangeEnd && rangeStart.tick() != rangeEnd.tick()) {
					info += ' ~ ' + rangeEnd.format(me.option.format.info) + ' (' + (rangeEnd.tick() - rangeStart.tick() + 1) + me.option.format.unit + ')';
				}
			}
			navInfo.html(info || me.option.format.emptyrange);
		};
		var handleKey = function (e) {
			var target = $(e.target), keyCode = e.keyCode;
			if (keyCode == 13 && target.is('.jq-dlg-ym-input-y,.jq-dlg-ym-input-m')) {
				target.blur();
				me.control
					.find('.jq-dlg-ym-input-go').trigger('click').end()
					.find('.jq-dlg-ym').focus().end();
			}
		};
		var handleClick = function (e) {
			e.preventDefault();
			var target = $(e.target);
			if (target.is('.jq-dlg-set-prev')) {
				me.update(viewDate.calendarMove(-1));
			}
			else if (target.is('.jq-dlg-set-next')) {
				me.update(viewDate.calendarMove(1));
			}
			else if (target.is('.jq-dlg-set-today')) {
				me.value(new Date());
			}
			else if (target.is('.jq-dlg-set-null')) {
				me.value(null);
			}
			else if (target.is('.jq-dlg-set-ok')) {
				if (me.option.confirm && me.option.confirm.ok) me.option.confirm.ok.apply(me, me.option.range ? me.value() : [me.value()]);
			}
			else if (target.is('.jq-dlg-set-cancel')) {
				if (me.option.confirm && me.option.confirm.cancel) me.option.confirm.cancel.apply(me, me.option.range ? me.value() : [me.value()]);
			}
			else if (target.is('button[data-ymd]')) {
				if (me.option.range && valueDate1 && valueDate2 == null) {
					me.value(valueDate1, target.attr('data-ymd'));
				} else {
					me.value(target.attr('data-ymd'));
				}
			}
			else if (target.is('.jq-dlg-ym-input-go')) {
				var y = ~~me.control.find('input.jq-dlg-ym-input-y').val(), m = me.control.find('input.jq-dlg-ym-input-m').val();
				me.update(new DateValue().year(y).month(m).date(1));
			}
			else if (target.is('.jq-dlg-ym')) {
				if (me.control.find('.jq-dlg-ym-input').toggle().is(':visible')) {
					me.control.find('.jq-dlg-ym-input-y').select();
				}
			}
		};
		var periods = function (period) {
			var t = new DateValue();
			return $.map(period.split(','), function (token) {
				var token = $.trim(token);
				if (token.length == 0) return null;
				var tokens = token.split('~');
				if (tokens.length > 1) {
					return { 'start': t.parse(tokens[0]) ? t.tick() : Number.NEGATIVE_INFINITY, 'end': t.parse(tokens[1]) ? t.tick() : Number.POSITIVE_INFINITY };
				} else if (t.parse(token)) {
					return { 'start': t.tick(), 'end': t.tick() };
				} else {
					return null;
				}
			});
		};
		var uid = 'jq-dlg-date-' + new Date().getTime() + '-' + (Math.random() * 100000).toFixed(0);
		var validate = null;
		me.control = null;
		me.option = $.extend(true, {}, DateRangeDialog.defaultOption);
		me.validator = function () {
			if (me.option.validate) {
				if (typeof (me.option.validate) == 'function') return me.option.validate;
				var t = new DateValue();
				var day = (me.option.validate.day || '').replace(/[^0-6]+/g, '');
				var allow = $(periods(me.option.validate.allow || ''));
				var disallow = $(periods(me.option.validate.disallow || ''));
				var isRange = me.option.range;
				return (function (d1, d2) {
					if (isRange && d2) {
						var values = { start: d1.tick(), end: d2.tick() };
						if (day) {
							var w = d1.weekday();
							for (var i = 0; i < 7 && i <= values.end - values.start; i++) {
								if (day.indexOf((w + i) % 7) < 0) return false;
							}
						}
						if (allow.length && !allow.is(function (i, period) { return values.start >= period.start && values.end <= period.end; })) return false;
						if (disallow.length && disallow.is(function (i, period) { return values.end >= period.start && values.start <= period.end; })) return false;
					} else {
						if (day && day.indexOf(d1.weekday()) < 0) return false;
						var tick = d1.tick();
						if (allow.length && !allow.is(function (i, period) { return (tick >= period.start && tick <= period.end); })) return false;
						if (disallow.length && disallow.is(function (i, period) { return (tick >= period.start && tick <= period.end); })) return false;
					}
				});
			}
		};
		me.render = function ($elem, option) {
			if (!($elem instanceof jQuery)) $elem = $($elem);
			me.option = $.extend(true, {}, me.option, option);
			validate = me.validator();
			if (!(me.control instanceof jQuery)) {
				var html = [
					'<div id="' + uid + '" class="jq-dlg-date">',
					'<div class="jq-dlg-date-view">',
					'<div class="jq-dlg-date-header">',
					'<a href="#' + uid + '" class="jq-dlg-ym"></a>',
					'<button type="button" class="jq-dlg-set-prev">', me.option.button.prev, '</button>',
					'<button type="button" class="jq-dlg-set-next">', me.option.button.next, '</button>',
					'<div class="jq-dlg-ym-input">',
					'<input type="text" class="jq-dlg-ym-input-y" size="4" maxlength="4" pattern="[0-9]*"> / ',
					'<input type="text" class="jq-dlg-ym-input-m" size="2" maxlength="2" pattern="[0-9]*"> ',
					'<button type="button" class="jq-dlg-ym-input-go">' + me.option.button.go + '</button>',
					'</div>',
					'</div>'
				];
				html.push('<table><thead><tr>')
				for (var i = 0; i < 7; i++) {
					html.push('<th class="w' + i + '">', me.option.shortdays[i] || '', '</th>');
				}
				html.push(
					'</tr></thead>',
					'<tbody></tbody></table>',
					'<div class="jq-dlg-date-info"></div>',
					'<div class="jq-dlg-date-footer">&nbsp;'
				);
				if (me.option.button.today) html.push('<button type="button" class="jq-dlg-set-today">', me.option.button.today, '</button>');
				if (me.option.null && me.option.button.null) html.push('<button type="button" class="jq-dlg-set-null">', me.option.button.null, '</button>');
				if (me.option.confirm) {
					if (me.option.confirm.ok && me.option.button.ok) html.push('<button type="button" class="jq-dlg-set-ok">', me.option.button.ok, '</button>');
					if (me.option.confirm.cancel && me.option.button.cancel) html.push('<button type="button" class="jq-dlg-set-cancel">', me.option.button.cancel, '</button>');
				}
				html.push('</div></div></div>');
				me.control = $(html.join('')).on('click', 'button,a', handleClick).on('mouseenter mouseleave', 'td', handleHover).on('keypress', 'input', handleKey);
			}
			if ($elem.length) {
				me.control.appendTo($elem.eq(0));
			} else {
				me.control.detach();
			}
			return me.update();
		};
		me.value = function (start, end) {
			if (arguments.length == 0) {
				return me.option.range ? [valueDate1, valueDate2] : valueDate1;
			}
			var t1 = new DateValue(), t2 = null;
			if (!t1.parse(start)) {
				t1 = null;
			} else if (validate && validate.apply(me, [t1]) === false) {
				t1 = null
			}
			var values = [t1];
			if (me.option.range) {
				t2 = new DateValue();
				if (!t2.parse(end)) {
					t2 = null;
				} else if (validate && validate.apply(me, [t1, t2].sort(function (a, b) { return a.tick() - b.tick(); })) === false) {
					return me.value(t2);
				}
				if (t1 && t2 && t1.tick() > t2.tick()) {
					values = [t2, t1];
				} else {
					values.push(t2);
				}
			}
			if (me.option.beforeselect && me.option.beforeselect.apply(me, values) === false) return me;
			valueDate1 = values[0];
			valueDate2 = values[1];
			if (valueDate2 != null) {
				me.update();
			} else if (valueDate1 && me.control.is(':has(button[data-ymd="' + valueDate1.format('yyyymmdd') + '"])')) {
				me.update();
			} else {
				me.update(valueDate1);
			}
			if (me.option.onselect) {
				if (valueDate1) me.option.onselect.apply(this, [valueDate1, valueDate2]);
			}
			return me;
		};
		me.setOption = function (option) {
			me.option = $.extend(true, {}, me.option, option);
			validate = me.validator();
			return me.update();
		};
		me.update = function (date) {
			if (date && (newDate = DateValue.from(date))) {
				if (me.option.onchange && me.option.onchange.apply(me, [newDate]) === false) {
					me.control
						.find('.jq-dlg-ym-input-y').val(viewDate.year()).end()
						.find('.jq-dlg-ym-input-m').val(viewDate.month()).end()
						.find('.jq-dlg-ym-input').hide().end();
					return me;
				}
				viewDate = newDate;
			}
			var html = []
				, m = viewDate.month()
				, d = viewDate.calendarStart()
				, m2 = d.month()
				, today = new DateValue().tick()
				, tick = d.tick()
				, value1 = valueDate1 ? valueDate1.tick() : null
				, value2 = valueDate2 ? valueDate2.tick() : null;
			for (var i = 0; i < 6; i++) {
				html.push('<tr>');
				for (var j = 0; j < 7; j++) {
					var classList = 'w' + j;
					if (tick == today) classList += ' jq-dlg-today';
					if (tick == value1) {
						classList += ' jq-dlg-date-start';
						if (value2 == null) classList += ' jq-dlg-date-end';
					}
					if (tick == value2) {
						classList += ' jq-dlg-date-end';
					}
					if (me.option.range && value1 != null && value2 != null && tick > value1 && tick < value2) {
						classList += ' jq-dlg-date-on';
					}
					if (m != m2) classList += ' jq-dlg-other';
					if (me.option.range) classList += ' range';
					html.push(
						'<td class="' + classList + '">',
						'<button type="button" data-ymd="', d.format('yyyymmdd'), '"', (validate && validate.apply(me, [d]) === false ? ' disabled' : ''), '>', d.date(), '</button>',
						'</td>');
					d.tick(++tick);
					m2 = d.month();
				}
				html.push('</tr>');
				if (m != m2) break;
			}

			var info = '';
			if (valueDate1) {
				info += valueDate1.format(me.option.format.info);
				if (valueDate2 && valueDate1.tick() != valueDate2.tick()) {
					info += ' ~ ' + valueDate2.format(me.option.format.info) + ' (' + (valueDate2.tick() - valueDate1.tick() + 1) + me.option.format.unit + ')';
				}
			}

			if (me.control) {
				me.control
					.find('.jq-dlg-ym').html(viewDate.format(me.option.format.header || DateRangeDialog.defaultOption.format.header)).end()
					.find('.jq-dlg-ym-input-y').val(viewDate.year()).end()
					.find('.jq-dlg-ym-input-m').val(viewDate.month()).end()
					.find('.jq-dlg-ym-input').hide().end()
					.find('tbody').html(html.join('')).end()
					.find('.jq-dlg-date-info').html(info || (me.option.range ? me.option.format.emptyrange : me.option.format.empty)).end();
			}
			return me;
		};
		me.destroy = function () {
			if (me.control) me.control.off('click', 'button,a', handleClick).off('mouseenter mouseleave', 'td', handleHover).off('keypress', 'input', handleKey).remove();
			me.control = null;
			me = null;
		};
		me.formatValue = function (startValue, endValue, delim, suffix, valueFormat) {
			return (startValue ? (startValue.format(valueFormat || me.option.format.value) + (endValue && endValue.tick() != startValue.tick() ? (delim || ' ~ ') + endValue.format(valueFormat || me.option.format.value) + (suffix || '') : '')) : '');
		};
	};

	//default option
	DateRangeDialog.defaultOption = {
		'validate': {
			'day': '', /* ex) Sat+Sun - '60', Mon+Wed+Fri - '135', Fri+Sat+Sun - '560', All - '' */
			'allow': '', /* ex) today+3d~21000101 */
			'disallow': '' /* ex) ~20180101,20190101~,20180105 */
		},
		'format': {
			'value': 'mm/dd/yyyy',
			'header': 'm / yyyy',
			'info': 'mm/dd/yyyy',
			'empty': 'Choose date',
			'emptyrange': 'Choose dates',
			'unit': 'days'
		},
		'button': {
			'prev': '&lt;',
			'next': '&gt;',
			'go': 'Go',
			'today': 'Today',
			'null': 'Reset',
			'ok': 'Ok',
			'cancel': 'Cancel'
		},
		'range': true,
		'confirm': {
			'ok': function (dateValue1, dateValue2) { },
			'cancel': function (dateValue1, dateValue2) { }
		},
		'null': true,
		'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Sunday'],
		'shortdays': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
		'onchange': function (viewDate) { return true; },
		'beforeselect': function (dateValue1, dateValue2) { return true; },
		'onselect': function (dateValue1, dateValue2) { }
	};

	//modal datepicker
	$.calendarPicker = function (option) {
		var pickerOption = $.extend(true, {}, DateRangeDialog.defaultOption, option);
		var picker, _option, proxy;
		_option = $.extend(true, {}, pickerOption, {
			confirm: {
				ok: function (start, end) {
					if (pickerOption.confirm && pickerOption.confirm.ok) pickerOption.confirm.ok.apply(picker, [start, end]);
					if (proxy.ok) proxy.ok.apply(picker, [start, end]);
					picker.destroy();
				},
				cancel: function (start, end) {
					if (pickerOption.confirm && pickerOption.confirm.cancel) pickerOption.confirm.cancel.apply(picker, [start, end]);
					if (proxy.cancel) proxy.cancel.apply(picker, [start, end]);
					picker.destroy();
				}
			}
		});
		picker = new DateRangeDialog().render(document.body, _option);
		picker.control.addClass('dialog');
		proxy = {
			'then': function (okCallback, cancelCallback) {
				this.ok = okCallback;
				this.cancel = cancelCallback;
				return this;
			},
			'picker': picker
		};
		return proxy;
	};

	//input datepicker
	$.fn.calendarPicker = function (option) {

		var pickerOption;

		if (option === 'picker') {
			if (this.length > 1) {
				return this.map(function (i, elem) {
					return $(elem).data('calendar-picker');
				});
			}
			return this.eq(0).data('calendar-picker');
		}
		else if (option === 'option') {
			pickerOption = $.extend(true, {}, arguments[1]);
			this.each(function (i, elem) {
				var self = $(elem), dlg = self.data('calendar-picker'), newOption = $.extend(true, {}, self.data('calendar-picker-option'), pickerOption);
				self.data('calendar-picker-option', newOption);
				if (dlg) dlg.setOption(newOption);
			});
			return this;
		}
		else if (option === 'destroy') {
			this.each(function (i, elem) {
				$(elem)
					.off('focus keydown', $.fn.calendarPicker.handleEvent)
					.data('calendar-picker').destroy();
				})
				.data('calendar-picker', null)
				.data('calendar-picker-option', null);
			return this;
		}
		else if (option === 'preset') {
			pickerOption = $.extend(true, {}, DateRangeDialog.defaultOption);
			var preset = (arguments[1] || '');
			var match, regExp = /(single|auto)/ig;
			while ((match = regExp.exec(preset)) !== null) {
				switch (match[0].toLowerCase()) {
					case 'single':
						pickerOption.range = false;
						break;
					case 'auto':
						pickerOption.onselect = function (start, end, dlg) {
							this.value = dlg.formatValue(start, end);
							if (dlg.option.range) {
								if (end) dlg.render(null);
							} else if (start) {
								dlg.render(null);
							}
						};
						pickerOption.confirm.cancel = function (start, end, dlg) {
							this.value = '';
							dlg.render(null);
						};
						pickerOption.button.null = '';
						break;
				}
			}
		}
		else {
			pickerOption = $.extend(true, {}, DateRangeDialog.defaultOption, option)
		}

		//initialize picker holder and global event handler
		if (!($.fn.calendarPicker.holder)) {
			$.fn.calendarPicker.holder = $('<span class="jq-dlg-date-placeholder" />');
			$.fn.calendarPicker.current = null;
			$.fn.calendarPicker.handleEvent = function (e) {
				if (e.type == 'focus') {
					var dlg = $.data(this, 'calendar-picker'), _option = $.data(this, 'calendar-picker-option');
					var inputHeight = $(this).outerHeight();
					$.fn.calendarPicker.holder.insertBefore(this);
					$.fn.calendarPicker.current = dlg.render($.fn.calendarPicker.holder, _option);
					dlg.control.css({ top: inputHeight + 2, bottom: 'auto' });
				} else if (e.type == 'keydown') {
					if (e.keyCode == 9) {
						var dlg = $.data(this, 'calendarPicker')
						dlg.render(null);
						$.fn.calendarPicker.holder.detach();
					}
				}
			};
			$(document).on('mousedown', function (e) {
				if ($.contains(document, $.fn.calendarPicker.holder[0])) {
					var clicked = $(e.target);
					if (!clicked.is('span.jq-dlg-date-placeholder *') && !clicked.is(':focus')) {
						$.fn.calendarPicker.holder.detach();
						if ($.fn.calendarPicker.current) $.fn.calendarPicker.current.render(null);
					}
				}
			});
		}

		//initialize DateRangeDialog for each element
		var self = this;
		self.each(function (i, elem) {
			var _option = $.extend(true, {}, pickerOption, {
				confirm: {
					ok: function (start, end) {
						var dlg = $.data(elem, 'calendar-picker').render(null);
						elem.value = dlg.formatValue(start, end, ' ~ ');
						if (pickerOption.confirm.ok) pickerOption.confirm.ok.apply(elem, [start, end, dlg]);
					},
					cancel: function (start, end) {
						var dlg = $.data(elem, 'calendar-picker').render(null);
						$.fn.calendarPicker.holder.detach();
						if (pickerOption.confirm.cancel) pickerOption.confirm.cancel.apply(elem, [start, end, dlg]);
					}
				},
				onchange: function (viewDate) {
					if (pickerOption.onchange) return pickerOption.onchange.apply(elem, [viewDate, this]);
				},
				beforeselect: function (start, end) {
					if (pickerOption.beforeselect) return pickerOption.beforeselect.apply(elem, [start || null, end || null, this]);
				},
				onselect: function (start, end) {
					if (pickerOption.onselect) return pickerOption.onselect.apply(elem, [start, end, this]);
				}
			});

			var picker = self.eq(i).data('calendar-picker');
			if (!(picker instanceof DateRangeDialog)) {
				picker = new DateRangeDialog();
				picker.update(null, _option);
				self.eq(i)
					.data('calendar-picker', new DateRangeDialog())
					.on('focus keydown', $.fn.calendarPicker.handleEvent);
			}
			self.eq(i).data('calendar-picker-option', _option)
		});
		return self;
	};

})(window.jQuery);