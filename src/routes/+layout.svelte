<script lang="ts">
	import '$lib/styles/reset.css';
	import '$lib/styles/app.css';
	import appState from '$lib/state.svelte';

	import type { Snippet } from 'svelte';
	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: Snippet } = $props();
</script>

<main class="bento-grid">
	{@render children()}
</main>

{#if appState.copySuccess}
	<p class="copy-success card">{appState.formattedContext} copied to clipboard!</p>
{/if}
