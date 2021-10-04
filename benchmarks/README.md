# Benchmarks

These benchmarks are now 100% compiant with the [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark).

Please note that Benchmark results are unstable. To have more stable results:

1. Restart OS. Do not run any applications. Put power cable to laptop.
2. Run tests 5 times.
3. Take the best result for each candidate.

[**→ Click to test benchmarks live yourself!**](https://million.aidenybai.com/)

## Results

Benchmarks compiled on `10/3/2021, 5:20:05 PM`

**UA:** Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36

---

swap rows (swap 2 rows for table with 1,000 rows)

```
million x 233,115 ops/sec ±10.04% (64 runs sampled)
vanilla x 38,236 ops/sec ±4.44% (60 runs sampled)
Fastest is million
```

select row (highlighting a selected row)

```
million x 1,842,328 ops/sec ±0.70% (67 runs sampled)
vanilla x 747,504 ops/sec ±0.42% (54 runs sampled)
Fastest is million
```

replace all rows (updating all 1,000 rows)

```
million x 144,126 ops/sec ±1.02% (67 runs sampled)
vanilla x 1,859 ops/sec ±16.60% (56 runs sampled)
Fastest is million
```

remove row (removing one row)

```
million x 164 ops/sec ±17.96% (55 runs sampled)
vanilla x 541 ops/sec ±41.13% (47 runs sampled)
Fastest is vanilla
```

partial update (updating every 10th row for 1,000 rows)

```
million x 434 ops/sec ±2.73% (63 runs sampled)
vanilla x 2,908 ops/sec ±33.23% (20 runs sampled)
Fastest is vanilla
```

create rows (creating 1,000 rows)

```
million x 217 ops/sec ±19.98% (59 runs sampled)
vanilla x 312 ops/sec ±21.50% (59 runs sampled)
Fastest is vanilla
```

create many rows (creating 10,000 rows)

```
million x 20.29 ops/sec ±20.74% (38 runs sampled)
vanilla x 31.58 ops/sec ±15.61% (41 runs sampled)
Fastest is vanilla
```

clear rows (clearing a table with 1,000 rows)

```
million x 1,783,222 ops/sec ±21.94% (67 runs sampled)
vanilla x 6,485,752 ops/sec ±10.31% (69 runs sampled)
Fastest is vanilla
```

append many rows to large table (appending 1,000 to a table of 10,000 rows)

```
million x 258,696 ops/sec ±0.73% (67 runs sampled)
vanilla x 332 ops/sec ±4.59% (62 runs sampled)
Fastest is million
```

---

> ## Original benchmark metrics
>
> The intention of these benchmarks are not to convince you that Million is faster that all libraries, but rather bring perspective on the results of a specific method of testing DOM manipulation implementations when compared to each other.
>
> Implementation may differ, as the goal of the benchmarks is to acheive the same function <u>for the end user</u>.
>
> | Method               | `text-interop`           | `list-render`          | `conditional-render`      |
> | -------------------- | ------------------------ | ---------------------- | ------------------------- |
> | million              | 1,275,852 ops/sec ±6.33% | 12,262 ops/sec ±8.60%  | 1,013,634 ops/sec ±11.69% |
> | virtual-dom          | 341,239 ops/sec ±5.09%   | 8,466 ops/sec ±4.18%   | 356,429 ops/sec ±6.03%    |
> | vanilla<sup>1</sup>  | 24,974 ops/sec ±9.21%    | 3,417 ops/sec ±8.91%   | 19,306 ops/sec ±11.23%    |
> | baseline<sup>2</sup> | 1,264,249 ops/sec ±7.34% | 13,216 ops/sec ±11.83% | 1,027,381 ops/sec ±8.00%  |
>
> 1. An implementation the average developer would make when writing just JavaScript.
> 2. The most performance-focused imperative solution.
>
> Tested on Macbook M1 16 GB, macOS Version 12.0 (Build 21A5268h), Chrome 91.0.4472.164 (Official Build) (arm64)
>
> _Results last taken 1:04 PM PST, 7/23/2021. Results may differ from the main implementation, and will most likely keep differing based on the elapsed time_
>
> [**→ Click to test benchmarks live yourself!**](https://million.aidenybai.com/)
>
> _Note: results you test may differ from the official benchmarks, due to differing hardware, browsers, extensions, etc._
