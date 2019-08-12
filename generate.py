from typing import List, Tuple, Set
from datetime import date, timedelta

mask = {0, 1, 2, 3, 4, 5, 6}

def give_newdate(l: List[Tuple[date, date]], weekday: Set[int], iso = True):
	sol = []
	if iso:
		weekday = {i - 1 for i in weekday}
	weekday = weekday & mask
	for start, end in l:
		n = (end - start).days
		start_weekday = start.weekday()
		pick = [i for i in range(n + 1) if (i + start_weekday) % 7 in weekday]
		pick_date = [start + timedelta(days = i) for i in pick]
		sol.extend(pick_date)
	return sol

def write_html(filename: str, title: str, event_ID: str, place_order: List[str], l: List[Tuple[date, date]], weekday: Set[int]):
	with open('template', 'r', newline = '', encoding = 'utf-8') as file:
		content = file.read()
	output = content.format(title = title, event_ID = event_ID, place_order = ', '.join(f"'{s}'" for s in place_order), 
		dates = ',\n\t\t\t'.join(f'new Date(Date.UTC({d.year}, {d.month - 1}, {d.day}))' for d in give_newdate(l, weekday)))
	with open(filename, 'w', newline = '\n', encoding = 'utf-8') as file:
		file.write(output)

if __name__ == '__main__':
	'''
	write_html: 呼叫一次，就會生成一個網頁
		filename: 網頁檔案名稱，對應到網址。如果檔名包含資料夾，注意要先創好資料夾
		title: 網頁標題
		event_ID: 活動ID
		place_order: 一個list，裡頭裝著由引號包著的教室名稱。教室名稱總覽在template.js的place_map變數中
		l: 一個list，list裡頭有若干個2-tuple，2-tuple裝著兩個日期，代表時間區間的開頭與結尾（閉區間，包含頭尾兩個日期）
			e.g. [(date(2019, 1, 1), date(2019, 6, 4))] 代表從2019年1月1日到2019年6月4日之間的日期之間挑日期
			     [(date(2019, 1, 1), date(2019, 3, 4)), (date(2019, 4, 1), date(2019, 6, 4))] 代表從2019/1/1~2019/3/4以及2019/4/1~2019/6/4這兩個區間內挑日期
		weekday: 一個set（用{}來包），代表要從日期區間之內挑出星期幾
			e.g. {1} 代表從日期區間內挑出星期一
			     {3, 5} 代表從日期區間內挑出星期三與星期五
			     星期日是7

	常例：
	write_html(
		filename = '107_4/chuangzuo.html',
		title = '創作組',
		event_ID = '98652',
		place_order = ['103', '104', '202'],
		l = [(date(2019, 4, 15), date(2019, 6, 23))],
		weekday = {5})

	write_html(
		filename = '107_4/qimosheda.html',
		title = '期末社大',
		event_ID = '98653',
		place_order = ['103', '104', '202'],
		l = [(date(2019, 6, 3), date(2019, 6, 14))],
		weekday = {1, 3})

	write_html(
		filename = '107_4/jiaoxue.html',
		title = '教學組',
		event_ID = '98655',
		place_order = ['103', '104', '202', '新生102', '新生103', '新生202', '新生203', '新生204', '新生302', '新生303', '新生304'],
		l = [(date(2019, 4, 22), date(2019, 6, 14))],
		weekday = {2})
	'''
	write_html(
		filename = '107_4/chuangzuo.html',
		title = '創作組',
		event_ID = '98652',
		place_order = ['103', '104', '202'],
		l = [(date(2019, 4, 15), date(2019, 6, 23))],
		weekday = {5})

	write_html(
		filename = '107_4/qimosheda.html',
		title = '期末社大',
		event_ID = '98653',
		place_order = ['103', '104', '202'],
		l = [(date(2019, 6, 3), date(2019, 6, 14))],
		weekday = {1, 3})

	write_html(
		filename = '107_4/jiaoxue.html',
		title = '教學組',
		event_ID = '98655',
		place_order = ['103', '104', '202', '新生102', '新生103', '新生202', '新生203', '新生204', '新生302', '新生303', '新生304'],
		l = [(date(2019, 4, 22), date(2019, 6, 14))],
		weekday = {2})