<script lang="ts">
	import Copy from '$lib/components/Copy.svelte';
	let valMin = $state(0);
	let valMax = $state(100);
	let screenMin = $state(375);
	let screenMax = $state(1440);
	type Unit = 'px' | 'rem';
	let isRem: boolean = $state(false);
	let unit: Unit = $derived(isRem ? 'rem' : 'px');

	const m = $derived((valMax - valMin) / (screenMax - screenMin));
	const b = $derived(valMin - m * screenMin);
	const clamp = $derived(getClamp());

	function getClamp(precision = 3) {
		const width = checkLastChar((m * 100).toFixed(precision));
		const operator = b >= 0 ? '+' : '-';
		let yInt;

		if (unit === 'rem') {
			yInt = Math.abs(b / 16).toFixed(precision);
		} else {
			yInt = Math.abs(b).toFixed(precision);
		}
		yInt = checkLastChar(yInt);

		return `clamp(${valMin}${unit}, ${width}vw ${operator} ${yInt}${unit}, ${valMax}${unit})`;

		/**
		 * This function checks if the last character of the given string is a digit from 1 to 9.
		 * If it is, it returns the string unchanged. If not, it removes the last character and checks again.
		 * This is done to avoid having a trailing decimal point in the CSS calc() function,
		 * which is not valid CSS.
		 * @param {string} x - The string to check
		 * @returns {string} The string with the last character removed if it was a digit from 1 to 9
		 */
		function checkLastChar(x: string) {
			const regex = /^[1-9]$/;
			let z;
			if (regex.test(x[x.length - 1])) return x;
			z = x.slice(0, -1);
			checkLastChar(z);
			return z;
		}
	}

	function convertUnit() {
		if (!isRem) {
			valMin = Math.fround(valMin / 16);
			valMax = Math.fround(valMax / 16);
			screenMin = Math.fround(screenMin / 16);
			screenMax = Math.fround(screenMax / 16);
		} else {
			valMin = Math.round(valMin * 16);
			valMax = Math.round(valMax * 16);
			screenMin = Math.round(screenMin * 16);
			screenMax = Math.round(screenMax * 16);
		}
	}
</script>

<div class="container">
	<h1 class="title">CSS Clamp Calculator</h1>
	<p class="description">
		Generate responsive <code>clamp()</code> functions for fluid typography and sizing.
	</p>
	<div class="card">
		<div class="input-grid">
			<div class="input-group">
				<label for="val-min">Value Min ({unit})</label>
				<input id="val-min" type="number" min={0} max={valMax - 1} bind:value={valMin} />
			</div>

			<div class="input-group">
				<label for="val-max">Value Max ({unit})</label>
				<input id="val-max" type="number" min={valMin + 1} bind:value={valMax} />
			</div>

			<div class="input-group">
				<label for="screen-min">Screen Min ({unit})</label>
				<input id="screen-min" type="number" min={0} max={screenMax - 1} bind:value={screenMin} />
			</div>

			<div class="input-group">
				<label for="screen-max">Screen Max ({unit})</label>
				<input id="screen-max" type="number" min={screenMin + 1} bind:value={screenMax} />
			</div>

			<div class="input-group">
				<label for="unit">Unit</label>
				<div class="toggle-switch">
					<input type="checkbox" id="unit" bind:checked={isRem} oninput={convertUnit} />
					<label for="unit">
						<span class="toggle-label">{unit}</span>
						<span class="toggle-knob"></span>
					</label>
				</div>
			</div>
		</div>

		<div class="result">
			<div class="copy-container">
				<label for="clamp" class="result-label">CSS Clamp Function</label>
				<Copy str={clamp} context="clamp" />
				<pre id="clamp" class="code-block">{clamp}</pre>
			</div>
		</div>
	</div>
</div>
