import { sum_to_n_a, sum_to_n_b, sum_to_n_c } from "./index";

describe("Problem 4: Three ways to sum to n", () => {
  const implementations = [
    { name: "Implementation A (Mathematical Formula)", fn: sum_to_n_a },
    { name: "Implementation B (Iterative Loop)", fn: sum_to_n_b },
    { name: "Implementation C (Recursive)", fn: sum_to_n_c },
  ];

  implementations.forEach(({ name, fn }) => {
    describe(name, () => {
      test("should calculate summation for standard positive integers (e.g. n = 5)", () => {
        expect(fn(5)).toBe(15); // 1 + 2 + 3 + 4 + 5 = 15
      });

      test("should calculate summation for base positive case (n = 1)", () => {
        expect(fn(1)).toBe(1);
      });

      test("should return 0 when n is 0", () => {
        expect(fn(0)).toBe(0);
      });

      test("should return 0 when n is negative (e.g. n = -5)", () => {
        expect(fn(-5)).toBe(0);
      });

      test("should produce consistent results for moderate positive integers (n = 100)", () => {
        expect(fn(100)).toBe(5050);
      });
    });
  });

  describe("Edge cases & large numbers", () => {
    test("Formula (A) and Iterative (B) handle large integers (n = 100,000)", () => {
      const expected = (100000 * 100001) / 2;
      expect(sum_to_n_a(100000)).toBe(expected);
      expect(sum_to_n_b(100000)).toBe(expected);
    });
  });
});
