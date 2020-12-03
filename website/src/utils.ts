export function selectElementOrThrow<TElement extends Element>(selector: string): TElement {
	const element: TElement | null = document.querySelector<TElement>(selector);
	if (!element) {
		throw new Error(`Element not found using selector '${selector}'`);
	}
	return element;
}

export function getCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
	const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
	if (!context) {
		throw new Error('`HTMLCanvasElement.getContext()` returned `null`');
	}
	return context;
}
