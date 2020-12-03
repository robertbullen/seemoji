import { HandPose, load as loadHandpose } from '@tensorflow-models/handpose';
import { ready as tensorFlowReady } from '@tensorflow/tfjs-core';
import { LoadingComponent } from './components/loading';
import { PreviewComponent } from './components/preview';
import './tensorflow-backends';

window.addEventListener(
	'load',
	async (): Promise<void> => {
		try {
			// Indicate loading immediately.
			const loadingComponent = new LoadingComponent();
			loadingComponent.loading();

			try {
				// Start loading handpose in the background because it takes a while.
				await tensorFlowReady();
				const handposePromise: Promise<HandPose> = loadHandpose();

				// Start the previewer.
				const previewComponent = new PreviewComponent();

				const mediaStream: MediaStream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: { facingMode: 'user' },
				});
				await previewComponent.startStreamingWebcam(mediaStream);

				const handpose: HandPose = await handposePromise;
				previewComponent.startDrawingHandposeOverlays(handpose);
			} finally {
				loadingComponent.doneLoading();
			}
		} catch (error) {
			console.error(error);
			throw error;
		}
	},
);
