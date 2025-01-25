<script lang="ts">
	import Copy from './Copy.svelte';
	import { onMount } from 'svelte';
	let p1 = $state({ x: 0.25, y: 0.25 });
	let p2 = $state({ x: 0.75, y: 0.75 });
	let dragging: 'P1' | 'P2' | null = null;
	let canvas: HTMLCanvasElement;
	let container: HTMLElement;
	let animationLength = $state(1);
	let isPlaying = $state(false);
	let isReversed = $state(true);
	let ball: HTMLDivElement;

	let animation: Animation | null = null;

	const bezierOutput = $derived(getBezier());

	function startDrag(point: 'P1' | 'P2') {
		dragging = point;
	}

	function stopDrag() {
		dragging = null;
	}

	function handlePointerMove(event: PointerEvent) {
		if (!dragging || !container) return;

		const rect = container.getBoundingClientRect();
		const x = (event.clientX - rect.left) / rect.width;
		const y = (event.clientY - rect.top) / rect.height;

		const clamp = (n: number) => Math.max(0, Math.min(0.5, n));

		if (dragging === 'P1') {
			p1.x = Math.round(clamp(x) * 2 * 1000) / 1000;
			p1.y = Math.round((1 - y) * 1000) / 1000;
		} else {
			p2.x = Math.round(clamp(x) * 2 * 1000) / 1000;
			p2.y = Math.round((1 - y) * 1000) / 1000;
		}

		drawCurve();
	}

	function drawCurve() {
		if (!canvas) return;
		const ctx = canvas.getContext('2d')!;
		const { width, height } = canvas;

		ctx.clearRect(0, 0, width, height);

		ctx.strokeStyle = '#eee';
		ctx.setLineDash([2, 2]);
		ctx.beginPath();
		ctx.moveTo(width / 2, 0);
		ctx.lineTo(width / 2, height);
		ctx.moveTo(0, height / 2);
		ctx.lineTo(width, height / 2);
		ctx.stroke();

		ctx.setLineDash([]);
		ctx.strokeStyle = '#7067f0';
		ctx.beginPath();
		ctx.moveTo(0, height);
		ctx.bezierCurveTo(
			p1.x * width,
			(1 - p1.y) * height,
			p2.x * width,
			(1 - p2.y) * height,
			width,
			0
		);
		ctx.stroke();

		ctx.strokeStyle = '#eee';
		ctx.beginPath();
		ctx.moveTo(p1.x * width, (1 - p1.y) * height);
		ctx.lineTo(0, height);
		ctx.stroke();

		ctx.beginPath();
		ctx.moveTo(p2.x * width, (1 - p2.y) * height);
		ctx.lineTo(width, 0);
		ctx.stroke();
	}

	$effect(() => {
		drawCurve();
	});

	function getBezier() {
		return `cubic-bezier(${p1.x.toFixed(3)}, ${p1.y.toFixed(3)}, ${p2.x.toFixed(3)}, ${p2.y.toFixed(3)})`;
	}

	function animate() {
		if (animation) {
			animation.cancel();
		}

		isReversed = !isReversed;

		const duration = animationLength * 1000;
		const easing = getBezier();

		animation = ball.animate([{ left: '0%' }, { left: '100%' }], {
			duration,
			easing,
			direction: isReversed ? 'reverse' : 'normal',
			iterations: 1,
			fill: 'forwards'
		});

		animation.onfinish = () => {
			isPlaying = false;
		};

		isPlaying = true;
	}

	onMount(() => {
		drawCurve();
	});
</script>

<div class="container">
	<h1 class="title">CSS Bezier Calculator</h1>
	<p class="description">
		Generate a <code>bezier()</code> function for fluid typography and sizing.
	</p>

	<div class="card">
		<div class="bezier-container" bind:this={container}>
			<div class="coordinate-plane" onpointermove={handlePointerMove} onpointerup={stopDrag}>
				<canvas bind:this={canvas} class="curve-canvas" width={300} height={300}></canvas>

				<span class="control-point bottom-left"></span>
				<span class="control-point top-right"></span>

				<button
					class="control-point p1"
					style="left: {p1.x * 100}%; bottom: {p1.y * 100}%"
					onpointerdown={() => startDrag('P1')}
					aria-label="draggable control point"
				>
				</button>

				<button
					class="control-point p2"
					style="left: {p2.x * 100}%; bottom: {p2.y * 100}%"
					onpointerdown={() => startDrag('P2')}
					aria-label="draggable control point"
				>
				</button>
			</div>
			<div class="input-grid">
				<div class="point-group">
					<div class="input-group">
						<label for="p1x" class="p1">P1X</label>
						<input id="p1x" type="number" min="0" max="1" step="0.01" bind:value={p1.x} />
					</div>

					<div class="input-group">
						<label for="p1y" class="p1">P1Y</label>
						<input id="p1y" type="number" step="0.01" bind:value={p1.y} />
					</div>
				</div>

				<div class="point-group">
					<div class="input-group">
						<label for="p2x" class="p2">P2X</label>
						<input id="p2x" type="number" min="0" max="1" step="0.01" bind:value={p2.x} />
					</div>

					<div class="input-group">
						<label for="p2y" class="p2">P2Y</label>
						<input id="p2y" type="number" step="0.01" bind:value={p2.y} />
					</div>
				</div>
			</div>

			<div class="animation">
				<label for="anime-slider">
					<div class="top">
						<span>
							{animationLength} second{animationLength !== 1 ? 's' : ''}
						</span>
						<button onclick={animate}>Go</button>
					</div>
					<input
						type="range"
						id="anime-slider"
						min="0"
						max="1"
						step="0.01"
						class="slider"
						bind:value={animationLength}
					/>
				</label>
				<div class="ball-container">
					<div class="ball" bind:this={ball}></div>
				</div>
			</div>
		</div>

		<div class="result">
			<div class="copy-container">
				<label for="clamp" class="result-label">Bezier Curve Function</label>
				<Copy str={bezierOutput} context="bezier curve" />
				<code class="code-block">{bezierOutput}</code>
			</div>
		</div>
	</div>
</div>

<style>
	.bezier-container {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		grid-template-rows: auto 1fr;
		gap: 1.5rem;

		.coordinate-plane {
			grid-row: span 2;
			position: relative;
			width: 300px;
			height: 300px;
			background: var(--color-input);
			border-radius: 6px;
			touch-action: none;
			overflow: visible;
		}

		.input-grid {
			width: 100%;
			grid-template-columns: 1fr;

			.point-group {
				display: grid;
				grid-template-columns: repeat(2, minmax(2rem, 1fr));
				gap: 1rem;
				max-width: 100%;

				.input-group {
					max-width: 100%;
					label {
						color: var(--point-clr);
					}

					input {
						max-width: 100%;
					}
				}
			}
		}

		.animation {
			display: grid;
			grid-template-rows: auto 1fr;
			gap: 1rem;
			max-width: 100%;

			.top {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: var(--space-sm);
			}

			.top span {
				font-size: 0.875rem;
				color: var(--color-text);
				opacity: 0.8;
			}

			label {
				display: grid;
				grid-template-rows: auto auto;

				button {
					background-color: var(--color-primary);
					color: var(--color-text);
					border: none;
					border-radius: 6px;
					padding: var(--space-sm) var(--space-md);
					font-family: var(--font-family);
					font-weight: 500;
					cursor: pointer;
					transition: all 0.2s ease;
					box-shadow: var(--shadow-md);
				}

				button:hover {
					background-color: #5f57d0;
					transform: translateY(-1px);
				}

				button:active {
					transform: translateY(0);
				}

				button:focus {
					outline: none;
					box-shadow: 0 0 0 3px rgba(112, 103, 240, 0.25);
				}
			}

			.ball-container {
				position: relative;
				--size: 2rem;
				width: calc(100% - var(--size));
			}

			.ball {
				position: absolute;
				background-color: #e5a446;
				border-radius: 50%;
				width: var(--size);
				height: var(--size);
				top: 50%;
				left: 0;
				transform: translateY(-50%);
			}
		}
	}

	.control-point {
		--size: 2rem;
		position: absolute;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		border: 2px solid white;
		transform: translate(-50%, 50%);
		cursor: move;
		background: var(--point-clr);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		z-index: 1000;
	}

	.p1 {
		--point-clr: #7067f0;
	}
	.p2 {
		--point-clr: #e5a446;
	}

	.top-right {
		right: calc(var(--size) * -1);
		top: calc(var(--size) * -1);
	}

	.bottom-left {
		left: 0;
		bottom: 0;
	}

	.curve-canvas {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.slider {
		-webkit-appearance: none;
		width: 100%;
		height: 6px;
		background: var(--color-input);
		border-radius: 3px;
		margin: var(--space-sm) 0;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border: 2px solid var(--color-text);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.slider::-moz-range-thumb {
		width: 16px;
		height: 16px;
		background: var(--color-primary);
		border: 2px solid var(--color-text);
		border-radius: 50%;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.slider:focus {
		outline: none;
	}

	.slider:focus::-webkit-slider-thumb {
		transform: scale(1.1);
		box-shadow: 0 0 0 3px rgba(112, 103, 240, 0.25);
	}

	.slider:focus::-moz-range-thumb {
		transform: scale(1.1);
		box-shadow: 0 0 0 3px rgba(112, 103, 240, 0.25);
	}
</style>
