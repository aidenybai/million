# Million Benchmarks

These benchmarks mirror a subset of the [JS Framework Benchmark](https://github.com/krausest/js-framework-benchmark).

[**→ View the official benchmark results**](https://docs.google.com/spreadsheets/d/e/2PACX-1vS-zBSBzc0LW1V6BoPEw-V98P4_gox4qC0wZuQT5Yls_NDTDwM612aIYL_U988gfp4Xbl0ed7_9uYly/pubhtml)

Please note that Benchmark results are unstable. To have more stable results:

1. Restart OS. Do not run any applications. Put power cable to laptop.
2. Run tests 5 times.
3. Take the best result for each candidate.

[**→ Click to test benchmarks live yourself!**](https://millionjs.org/benchmarks/)

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
> [**→ Click to test benchmarks live yourself!**](https://millionjs.org/benchmarks/)
>
> _Note: results you test may differ from the official benchmarks, due to differing hardware, browsers, extensions, etc._
