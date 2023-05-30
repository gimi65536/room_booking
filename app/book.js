'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
	IconButton,
	Paper,
	Stack,
	Table,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Tooltip
} from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SubdirectoryArrowRightIcon from '@mui/icons-material/SubdirectoryArrowRight';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-tw';
import localizeFormatPlugin from 'dayjs/plugin/localizedFormat';
import { getUTCDate } from './utcdate';
import { Seq } from 'immutable';

// Global initialization
dayjs.locale('zh-tw');
dayjs.extend(localizeFormatPlugin);

function giveBookUrl(eventID, date, position){
	return `https://host.cc.ntu.edu.tw/activities/placeApplyDetail.aspx?From=placeApply.aspx&Place_ID=${position.id}&Act_ID=${eventID}&Start=${position.start}&End=${position.end}&Date=${date.format('YYYY/M/D')}`;
}

export default function Book({ searchParams }){
	// Validation and sanitization
	const params = Object.assign({}, searchParams); // Shallow
	['title', 'eventID'].forEach((prop) => {
		if (!params.hasOwnProperty(prop)) {
			params[prop] = '';
		}else if(Array.isArray(params[prop])){
			const array = params[prop];
			if(array.length === 0){
				params[prop] = '';
			}else{
				params[prop] = array[0];
			}
		}
	});
	// Pack into ES6 objects
	const data = {
		title: params.title,
		eventID: params.eventID,
		dates: [],
		positions: []
	};
	// Unify these properties into array
	['dates', 'pName', 'pID', 'pStart', 'pEnd'].forEach((prop) => {
		if (!params.hasOwnProperty(prop)) {
			params[prop] = [];
		}else if(typeof params[prop] === 'string'){
			params[prop] = [params[prop]];
		}
	});
	const pn = params.pName.length;
	for (const prop of ['pID', 'pStart', 'pEnd']){
		if(params[prop].length !== pn){
			return <Error reason={`${prop}的長度不一樣！`} />;
		}
	}
	const dateAdded = new Set();
	for(const dateStr of params.dates){
		const date = dayjs.utc(dateStr);
		// "date" is for checking, and we still need getUTCDate(date) to receive a 00:00:00Z date
		if (date.isValid()){
			const utcdate = getUTCDate(date);
			if (!dateAdded.has(utcdate)){
				// date is unique
				data.dates.push(utcdate);
				dateAdded.add(utcdate);
			}
		}else{
			return <Error reason={`無法將${dateStr}理解成一個日期！`} />;
		}
	}
	for(const [name, id, start, end] of Seq(params.pName).zip(params.pID, params.pStart, params.pEnd)){
		data.positions.push({name, id, start, end});
	}
	return <BookTable data={data} />;
}

function BookTable({ data }){
	return (<div>
		<h1>{data.title}</h1>
		<h2>借場必勝祕笈</h2>
		<TableContainer component={Paper}>
			<Table stickyHeader>
				<TableHead>
					<TableRow>
						<TableCell></TableCell>
						{data.positions.map((p, index) => (
							<TableCell key={index}>
								<Stack>
									<p>{p.name}</p>
									<small>{`${p.start}～${p.end}`}</small>
								</Stack>
							</TableCell>
						))}
					</TableRow>
				</TableHead>
				<TableBody>
					{data.dates.map((date) => (
						<TableRow key={date.format('YYYY-MM-DD')}>
							<TableCell><Stack>
								<p>{date.format('ll')}</p>
								<small>{date.format('dddd')}</small>
							</Stack></TableCell>
							{data.positions.map((p, index) => {
								const url = giveBookUrl(data.eventID, date, p);
								return (<TableCell key={index}>
									<Tooltip title="複製">
										<IconButton
											onClick={() => { navigator.clipboard.writeText(url) }}
										>
											<ContentCopyIcon />
										</IconButton>
									</Tooltip>
									<Link href={url} rel="noopener noreferrer" target="_blank">
										<Tooltip title="前往">
											<IconButton>
												<SubdirectoryArrowRightIcon />
											</IconButton>
										</Tooltip>
									</Link>
								</TableCell>);
							})}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</div>);
}

function Error({ reason, seconds = 5 }){
	// This component should not be triggered if the address comes from the generator.
	const router = useRouter();
	const [counter, setCounter] = useState(seconds);

	useEffect(() => {
		if(counter === 0){
			router.push('/');
		}
		const timer = setInterval(() => {
			setCounter(counter > 0 ? counter - 1 : 0);
		}, 1000);
		return () => clearInterval(timer);
	});
	return (
		<div>
			<p>{reason}</p>
			<div>
				在{counter}秒後返回……
				<CircularProgressWithLabel value={counter} maxValue={seconds} />
			</div>
		</div>
	);
}

function CircularProgressWithLabel({value, maxValue}) {
	return (
		<Box sx={{ position: 'relative', display: 'inline-flex' }}>
			<CircularProgress variant="determinate" value={Math.round(value / maxValue * 100)} />
			<Box
				sx={{
					top: 0,
					left: 0,
					bottom: 0,
					right: 0,
					position: 'absolute',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<Typography variant="caption" component="div" color="text.secondary">
					{value}
				</Typography>
			</Box>
		</Box>
	);
}