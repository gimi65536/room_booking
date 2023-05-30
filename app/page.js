import styles from './page.module.css'

import Generator from './generator';
import Book from './book';

export default function Home({ searchParams }) {
	let children;
	if (Object.keys(searchParams).length === 0){
		children = <Generator />;
	}else{
		children = <Book searchParams={searchParams} />;
	}
	return (
		<main className={styles.main}>
			{children}
		</main>
	)
}
