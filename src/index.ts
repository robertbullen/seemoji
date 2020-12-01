import { drawHandPredictions } from './drawing.js';

const previewSelector = '#preview';
const loadingSelector = `${previewSelector} p`;
const canvasSelector = `${previewSelector} canvas`;
const videoSelector = `${previewSelector} video`;

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
	model: handpose.HandPose,
): Promise<void> {
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
		const model: handpose.HandPose = await handpose.load();

		const loading: HTMLParagraphElement = selectElementOrThrow(loadingSelector);
		const video: HTMLVideoElement = selectElementOrThrow(videoSelector);
		const canvas: HTMLCanvasElement = selectElementOrThrow(canvasSelector);

		loading.style.display = 'none';
		video.style.display = 'unset';
		canvas.style.display = 'unset';

		const [width, height] = await streamCameraToVideoElement(video);
		canvas.width = width;
		canvas.height = height;

		drawHandPredictionsToCanvasElement(video, canvas, model);
	} catch (error) {
		console.error(error);
	}
});
