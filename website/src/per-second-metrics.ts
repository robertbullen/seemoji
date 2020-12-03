/**
 * Tracks simple counters in one-second intervals for a set of series, with each series having its
 * own array, plus another array of numeric timestamps (UNIX time with 1-second resolution).
 *
 * The [structure of arrays](https://en.wikipedia.org/wiki/AoS_and_SoA) implementation (vs using an
 * array of structures) was chosen because it is immediately compatible with Chart.js.
 */
export class PerSecondMetrics<TSeriesName extends string = string> {
	constructor(public readonly seriesNames: readonly TSeriesName[], secondsToTrack: number = 60) {
		// Prepopulate the arrays.
		this._seriesMap = new Map<TSeriesName, number[]>(
			seriesNames.map((seriesName: TSeriesName): [TSeriesName, number[]] => [
				seriesName,
				new Array(secondsToTrack).fill(0),
			]),
		);

		this._timestamps = new Array(secondsToTrack);
		for (
			let index = this._timestamps.length - 1,
				timestamp = PerSecondMetrics.getCurrentTimestamp();
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
		const series: number[] | undefined = this._seriesMap.get(seriesName);
		if (!series) {
			throw new Error(`Unregistered series name '${seriesName}'`);
		}

		// Advance all the arrays if necessary.
		const timestamp: number = PerSecondMetrics.getCurrentTimestamp();
		while ((this._timestamps[this._timestamps.length - 1] ?? timestamp) < timestamp) {
			for (const series of this._seriesMap.values()) {
				series.shift();
				series.push(0);
			}
			this._timestamps.shift();
			this._timestamps.push((this._timestamps[this._timestamps.length - 1] ?? 0) + 1);
		}

		// Bump the specific interval metric.
		series[series.length - 1] = (series[series.length - 1] ?? 0) + 1;
	}

	private static getCurrentTimestamp(): number {
		return Math.floor(Date.now() / 1000);
	}

	private readonly _seriesMap: Map<TSeriesName, number[]>;
	private readonly _timestamps: number[];
}
