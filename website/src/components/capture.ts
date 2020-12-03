// const capture = {
//     button: selectElementOrThrow<HTMLButtonElement>('#capture button'),
//     frameGrabCanvas: selectElementOrThrow<HTMLCanvasElement>(
//         '#capture canvas:first-child',
//     ),
//     frameGrabHandposeOverlay: selectElementOrThrow<HTMLCanvasElement>(
//         '#capture canvas.overlay',
//     ),
// };

// function saveImageCapturesFromButton({
// 	button,
// 	frameCanvas,
// 	handpose,
// 	handposeOverlayCanvas,
// 	mediaStream,
// }: {
// 	button: HTMLButtonElement;
// 	frameCanvas: HTMLCanvasElement;
// 	handpose: HandPose;
// 	handposeOverlayCanvas: HTMLCanvasElement;
// 	mediaStream: MediaStream;
// }): void {
// 	const frameContext: CanvasRenderingContext2D = getCanvasContext(frameCanvas);
// 	const handposeOverlayContext: CanvasRenderingContext2D = getCanvasContext(
// 		handposeOverlayCanvas,
// 	);

// 	const track: MediaStreamTrack | undefined = mediaStream.getVideoTracks()[0];
// 	if (!track) {
// 		throw new Error('Failed to get video track');
// 	}
// 	const imageCapture = new ImageCapture(track);

// 	button.addEventListener(
// 		'click',
// 		async (): Promise<void> => {
// 			const image: ImageBitmap = await imageCapture.grabFrame();
// 			frameContext.drawImage(image, 0, 0);

// 			const predictions: Prediction[] = await handpose.estimateHands(frameCanvas);

// 			handposeOverlayContext.clearRect(
// 				0,
// 				0,
// 				handposeOverlayCanvas.clientWidth,
// 				handposeOverlayCanvas.clientHeight,
// 			);
// 			for (const prediction of predictions) {
// 				drawHandPrediction(handposeOverlayContext, prediction, true);
// 			}
// 		},
// 	);
// }
