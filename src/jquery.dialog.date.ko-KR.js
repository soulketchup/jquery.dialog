(function (dialog) {
	if (!dialog) return;
	$.extend(true, dialog.defaultOption, {
		days: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
		shortdays: ['일', '월', '화', '수', '목', '금', '토'],
		format: {
			value: 'yyyy-mm-dd',
			header: 'yyyy년 m월',
			info: 'yyyy.m.d(w)',
			empty: '날짜를 선택하세요',
			emptyrange: '기간을 선택하세요',
			unit: '일'
		},
		button: {
			prev: '&lt;',
			next: '&gt;',
			go: '이동',
			today: '오늘',
			null: '다시',
			ok: '확인',
			cancel: '취소'
		}
	});
})(window.DateRangeDialog);