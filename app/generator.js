'use client';
import Link from 'next/link';
import {
	Box,
	Button,
	Checkbox,
	FormControlLabel,
	FormGroup,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemSecondaryAction,
	ListItemText,
	Stack,
	TextField,
	Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { useCallback, useRef, useState } from 'react';
import { useImmer } from "use-immer";
import { OrderedSet } from 'immutable';
import SortedSet from "collections/sorted-set";
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import localizeFormatPlugin from 'dayjs/plugin/localizedFormat';
// import timezonePlugin from 'dayjs/plugin/timezone';
// import localeDataPlugin from 'dayjs/plugin/localeData';
import isBetweenPlugin from 'dayjs/plugin/isBetween';
import { getUTCDate } from './utcdate';
import Position from "@/position.json5";

// Global initialization
dayjs.locale('zh-tw');
dayjs.extend(localizeFormatPlugin);
// dayjs.extend(timezonePlugin);
// dayjs.extend(localeDataPlugin);
dayjs.extend(isBetweenPlugin);
// dayjs.tz.setDefault('Etc/UTC');

const dateIntervalHelp = '「日期一」與「日期二」之間符合「星期幾」的所有日子';

function MyDatePicker(params){
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="zh-tw">
			<DatePicker {...params} />
		</LocalizationProvider>
	);
}

function ButtonInDatePick({children, ...props}){
	return <Button sx={{m: 1}} {...props}>{children}</Button>;
}

export default function Generator({ bookUrl = '/' }) {
	// If the types of the input value is trivial (i.e., string, boolean, etc.) then using refs
	// Otherwise (like Date/Moment/Dayjs), use states
	const titleRef = useRef(null);
	const idRef = useRef(null);
	const [position, updatePosition] = useImmer(Position);
	const [chosenPosition, setChosenPosition] = useState(OrderedSet()); // Set of indexes
	const [dates, setDates] = useState(new SortedSet()); // Set of dayjs (instead of Dates) (UTC dates with 00:00:00)

	// Sub-form
	const newPositionRef = useRef({});
	const [date, setDate] = useState([getUTCDate(dayjs()), getUTCDate(dayjs())]); // Two UTC dates with 00:00:00
	const weekdayRef = useRef({});

	// Generated
	const [generated, updatedGenerated] = useImmer([]);

	const handleTogglePosition = useCallback((index) => {
		if (chosenPosition.has(index)) {
			setChosenPosition(chosenPosition.remove(index));
		} else {
			setChosenPosition(chosenPosition.add(index));
		}
	}, [chosenPosition, setChosenPosition]);

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

	// @pre: date is a UTC date
	const handleDeleteDate = useCallback((date) => {
		// Use SortedSet#clone will ruin data in the set.
		// Use constructClone or (union/difference) instead.
		if (dates.has(date)){
			setDates(dates.difference([date]));
		}
	}, [dates]);

	// @pre: date is a UTC date
	const handleAddDate = useCallback((date) => {
		if (!dates.has(date)){
			setDates(dates.union([date]));
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

	const handleGenerate = () => {
		updatedGenerated((draft) => {
			draft.push({
				title: titleRef.current.value,
				eventID: idRef.current.value.trim(),
				// Use toArray() for Immutable.OrderedSet to receive array instead of another OrderedSet.
				positions: chosenPosition.toArray().map((index) => position[index]),
				// Convert into YYYY-MM-DD to serialize
				dates: dates.map((date) => date.format('YYYY-MM-DD'))
			})
		});
	};

	return (
		<>
			<h1>搶場祕笈生成器</h1>
			<h2>標題</h2>
			<TextField
				type="text"
				name="title"
				label="標題"
				placeholder="教學組 etc."
				inputRef={titleRef}
			/>
			<h2>活動ID</h2>
			<TextField
				type="text"
				name="eventID"
				label="活動ID"
				inputRef={idRef}
			/>
			<Stack>
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
			</Stack>
			<Stack>
				<h2>選擇日期</h2>
				{dates.length > 0 ?
					<List>
						{dates.map((date) => {
							const dateString = date.format("YYYY-MM-DD");
							return (
								<ListItem
									key={dateString}
								>
									<ListItemText
										primary={date.format('ll')}
										secondary={date.format('dddd')}
									/>
									<ListItemSecondaryAction>
										<IconButton
											aria-label={`delete ${dateString}`}
											onClick={() => handleDeleteDate(date)}
										>
											<DeleteIcon />
										</IconButton>
									</ListItemSecondaryAction>
								</ListItem>
							);
						})}
					</List>
					: <Box sx={{ fontWeight: 'bold', color: 'red' }}><p>尚未選取任何日期</p></Box>
				}
				<div>
					<div>
						<h3>日期</h3>
						<MyDatePicker
							label="日期一"
							value={date[0]}
							onChange={(newDate) => { setDate([getUTCDate(newDate), date[1]]); }}
							slotProps={{
								textField: {
									helperText: '這是「日期一」',
								},
							}}
							sx={{ m: 1 }}
						/>
						<MyDatePicker
							label="日期二"
							value={date[1]}
							onChange={(newDate) => { setDate([date[0], getUTCDate(newDate)]); }}
							slotProps={{
								textField: {
									helperText: '這是「日期二」',
								},
							}}
							sx={{ m: 1 }}
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
							<ButtonInDatePick
								variant="contained"
								startIcon={<Filter1Icon />}
								onClick={() => handleAddDate(date[0])}
							>
								新增「日期一」
							</ButtonInDatePick>
							<ButtonInDatePick
								variant="contained"
								startIcon={<Filter2Icon />}
								onClick={() => handleAddDate(date[1])}
							>
								新增「日期二」
							</ButtonInDatePick>
							<ButtonInDatePick
								variant="contained"
								startIcon={<AddIcon />}
								onClick={() => handleDateInterval(true)}
							>
								新增日期區間
							</ButtonInDatePick>
						</div>
						<div>
							<ButtonInDatePick
								variant="contained"
								color="warning"
								startIcon={<Filter1Icon />}
								onClick={() => { handleDeleteDate(date[0]) }}
							>
								刪除「日期一」
							</ButtonInDatePick>
							<ButtonInDatePick
								variant="contained"
								color="warning"
								startIcon={<Filter2Icon />}
								onClick={() => { handleDeleteDate(date[1]) }}
							>
								刪除「日期二」
							</ButtonInDatePick>
							<ButtonInDatePick
								variant="contained"
								color="warning"
								startIcon={<DeleteIcon />}
								onClick={() => handleDateInterval(false)}
							>
								刪除日期區間
							</ButtonInDatePick>
						</div>
						<Tooltip title={dateIntervalHelp}>
							<ButtonInDatePick
								variant="contained"
								color="secondary"
								startIcon={<HelpOutlineIcon />}
								onClick={() => alert(dateIntervalHelp)}
							>
								何謂「日期區間」
							</ButtonInDatePick>
						</Tooltip>
					</div>
				</div>
			</Stack>
			<Stack sx={{ alignItems: "center" }}>
				<h2>祕笈生成</h2>
				<Button
					variant="contained"
					onClick={handleGenerate}
				>
					按此生成
				</Button>
				{generated.length > 0 ?
					<List>
						{generated.map((generatedObj, index) => {
							const positionsStr = generatedObj.positions.map((p) => p.name).join(',');
							const datesStr = generatedObj.dates.join(',');
							const params = new URLSearchParams();
							params.append('title', generatedObj.title);
							params.append('eventID', generatedObj.eventID);
							generatedObj.dates.forEach((date) => params.append('dates', date));
							// params.append('pn', generatedObj.positions.length);
							generatedObj.positions.forEach((p) => {
								params.append('pName', p.name);
								params.append('pID', p.id);
								params.append('pStart', p.start);
								params.append('pEnd', p.end);
							});
							const url = bookUrl + '?' + params.toString();

							const problems = [];
							if(generatedObj.eventID.length === 0){
								problems.push("活動代碼為空");
							}
							if(generatedObj.dates.length === 0){
								problems.push("日期為空，是否忘記點選「新增日期區間」？");
							}
							if(generatedObj.positions.length === 0) {
								problems.push("場地為空");
							}
							let secondary = `活動代碼${generatedObj.eventID} 場地[${positionsStr}] 日期[${datesStr}]`;
							if(problems.length > 0){
								secondary = (<div>
									<p>{secondary}</p>
									<Box sx={{ color: 'red' }}>
									{problems.map((problem, index) => (<p key={index}>{problem}</p>))}
									</Box>
								</div>);
							}
							return (
								<ListItem
									key={index}
								>
									<Tooltip title="點擊複製">
										<ListItemButton
											onClick={() => { navigator.clipboard.writeText(window.location.host + url) }}
										>
											<ListItemText
												primary={generatedObj.title ? generatedObj.title : "（無標題）"}
												secondary={secondary}
											/>
										</ListItemButton>
									</Tooltip>
									<ListItemSecondaryAction>
										<Link href={url} rel="noopener noreferrer" target="_blank">
											<Tooltip title="前往">
												<IconButton>
													<SubdirectoryArrowRightIcon />
												</IconButton>
											</Tooltip>
										</Link>
									</ListItemSecondaryAction>
								</ListItem>
							);
						})}
					</List>
					: <p>尚未生成任何祕笈</p>
				}
			</Stack>
		</>
	)
}
