/**
 * Tracks simple numerical counters in one-second intervals for a set of series. Each series has its
 * own array, plus another array of numeric timestamps (UNIX time with 1-second resolution).
 *
 * The [structure of arrays](https://en.wikipedia.org/wiki/AoS_and_SoA) implementation (vs using an
 * array of structures) was chosen because it is immediately compatible with Chart.js.
 */
export class PerSecondMetrics<TSeriesName extends string = string> {
	constructor(public readonly seriesNames: readonly TSeriesName[], secondsToTrack: number = 60) {
		this._currentMetrics = new Map<TSeriesName, number>();
		this._currentTimestamp = PerSecondMetrics.getCurrentTimestamp();

		// Prepopulate the series and timestamps arrays.
		this._seriesMap = new Map<TSeriesName, number[]>(
			seriesNames.map((seriesName: TSeriesName): [TSeriesName, number[]] => [
				seriesName,
				new Array(secondsToTrack).fill(0),
			]),
		);

		this._timestamps = new Array(secondsToTrack);
		for (
			let index = this._timestamps.length - 1, timestamp = this._currentTimestamp - 1;
			index >= 0;
			index--, timestamp--
		) {
			this._timestamps[index] = timestamp;
		}
	}

	public get seriesMap(): ReadonlyMap<TSeriesName, readonly number[]> {
		return this._seriesMap;
	}

	public get timestamps(): readonly number[] {
		return this._timestamps;
	}

	public increment(seriesName: TSeriesName): void {
		if (!this._seriesMap.has(seriesName)) {
			throw new Error(`Unregistered series name '${seriesName}'`);
		}

		this.advanceTime();

		this._currentMetrics.set(seriesName, (this._currentMetrics.get(seriesName) ?? 0) + 1);
	}

	private static getCurrentTimestamp(): number {
		return Math.floor(Date.now() / 1000);
	}

	private advanceTime(): void {
		this._currentTimestamp = PerSecondMetrics.getCurrentTimestamp();

		let lastRecordedTimestamp: number =
			this._timestamps[this._timestamps.length - 1] ?? this._currentTimestamp;
		while (lastRecordedTimestamp < this._currentTimestamp - 1) {
			for (const [seriesName, series] of this._seriesMap) {
				series.shift();
				series.push(this._currentMetrics.get(seriesName) ?? 0);
			}
			this._currentMetrics.clear();

			lastRecordedTimestamp++;
			this._timestamps.shift();
			this._timestamps.push(lastRecordedTimestamp);
		}
	}

	private readonly _currentMetrics: Map<TSeriesName, number>;
	private _currentTimestamp: number;
	private readonly _seriesMap: Map<TSeriesName, number[]>;
	private readonly _timestamps: number[];
}
