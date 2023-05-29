'use client';
import {
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	TextField,
	Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useCallback, useRef, useState } from 'react';
import { useImmer } from "use-immer";
import { enableMapSet } from "immer";
import SortedSet from "collections/sorted-set";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
// import utcPlugin from 'dayjs/plugin/utc';
// import localeDataPlugin from 'dayjs/plugin/localeData';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import Position from "@/position.json5";

// Global initialization
enableMapSet();
dayjs.locale('zh-tw');
// dayjs.extend(utcPlugin);
// dayjs.extend(localeDataPlugin);
dayjs.extend(isBetweenPlugin);

const dateIntervalHelp = '「日期一」與「日期二」之間符合「星期幾」的所有日子';

function MyDatePicker(params){
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
			<DatePicker {...params} />
		</LocalizationProvider>
	);
}

export default function Generator() {
	// If the types of the input value is trivial (i.e., string, boolean, etc.) then using refs
	// Otherwise (like Date/Moment/Dayjs), use states
	const titleRef = useRef(null);
	const idRef = useRef(null);
	const [position, updatePosition] = useImmer(Position);
	const [chosenPosition, updateChosenPosition] = useImmer(new Set()); // Array of indexes
	const [dates, setDates] = useState(new SortedSet()); // Set of dayjs (instead of Dates)
	const [date, setDate] = useState([dayjs(), dayjs()]);

	// Sub-form
	const newPositionRef = useRef({});
	const weekdayRef = useRef({});

	const handleTogglePosition = useCallback((index) => {
		if (chosenPosition.has(index)) {
			updateChosenPosition((draft) => { draft.delete(index) });
		} else {
			updateChosenPosition((draft) => { draft.add(index) });
		}
	}, [chosenPosition, updateChosenPosition]);

	const handleNewPosition = useCallback(() => {
		const newPosition = {
			name: newPositionRef.current.name.value,
			id: newPositionRef.current.id.value,
			start: newPositionRef.current.start.value,
			end: newPositionRef.current.end.value
		}
		newPositionRef.current.name.value = '';
		newPositionRef.current.id.value = '';
		newPositionRef.current.start.value = '';
		newPositionRef.current.end.value = '';

		updatePosition((draft) => { draft.push(newPosition) });
	}, [updatePosition])

	const handleDeleteDate = useCallback((date) => {
		if(dates.has(date)){
			const newDates = dates.clone();
			newDates.delete(date);
			setDates(newDates);
		}
	}, [dates]);

	const handleAddDate = useCallback((date) => {
		if(!dates.has(date)) {
			const newDates = dates.clone();
			newDates.push(date);
			setDates(newDates);
			console.log({
				date,
				dates,
				newDates
			})
		}
	}, [dates]);

	const handleDateInterval = useCallback((isAdd) => {
		// Pick interval
		let [start, end] = date;
		if(start > end){
			[start, end] = [end, start];
		}
		const chosenWeekday = [];
		for (const weekday in weekdayRef.current){
			if (weekdayRef.current[weekday].checked){
				chosenWeekday.push(weekday);
			}
		}
		if(chosenWeekday.length === 0){
			return;
		}
		// Pick corrent dates
		const datesAdded = [];
		let i = start;
		while(i <= end){
			for(const weekday of chosenWeekday){
				const dateAdded = i.day(weekday);
				if(dateAdded.isBetween(start, end, 'date', '[]')){
					datesAdded.push(dateAdded);
				}
			}
			i = i.add(1, 'week');
		}
		if(datesAdded.length === 0){
			return;
		}
		// Update state
		if(isAdd){
			// IMPORTANT. If we push in loop, we will get a set whose values are timestamps instead of dayjs objects!!!
			setDates(dates.union(datesAdded));
		} else {
			setDates(dates.difference(datesAdded));
		}
	}, [date, dates]);

	return (
		<>
			<h1>搶場祕笈生成器</h1>
			<h2>標題</h2>
			<TextField
				type="text"
				name="title"
				label="標題"
				placeholder="教學組 etc."
				required={true}
				inputRef={titleRef}
			/>
			<h2>活動ID</h2>
			<TextField
				type="text"
				name="eventID"
				label="活動ID"
				required={true}
				inputRef={idRef}
			/>
			<div>
				<h2>選擇場地與時間</h2>
				<List>
					{position.map((info, index) => {
						const labelID = `${info.name} from:${info.start} end:${info.end}`;
						const label = `${info.name}　代號：${info.id}　時段：${info.start}～${info.end}`;
						return (
							<ListItem
								key={index}
							>
								<ListItemButton onClick={() => handleTogglePosition(index)}>
									<ListItemIcon>
										<Checkbox
											checked={chosenPosition.has(index)}
											inputProps={{ 'aria-labelledby': labelID }}
										/>
									</ListItemIcon>
									<ListItemText id={labelID} primary={label} />
								</ListItemButton>
							</ListItem>
						);
					})}
				</List>
				<div>
					<TextField
						type="text"
						name="newPositionName"
						label="新場地名稱"
						inputRef={(ref) => { newPositionRef.current.name = ref }}
					/>
					<TextField
						type="text"
						name="newPositionID"
						label="新場地代號"
						inputRef={(ref) => { newPositionRef.current.id = ref }}
					/>
					<TextField
						type="text"
						name="newPositionStart"
						label="新場地開始時間"
						helperText="數字+半形冒號+數字"
						placeholder="18:00"
						inputRef={(ref) => { newPositionRef.current.start = ref }}
					/>
					<TextField
						type="text"
						name="newPositionEnd"
						label="新場地結束時間"
						helperText="數字+半形冒號+數字"
						placeholder="21:00"
						inputRef={(ref) => { newPositionRef.current.end = ref }}
					/>
					<IconButton
						color="primary"
						aria-label="Add a new position into the position list"
						onClick={handleNewPosition}
					>
						<AddIcon />
					</IconButton>
				</div>
			</div>
			<div>
				<h2>選擇日期</h2>
				<List>
					{dates.map((date) => {
						// const dateString = date.format("YYYY-MM-DD");
						const dateString = date.toString();
						return (
							<ListItem
								key={dateString}
								secondaryAction={
									<IconButton
										aria-label={`delete ${dateString}`}
										onClick={() => handleDeleteDate(date)}
									>
										<DeleteIcon />
									</IconButton>
								}
							>
								<ListItemText
									primary={date.toString()}
									secondary={date.toString()}
								/>
							</ListItem>
						);
					})}
				</List>
				<div>
					<div>
						<h3>日期一</h3>
						<MyDatePicker
							label="日期一"
							value={date[0]}
							onChange={(newDate) => { setDate([newDate, date[1]]); }}
						/>
					</div>
					<div>
						<h3>日期二</h3>
						<MyDatePicker
							label="日期二"
							value={date[1]}
							onChange={(newDate) => { setDate([date[0], newDate]); }}
						/>
					</div>
					<div>
						<h3>星期幾</h3>
						<FormGroup>
							{[0, 1, 2, 3, 4, 5, 6].map((weekday) => {
								return <FormControlLabel
									key={weekday}
									control={<Checkbox />}
									label={dayjs().day(weekday).format('dddd')}
									inputRef={(ref) => { weekdayRef.current[weekday] = ref; }}
								/>;
							})}
						</FormGroup>
					</div>
					<div>
						<div>
							<Button
								variant="contained"
								startIcon={<Filter1Icon />}
								onClick={() => handleAddDate(date[0])}
							>
								新增「日期一」
							</Button>
							<Button
								variant="contained"
								startIcon={<Filter2Icon />}
								onClick={() => handleAddDate(date[1])}
							>
								新增「日期二」
							</Button>
							<Button
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => handleDateInterval(true)}
							>
								新增日期區間
							</Button>
						</div>
						<div>
							<Button
								variant="contained"
								color="warning"
								startIcon={<Filter1Icon />}
								onClick={() => { handleDeleteDate(date[0]) }}
							>
								刪除「日期一」
							</Button>
							<Button
								variant="contained"
								color="warning"
								startIcon={<Filter2Icon />}
								onClick={() => { handleDeleteDate(date[1]) }}
							>
								刪除「日期二」
							</Button>
							<Button
								variant="contained"
								color="warning"
								startIcon={<DeleteIcon />}
								onClick={() => handleDateInterval(false)}
							>
								刪除日期區間
							</Button>
						</div>
						<Tooltip title={dateIntervalHelp}>
							<Button
								variant="contained"
								color="secondary"
								startIcon={<HelpOutlineIcon />}
								onClick={() => alert(dateIntervalHelp)}
							>
								何謂「日期區間」
							</Button>
						</Tooltip>
					</div>
				</div>
			</div>
		</>
	)
}
