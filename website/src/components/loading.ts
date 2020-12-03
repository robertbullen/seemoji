import { selectElementOrThrow } from '../utils';

export class LoadingComponent {
	public doneLoading(): void {
		this._elements.loadingDiv.style.display = 'none';
		this._elements.doneLoadingDiv.style.display = 'unset';
	}

	public loading(): void {
		this._elements.doneLoadingDiv.style.display = 'none';
		this._elements.loadingDiv.style.display = 'unset';
	}

	private readonly _elements = {
		loadingDiv: selectElementOrThrow<HTMLDivElement>('#loading'),
		doneLoadingDiv: selectElementOrThrow<HTMLDivElement>('#done-loading'),
	};
}
