'use client';
import styles from './page.module.css'
import {
	Checkbox,
	IconButton,
	List,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
	TextField
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useCallback, useRef } from 'react';
import { useImmer } from "use-immer";
import { enableMapSet } from "immer"
import Position from "@/position.json5"

enableMapSet();

export default function Home() {
	const [position, updatePosition] = useImmer(Position);
	const [chosenPosition, updateChosenPosition] = useImmer(new Set()); // Array of indexes

	const newPositionNameRef = useRef(null);
	const newPositionIDRef = useRef(null);
	const newPositionStartRef = useRef(null);
	const newPositionEndRef = useRef(null);

	const handleTogglePosition = useCallback((index) => {
		if(chosenPosition.has(index)){
			updateChosenPosition((draft) => {draft.delete(index)});
		}else{
			updateChosenPosition((draft) => {draft.add(index)});
		}
	}, [chosenPosition, updateChosenPosition]);

	const handleNewPosition = useCallback(() => {
		const newPosition = {
			name: newPositionNameRef.current.value,
			id: newPositionIDRef.current.value,
			start: newPositionStartRef.current.value,
			end: newPositionEndRef.current.value
		}
		newPositionNameRef.current.value = '';
		newPositionIDRef.current.value = '';
		newPositionStartRef.current.value = '';
		newPositionEndRef.current.value = '';

		updatePosition((draft) => {draft.push(newPosition)});
	}, [updatePosition])

	return (
		<main className={styles.main}>
			<TextField
				type="text"
				name="title"
				label="標題"
				placeholder="教學組 etc."
				required={true}
			/>
			<TextField
				type="text"
				name="eventID"
				label="活動ID"
				required={true}
			/>
			<div>
				選擇場地與時間
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
						inputRef={newPositionNameRef}
					/>
					<TextField
						type="text"
						name="newPositionID"
						label="新場地代號"
						inputRef={newPositionIDRef}
					/>
					<TextField
						type="text"
						name="newPositionStart"
						label="新場地開始時間"
						helperText="數字+半形冒號+數字"
						placeholder="18:00"
						inputRef={newPositionStartRef}
					/>
					<TextField
						type="text"
						name="newPositionEnd"
						label="新場地結束時間"
						helperText="數字+半形冒號+數字"
						placeholder="21:00"
						inputRef={newPositionEndRef}
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
		</main>
	)
}
