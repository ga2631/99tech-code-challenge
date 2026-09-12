# Problem 4: Three Ways to Sum to $n$

## 📌 Problem Statement

Provide 3 unique implementations of the function `sum_to_n(n: number): number` in TypeScript.

- Comment on the complexity or efficiency of each function.
- **Input**: `n` - any integer.
- **Assumption**: This input will always produce a result lesser than `Number.MAX_SAFE_INTEGER` ($2^{53} - 1 = 9,007,199,254,740,991$).
- **Output**: `return` - summation from $1$ to $n$, i.e. `sum_to_n(5) === 1 + 2 + 3 + 4 + 5 === 15`. For $n \le 0$, the function returns `0`.

---

## 💡 Implementations & Complexity Analysis

### 1. Implementation A: Mathematical Formula (Gauss's Summation)

This approach computes the sum of the first $n$ natural numbers using the closed-form arithmetic progression formula:
$$S_n = \sum_{i=1}^{n} i = \frac{n \times (n + 1)}{2}$$

```typescript
export function sum_to_n_a(n: number): number {
  if (n <= 0) return 0;
  return (n * (n + 1)) / 2;
}
```

- **Time Complexity:** $\mathcal{O}(1)$ (Constant Time) — Evaluates via fixed arithmetic CPU operations in constant time regardless of $n$.
- **Auxiliary Space Complexity:** $\mathcal{O}(1)$ (Constant Space) — Requires no memory allocation.
- **Efficiency & Characteristics:**
  - ⚡ **Optimal Performance:** Highest throughput and lowest latency.
  - ⚠️ **Considerations:** The intermediate product $n(n+1)$ must stay below `Number.MAX_SAFE_INTEGER` to prevent precision degradation (supported for $n \lessapprox 1.34 \times 10^8$).

---

### 2. Implementation B: Iterative Accumulation (Linear Loop)

This approach maintains a running accumulator and sums integers from $1$ to $n$ using a standard `for` loop.

```typescript
export function sum_to_n_b(n: number): number {
  if (n <= 0) return 0;
  let sum = 0;
  for (let i = 1; i <= n; i++) {
    sum += i;
  }
  return sum;
}
```

- **Time Complexity:** $\mathcal{O}(n)$ (Linear Time) — Performs $n$ addition operations.
- **Auxiliary Space Complexity:** $\mathcal{O}(1)$ (Constant Space) — Only allocates scalar variables (`sum`, `i`).
- **Efficiency & Characteristics:**
  - 🛡️ **Robust:** Safe from recursion stack overflow errors.
  - 🔄 **Trade-off:** Execution time scales linearly with $n$.

---

### 3. Implementation C: Recursive Reduction (Divide-and-Conquer)

This approach uses mathematical induction: the sum of $1 \dots n$ equals $n + \text{sum}(1 \dots n-1)$, with base condition $n \le 0 \rightarrow 0$.

```typescript
export function sum_to_n_c(n: number): number {
  if (n <= 0) return 0;
  return n + sum_to_n_c(n - 1);
}
```

- **Time Complexity:** $\mathcal{O}(n)$ (Linear Time) — Generates $n$ nested recursive calls.
- **Auxiliary Space Complexity:** $\mathcal{O}(n)$ (Linear Space) — Allocates $n$ execution stack frames on the call stack.
- **Efficiency & Characteristics:**
  - 📖 **Declarative:** Direct translation of mathematical induction.
  - 🛑 **Limitation:** In JavaScript/TypeScript runtimes without tail-call optimization, large $n$ ($n > 10,000$) causes `RangeError: Maximum call stack size exceeded`.

---

## 📊 Summary & Comparison Matrix

| Implementation       | Method              | Time Complexity  | Auxiliary Space  |    Call Stack Risk    | Best Suited For                          |
| :------------------- | :------------------ | :--------------: | :--------------: | :-------------------: | :--------------------------------------- |
| **A** (`sum_to_n_a`) | Closed-form Formula | $\mathcal{O}(1)$ | $\mathcal{O}(1)$ |         None          | **Production & high-scale computation**  |
| **B** (`sum_to_n_b`) | Iterative Loop      | $\mathcal{O}(n)$ | $\mathcal{O}(1)$ |         None          | General procedural workloads             |
| **C** (`sum_to_n_c`) | Recursion           | $\mathcal{O}(n)$ | $\mathcal{O}(n)$ | **High** ($n > 10^4$) | Small inputs / functional demonstrations |

---

## 🛠 Runtime & Testing

- **Runtime & Environment:** Node.js (v24+ LTS) & TypeScript (v5+)
- **Test Framework:** Jest / Vitest / ts-jest
- **Test Suite:** [`index.test.ts`](./index.test.ts) validates functional correctness, identity bounds ($n=0, 1$), negative numbers, and high-scale inputs ($n = 100,000$).

