<script lang="ts">
	import '$lib/styles/reset.css';
	// import '$lib/styles/wrapper.css';
	import '$lib/styles/app.css';

	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<main class="bento-grid">
	{@render children()}
</main>
