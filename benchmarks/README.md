# Benchmarks

These benchmarks are now 100% compiant with the [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark).

Please note that Benchmark results are unstable. To have more stable results:

1. Restart OS. Do not run any applications. Put power cable to laptop.
2. Run tests 5 times.
3. Take the best result for each candidate.

[**→ Click to test benchmarks live yourself!**](https://million.aidenybai.com/)

## Results

Benchmarks compiled on `10/4/2021, 8:40:13 PM`

**UA:** Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/94.0.4606.61 Safari/537.36

---

swap rows (swap 2 rows for table with 1,000 rows)

```
million x 608 ops/sec ±7.46% (43 runs sampled)
DOM x 620 ops/sec ±7.14% (55 runs sampled)
innerHTML x 220 ops/sec ±5.72% (55 runs sampled)
Fastest is DOM,million
```

select row (highlighting a selected row)

```
million x 606 ops/sec ±7.09% (43 runs sampled)
DOM x 620 ops/sec ±6.82% (43 runs sampled)
innerHTML x 220 ops/sec ±5.66% (54 runs sampled)
Fastest is DOM,million
```

replace all rows (updating all 1,000 rows)

```
million x 169 ops/sec ±4.31% (21 runs sampled)
DOM x 145 ops/sec ±1.38% (18 runs sampled)
innerHTML x 121 ops/sec ±5.12% (25 runs sampled)
Fastest is million
```

remove row (removing one row)

```
million x 630 ops/sec ±6.18% (57 runs sampled)
DOM x 635 ops/sec ±7.05% (44 runs sampled)
innerHTML x 217 ops/sec ±6.45% (52 runs sampled)
Fastest is million,DOM
```

partial update (updating every 10th row for 1,000 rows)

```
million x 96.90 ops/sec ±9.19% (46 runs sampled)
DOM x 526 ops/sec ±7.46% (53 runs sampled)
innerHTML x 218 ops/sec ±5.36% (54 runs sampled)
Fastest is DOM
```

create rows (creating 1,000 rows)

```
million x 24.92 ops/sec ±7.78% (36 runs sampled)
DOM x 34.00 ops/sec ±7.42% (39 runs sampled)
innerHTML x 33.70 ops/sec ±6.40% (39 runs sampled)
Fastest is innerHTML,DOM
```

create many rows (creating 10,000 rows)

```
million x 24.25 ops/sec ±8.71% (36 runs sampled)
DOM x 33.19 ops/sec ±7.77% (38 runs sampled)
innerHTML x 34.39 ops/sec ±6.15% (38 runs sampled)
Fastest is innerHTML,DOM
```

clear rows (clearing a table with 1,000 rows)

```
million x 516 ops/sec ±6.88% (53 runs sampled)
DOM x 448 ops/sec ±5.45% (57 runs sampled)
innerHTML x 567 ops/sec ±5.13% (57 runs sampled)
Fastest is innerHTML,million
```

append many rows to large table (appending 1,000 to a table of 10,000 rows)

```
million x 44.27 ops/sec ±6.22% (42 runs sampled)
DOM x 21.16 ops/sec ±9.63% (40 runs sampled)
innerHTML x 12.13 ops/sec ±5.86% (25 runs sampled)
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
