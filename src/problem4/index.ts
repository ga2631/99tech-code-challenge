/**
 * Problem 4: Three ways to sum to n
 *
 * Requirements:
 * - Provide 3 unique implementations of sum_to_n(n: number): number in TypeScript.
 * - Input: `n` - any integer. Assuming input will produce a result lesser than Number.MAX_SAFE_INTEGER.
 * - Output: return summation from 1 to n (e.g. sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15).
 * - If n <= 0, the summation returns 0 as there are no positive integers to sum.
 */

/**
 * Implementation A: Closed-Form Mathematical Formula (Gauss's Summation)
 *
 * Utilizes the arithmetic progression formula: S_n = n * (n + 1) / 2
 *
 * @param n - Any integer
 * @returns Sum of integers from 1 to n (or 0 if n <= 0)
 *
 * Complexity & Efficiency:
 * - Time Complexity: O(1) [Constant Time]
 *   Only requires a fixed number of basic arithmetic operations (addition, multiplication, division),
 *   executing in constant CPU cycles regardless of how large n is.
 * - Space Complexity: O(1) [Constant Space]
 *   Operates strictly within registers without allocating heap or additional stack memory.
 * - Efficiency: Highest efficiency among all 3 approaches.
 *   - Pros: Optimal for massive inputs (n up to ~1.34e8 before intermediate product exceeds Number.MAX_SAFE_INTEGER).
 *   - Cons: Arithmetic precision limits if n * (n + 1) exceeds Number.MAX_SAFE_INTEGER (9,007,199,254,740,991).
 */
export function sum_to_n_a(n: number): number {
  if (n <= 0) {
    return 0;
  }
  return (n * (n + 1)) / 2;
}

/**
 * Implementation B: Iterative Accumulation (Linear Loop)
 *
 * Iterates through all positive integers from 1 up to n, accumulating the sum sequentially.
 *
 * @param n - Any integer
 * @returns Sum of integers from 1 to n (or 0 if n <= 0)
 *
 * Complexity & Efficiency:
 * - Time Complexity: O(n) [Linear Time]
 *   Performs exactly n loop iterations and addition operations proportional to n.
 * - Space Complexity: O(1) [Constant Space]
 *   Uses a single accumulator variable (`sum`) and loop counter (`i`), maintaining O(1) auxiliary memory.
 * - Efficiency:
 *   - Pros: Immune to call-stack overflow issues. Prevents intermediate multiplication overflow.
 *   - Cons: For very large n (e.g. n = 10^8), takes noticeable CPU execution time compared to O(1) formula.
 */
export function sum_to_n_b(n: number): number {
  if (n <= 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}

/**
 * Implementation C: Recursive Reduction (Divide-and-Conquer)
 *
 * Computes sum recursively: sum_to_n(n) = n + sum_to_n(n - 1) with base case n <= 0.
 *
 * @param n - Any integer
 * @returns Sum of integers from 1 to n (or 0 if n <= 0)
 *
 * Complexity & Efficiency:
 * - Time Complexity: O(n) [Linear Time]
 *   Produces n recursive calls to resolve the summation down to the base case.
 * - Space Complexity: O(n) [Linear Space]
 *   Requires O(n) auxiliary call-stack frames to store execution contexts until base case returns.
 * - Efficiency:
 *   - Pros: Elegant, declarative, and mirrors the mathematical inductive definition.
 *   - Cons: Highly prone to `RangeError: Maximum call stack size exceeded` for large n (typically n > ~10,000
 *     in V8 / JavaScript environments without guaranteed tail-call optimization).
 */
export function sum_to_n_c(n: number): number {
  if (n <= 0) {
    return 0;
  }
  return n + sum_to_n_c(n - 1);
}
