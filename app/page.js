import styles from './page.module.css'

import Generator from './generator';

export default function Home({ searchParams }) {
	return (
		<main className={styles.main}>
			<Generator />
		</main>
	)
}
