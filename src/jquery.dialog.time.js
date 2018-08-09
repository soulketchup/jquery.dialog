var TimeDialog = function () {
	var TimeValue = function (h, m, s) {
		var hh = h || 0;
		var mm = m || 0;
		var ss = s || 0;

		this.update = function (h, m, s) {
			hh = h;
			mm = m;
			ss = s;
			if (ss > 60) mm += Math.floor(ss / 60), ss %= 60;
			if (mm > 60) hh += Math.floor(mm / 60), hh %= 60;
			return this;
		};
		this.update(hh, mm, ss);

		this.add = function (time) {
			this.update(hh + time.hours(), mm + time.minutes(), ss + time.seconds());
			return this;
		};
		this.sub = function (time) {
			this.update(hh - time.hours(), mm - time.minutes(), ss - time.seconds());
		};
		this.seconds = function () {
			if (arguments.length == 0) return ss;
			return this.update(hh, mm, ss + arguemnts[0]);
		};
		this.minutes = function () {
			if (arguments.length == 0) return mm;
			return this.update(hh, mm + arguments[0], ss);
		};
		this.hours = function () {
			if (arguments.length == 0) return hh;
			return this.update(hh + arguments[0], mm, ss);
		};
		this.tick = function () {
			return hh * 24 * 60 + mm * 60 + ss;
		};
		this.text = function () {
			var a = '';
			if (hh >= 21) a += '밤 ' + (hh % 12) + '시';
			else if (hh > 12) a += '오후 ' + (hh % 12) + '시';
			else if (hh == 12) a += '낮 12시';
			else if (hh > 5) a += '오전 ' + hh + '시';
			else if (hh > 0) a += '새벽 ' + hh + '시';
			else a += '밤 12시';

			if (mm == 0 && ss == 0) return a + ' 정각';
			a += ' ' + mm + '분';
			return a;
		};
		this.from = function (time) {
			this.parse(time);
			return this;
		};
		this.parse = function (time) {
			var h, m, s;
			if (typeof (time) === 'string') {
				if (/(^|[^\d])(\d{2})(\d{2})(\d{2})/.test(time)) {
					h = ~~RegExp.$2, m = ~~RegExp.$3, s = ~~RegExp.$4;
				} else if (/(^|[^\d])(\d{2})(\d{2})/.test(time)) {
					h = ~~RegExp.$2, m = ~~RegExp.$3, s = 0;
				} else if (/(^|[^\d])(\d{1,2})([^\d]+)(\d{1,2})([^\d]+)(\d{1,2})/.test(time)) {
					h = ~~RegExp.$2, m = ~~RegExp.$4, s = ~~RegExp.$6;
				} else if (/(^|[^\d])(\d{1,2})([^\d]+)(\d{1,2})/.test(time)) {
					h = ~~RegExp.$2, m = ~~RegExp.$4, s = 0;
				} else if (/(^|[^\d])(\d{1,2})($|[^\d]+)/.test(time)) {
					h = ~~RegExp.$2, m = 0, s = 0;
				} else {
					return false;
				}
				if (/(낮|오후|저녁|밤|[ap](?:\.)?m)/i.test(time)) {
					switch (RegExp.$1.toLowerCase()) {
						case '낮':
							if (h > 0 && h < 7) h += 12;
							break;
						case 'am', 'a.m':
							if (h == 12) h = 0;
							break;
						case '오후', 'pm', 'p.m':
							if (h == 0) h = 0;
							else if (h < 12) h += 12;
							break;
						case '저녁', '밤':
							if (h == 12) h = 0;
							else if (h > 7 && h < 12) h += 12;
							break;
					}
				}
				this.update(h, m, s);
				return true;
			}
			if ('constructor' in time) {
				if (time.constructor === TimeValue) {
					this.update(time.hours(), time.minutes(), time.seconds());
					return true;
				}
				if (time.constructor === Date) {
					this.update(time.getHours(), time.getMinutes(), time.getSeconds());
					return true;
				}
			}
			return false;
		};
		this.format = function (format) {
			return format.replace(/(HH|hh|H|h|mm|m|ss|s|A|a)/g, function ($0) {
				switch ($0) {
					case 'HH': return ('0' + (hh % 24)).slice(-2);
					case 'hh': return hh == 12 ? 12 : ('0' + (hh % 12)).slice(-2);
					case 'H': return hh % 24;
					case 'h': return hh == 12 ? 12 : hh % 12;
					case 'mm': return ('0' + (mm % 60)).slice(-2);
					case 'm': return mm % 60;
					case 'ss': return ('0' + (ss % 60)).slice(-2);
					case 's': return ss % 60;
					case 'a': return hh < 12 ? 'am' : 'pm';
					case 'A': return hh < 12 ? 'AM' : 'PM';
					default: return $0;
				}
			});
		};
		this.toString = function () {
			return this.format(this.hours() + ':mm:ss');
		};
	};

	var me = this;
	me.option = $.extend({}, TimeDialog.defaultOption);
	me.render = function ($elem, option) {
		dialogOption = $.extend({}, TimeDialog.defaultOption, option);
		$elem.html();
	};
	me.show = function (callback, option) {
		dialogOption = $.extend({}, TimeDialog.defaultOption, option);
		if (callback) {
			callback.apply(null, []);
		}
	};
	me.newTime = function (time) {
		var t = new TimeValue();
		if (!t.parse(time)) return null;
		return t;
	};
};
TimeDialog.defaultOption = {
	'duration': ['0~24'],
	'interval': '00:00:01'
};
