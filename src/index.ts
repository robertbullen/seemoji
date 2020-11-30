import { drawHandPredictions } from './drawing.js';

const cameraWrapperId = '#camera-wrapper';
const videoSelector = `${cameraWrapperId} video`;
const canvasSelector = `${cameraWrapperId} canvas`;

function selectElementOrThrow<TElement extends Element>(selector: string): TElement {
	const element: TElement | null = document.querySelector<TElement>(selector);
	if (!element) {
		throw new Error(`Element not found using selector '${selector}'`);
	}
	return element;
}

async function streamCameraToVideoElement(
	video: HTMLVideoElement,
): Promise<[width: number, height: number]> {
	// Open the camera stream.
	const stream: MediaStream = await navigator.mediaDevices.getUserMedia({
		audio: false,
		video: {
			facingMode: 'user',
		},
	});

	// Assign the stream to the video element and resolve once its loaded.
	video.srcObject = stream;
	return new Promise((resolve) => {
		video.onloadedmetadata = () => resolve([video.clientWidth, video.clientHeight]);
	});
}

async function drawHandPredictionsToCanvasElement(
	video: HTMLVideoElement,
	canvas: HTMLCanvasElement,
): Promise<void> {
	const model = await handpose.load();

	const contextOrNull: CanvasRenderingContext2D | null = canvas.getContext('2d');
	if (!contextOrNull) {
		throw new Error('`canvas.getContext()` returned `null`');
	}
	const context: CanvasRenderingContext2D = contextOrNull;

	async function drawFrame(): Promise<void> {
		const predictions = await model.estimateHands(video);

		context.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
		drawHandPredictions(context, predictions);

		requestAnimationFrame(drawFrame);
	}
	drawFrame();
}

window.addEventListener('load', async () => {
	try {
		const video: HTMLVideoElement = selectElementOrThrow(videoSelector);
		const [width, height] = await streamCameraToVideoElement(video);

		const canvas: HTMLCanvasElement = selectElementOrThrow(canvasSelector);
		canvas.width = width;
		canvas.height = height;
		drawHandPredictionsToCanvasElement(video, canvas);
	} catch (error) {
		console.error(error);
	}
});
