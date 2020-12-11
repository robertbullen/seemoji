import { drawHandPrediction } from '@lib/drawing';
import { HandPose, Prediction } from '@tensorflow-models/handpose';
import { getBackend, ready, setBackend } from '@tensorflow/tfjs-core';
import Chart from 'chart.js';
import { PerSecondMetrics } from '../per-second-metrics';
import { backendInfos, BackendName } from '../tensorflow-backends';
import { getCanvasContext, selectElementOrThrow } from '../utils';

export class PreviewComponent {
	public constructor() {
		this._chart = this.createPerformanceChart();
		this.handleFlipHorizontalOption();
		this.handleTensorFlowBackendOption();
		this.startUpdatingPerformanceChart();
	}

	public startDrawingHandposeOverlays(handpose: HandPose): void {
		const drawFrame = async (): Promise<void> => {
			await ready();
			const predictions: Prediction[] = await handpose.estimateHands(this._elements.video);

			this._elements.handposeOverlayCanvas.width = this._elements.video.clientWidth;
			this._elements.handposeOverlayCanvas.height = this._elements.video.clientHeight;

			const context: CanvasRenderingContext2D = getCanvasContext(
				this._elements.handposeOverlayCanvas,
			);
			context.clearRect(0, 0, context.canvas.clientWidth, context.canvas.clientHeight);
			for (const prediction of predictions) {
				drawHandPrediction(context, prediction, true);
			}

			this._metrics.increment(getBackend() as BackendName);

			requestAnimationFrame(drawFrame);
		};

		requestAnimationFrame(drawFrame);
	}

	public async startStreamingWebcam(mediaStream: MediaStream): Promise<void> {
		// Assign the stream to the video element and resolve once its loaded.
		this._elements.video.srcObject = mediaStream;
		return new Promise((resolve: () => void): void => {
			this._elements.video.onloadedmetadata = (): void => resolve();
		});
	}

	private createPerformanceChart(): Chart {
		const context: CanvasRenderingContext2D = getCanvasContext(
			this._elements.performanceChartCanvas,
		);

		const chart = new Chart(context, {
			data: {
				datasets: Array.from(this._metrics.seriesMap).map(
					([seriesName, series]: [
						BackendName,
						readonly number[],
					]): Chart.ChartDataSets => ({
						backgroundColor: backendInfos[seriesName].color,
						barPercentage: 1,
						categoryPercentage: 1,
						data: series as number[],
						label: backendInfos[seriesName].friendlyName,
					}),
				),
				labels: this._metrics.timestamps as number[],
			},
			options: {
				legend: {
					labels: {
						boxWidth: 12,
					},
					position: 'bottom',
				},
				responsive: true,
				scales: {
					xAxes: [
						{
							stacked: true,
							ticks: {
								callback: () => undefined,
							},
						},
					],
					yAxes: [
						{
							stacked: true,
							ticks: {
								autoSkipPadding: 5,
							},
						},
					],
				},
				title: {
					display: true,
					padding: 5,
					text: 'Predictions per Second',
				},
				tooltips: {
					enabled: false,
				},
			},
			type: 'bar',
		});

		return chart;
	}

	private handleFlipHorizontalOption(): void {
		const updateStackDivFlipHorizontalClass = (): void => {
			this._elements.stackDiv.classList.toggle(
				'flip-horizontal',
				this._elements.flipHorizontalCheckbox.checked,
			);
		};

		this._elements.flipHorizontalCheckbox.addEventListener(
			'change',
			updateStackDivFlipHorizontalClass,
		);

		updateStackDivFlipHorizontalClass();
	}

	private handleTensorFlowBackendOption(): void {
		const backendRadios: HTMLInputElement[] = [
			this._elements.cpuRadio,
			this._elements.wasmRadio,
			this._elements.webglRadio,
		];

		const updateTensorFlowBackend = async (backend: string): Promise<void> => {
			if (backend !== getBackend()) {
				const success: boolean = await setBackend(backend);
				if (!success) {
					const radio: HTMLInputElement | undefined = backendRadios.find(
						(radio: HTMLInputElement): boolean => radio.value === getBackend(),
					);
					if (radio) {
						radio.checked = true;
					}
				}
			}
		};

		for (const radio of backendRadios) {
			radio.addEventListener('change', (event: Event): void => {
				const backend: string = (event.target as HTMLInputElement).value;
				updateTensorFlowBackend(backend);
			});

			if (radio.value === getBackend()) {
				radio.checked = true;
			}
		}
	}

	private startUpdatingPerformanceChart(): void {
		const updateChart = (): void => {
			const canvas = this._elements.performanceChartCanvas;
			const canvasParent: HTMLElement | null = canvas.parentElement;
			if (!canvasParent) {
				throw new Error('`canvasParent` is `null`');
			}

			canvas.style.width = '100%';
			canvas.style.height = '100%';
			canvas.width = canvasParent?.clientWidth ?? 0;
			canvas.height = canvasParent?.clientHeight ?? 0;

			this._chart.update();
		};

		setInterval(updateChart, 1000);
	}

	private readonly _chart: Chart;
	private readonly _elements = {
		cpuRadio: selectElementOrThrow<HTMLInputElement>('#preview #cpu-radio'),
		flipHorizontalCheckbox: selectElementOrThrow<HTMLInputElement>(
			'#preview #flip-horizontal-checkbox',
		),
		handposeOverlayCanvas: selectElementOrThrow<HTMLCanvasElement>('#preview canvas.overlay'),
		performanceChartCanvas: selectElementOrThrow<HTMLCanvasElement>(
			'#preview #performance-chart',
		),
		stackDiv: selectElementOrThrow<HTMLDivElement>('#preview #preview-stack'),
		video: selectElementOrThrow<HTMLVideoElement>('#preview video'),
		wasmRadio: selectElementOrThrow<HTMLInputElement>('#preview #wasm-radio'),
		webglRadio: selectElementOrThrow<HTMLInputElement>('#preview #webgl-radio'),
	};
	private readonly _metrics = new PerSecondMetrics<BackendName>(
		Object.keys(backendInfos) as BackendName[],
	);
}
