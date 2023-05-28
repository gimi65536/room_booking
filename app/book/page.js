'use client';
import { useSearchParams } from 'next/navigation';

export default function Home() {
	const searchParams = useSearchParams();
	return (
		<main className={styles.main}>
		</main>
	)
}
