import '@tensorflow/tfjs-backend-cpu';
import { setWasmPaths } from '@tensorflow/tfjs-backend-wasm';
import '@tensorflow/tfjs-backend-webgl';
// @ts-ignore
import wasmSimdPath from '../../node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-simd.wasm';
// @ts-ignore
import wasmSimdThreadedPath from '../../node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm-threaded-simd.wasm';
// @ts-ignore
import wasmPath from '../../node_modules/@tensorflow/tfjs-backend-wasm/dist/tfjs-backend-wasm.wasm';

// This loads WASM backend dependencies in a way that is compatible with Webpack.
// See <https://github.com/tensorflow/tfjs/tree/master/tfjs-backend-wasm#using-bundlers>.
setWasmPaths({
	'tfjs-backend-wasm-simd.wasm': wasmSimdPath,
	'tfjs-backend-wasm-threaded-simd.wasm': wasmSimdThreadedPath,
	'tfjs-backend-wasm.wasm': wasmPath,
});

export type BackendName = 'cpu' | 'wasm' | 'webgl';

export interface BackendInfo {
	color: string;
	friendlyName: string;
}

export const backendInfos: Record<BackendName, BackendInfo> = {
	cpu: {
		color: 'rgba(255, 0, 0, 0.5)',
		friendlyName: 'CPU',
	},
	wasm: {
		color: 'rgba(0, 255, 0, 0.5)',
		friendlyName: 'WebAssembly',
	},
	webgl: {
		color: 'rgba(0, 0, 255, 0.5)',
		friendlyName: 'WebGL',
	},
};
