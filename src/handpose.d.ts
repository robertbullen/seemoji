declare global {
	namespace handpose {
		function load(): Promise<HandPose>;

		interface HandPose {
			estimateHands(video: HTMLVideoElement): Promise<Prediction[]>;
		}

		type Point2d = [x: number, y: number];

		type Point3d = [x: number, y: number, z: number];

		type FingerPoints = [Point3d, Point3d, Point3d, Point3d];

		type FingerName = 'thumb' | 'indexFinger' | 'middleFinger' | 'ringFinger' | 'pinky';

		interface Prediction {
			annotations: Record<FingerName, FingerPoints> & {
				palmBase: [Point3d];
			};
			boundingBox: {
				bottomRight: Point2d;
				topLeft: Point2d;
			};
			handInViewConfidence: number;
			landmarks: Point3d[];
		}
	}
}
export = handpose;
