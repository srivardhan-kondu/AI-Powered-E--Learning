import unittest
import sys
import os

# Add the workspace to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))


class TestBasicPythonBehavior(unittest.TestCase):
    """Tests for basic Python behavior and built-in operations."""

    def test_string_concatenation(self):
        result = "hello" + " " + "world"
        self.assertEqual(result, "hello world")

    def test_string_length(self):
        self.assertEqual(len("python"), 6)
        self.assertEqual(len(""), 0)
        self.assertEqual(len("a"), 1)

    def test_list_append(self):
        lst = [1, 2, 3]
        lst.append(4)
        self.assertEqual(lst, [1, 2, 3, 4])
        self.assertEqual(len(lst), 4)

    def test_list_extend(self):
        lst = [1, 2]
        lst.extend([3, 4, 5])
        self.assertEqual(lst, [1, 2, 3, 4, 5])

    def test_list_pop(self):
        lst = [1, 2, 3]
        popped = lst.pop()
        self.assertEqual(popped, 3)
        self.assertEqual(lst, [1, 2])

    def test_list_pop_index(self):
        lst = [10, 20, 30]
        popped = lst.pop(1)
        self.assertEqual(popped, 20)
        self.assertEqual(lst, [10, 30])

    def test_list_slicing(self):
        lst = [0, 1, 2, 3, 4, 5]
        self.assertEqual(lst[1:4], [1, 2, 3])
        self.assertEqual(lst[:3], [0, 1, 2])
        self.assertEqual(lst[3:], [3, 4, 5])
        self.assertEqual(lst[::2], [0, 2, 4])

    def test_dict_get(self):
        d = {"a": 1, "b": 2}
        self.assertEqual(d.get("a"), 1)
        self.assertIsNone(d.get("z"))
        self.assertEqual(d.get("z", 99), 99)

    def test_dict_keys_values(self):
        d = {"x": 10, "y": 20}
        self.assertIn("x", d.keys())
        self.assertIn(10, d.values())
        self.assertNotIn("z", d.keys())

    def test_dict_update(self):
        d = {"a": 1}
        d.update({"b": 2, "c": 3})
        self.assertEqual(d["b"], 2)
        self.assertEqual(d["c"], 3)
        self.assertEqual(len(d), 3)

    def test_set_operations(self):
        s1 = {1, 2, 3}
        s2 = {2, 3, 4}
        self.assertEqual(s1 & s2, {2, 3})
        self.assertEqual(s1 | s2, {1, 2, 3, 4})
        self.assertEqual(s1 - s2, {1})

    def test_integer_arithmetic(self):
        self.assertEqual(10 + 5, 15)
        self.assertEqual(10 - 5, 5)
        self.assertEqual(10 * 5, 50)
        self.assertEqual(10 // 3, 3)
        self.assertEqual(10 % 3, 1)
        self.assertEqual(2 ** 8, 256)

    def test_float_arithmetic(self):
        self.assertAlmostEqual(0.1 + 0.2, 0.3, places=10)
        self.assertAlmostEqual(1.5 * 2.0, 3.0)

    def test_boolean_logic(self):
        self.assertTrue(True and True)
        self.assertFalse(True and False)
        self.assertTrue(True or False)
        self.assertFalse(False or False)
        self.assertTrue(not False)

    def test_none_comparisons(self):
        val = None
        self.assertIsNone(val)
        self.assertFalse(val is not None)
        self.assertTrue(val is None)

    def test_type_checks(self):
        self.assertIsInstance(42, int)
        self.assertIsInstance(3.14, float)
        self.assertIsInstance("hello", str)
        self.assertIsInstance([1, 2], list)
        self.assertIsInstance({"a": 1}, dict)
        self.assertIsInstance((1, 2), tuple)

    def test_string_methods(self):
        s = "  Hello World  "
        self.assertEqual(s.strip(), "Hello World")
        self.assertEqual(s.lower().strip(), "hello world")
        self.assertEqual(s.upper().strip(), "HELLO WORLD")
        self.assertEqual("hello world".replace("world", "python"), "hello python")

    def test_string_split_join(self):
        s = "a,b,c,d"
        parts = s.split(",")
        self.assertEqual(parts, ["a", "b", "c", "d"])
        joined = ",".join(parts)
        self.assertEqual(joined, s)

    def test_string_startswith_endswith(self):
        s = "hello world"
        self.assertTrue(s.startswith("hello"))
        self.assertFalse(s.startswith("world"))
        self.assertTrue(s.endswith("world"))
        self.assertFalse(s.endswith("hello"))

    def test_string_find_index(self):
        s = "hello world"
        self.assertEqual(s.find("world"), 6)
        self.assertEqual(s.find("xyz"), -1)
        self.assertEqual(s.index("world"), 6)

    def test_string_count(self):
        s = "banana"
        self.assertEqual(s.count("a"), 3)
        self.assertEqual(s.count("n"), 2)
        self.assertEqual(s.count("z"), 0)

    def test_list_sort(self):
        lst = [3, 1, 4, 1, 5, 9, 2, 6]
        lst.sort()
        self.assertEqual(lst, [1, 1, 2, 3, 4, 5, 6, 9])

    def test_list_sort_reverse(self):
        lst = [3, 1, 4, 1, 5]
        lst.sort(reverse=True)
        self.assertEqual(lst, [5, 4, 3, 1, 1])

    def test_sorted_builtin(self):
        lst = [3, 1, 2]
        result = sorted(lst)
        self.assertEqual(result, [1, 2, 3])
        self.assertEqual(lst, [3, 1, 2])  # original unchanged

    def test_min_max_sum(self):
        lst = [3, 1, 4, 1, 5, 9]
        self.assertEqual(min(lst), 1)
        self.assertEqual(max(lst), 9)
        self.assertEqual(sum(lst), 23)

    def test_enumerate(self):
        lst = ["a", "b", "c"]
        result = list(enumerate(lst))
        self.assertEqual(result, [(0, "a"), (1, "b"), (2, "c")])

    def test_zip(self):
        a = [1, 2, 3]
        b = ["x", "y", "z"]
        result = list(zip(a, b))
        self.assertEqual(result, [(1, "x"), (2, "y"), (3, "z")])

    def test_map_filter(self):
        nums = [1, 2, 3, 4, 5]
        doubled = list(map(lambda x: x * 2, nums))
        self.assertEqual(doubled, [2, 4, 6, 8, 10])
        evens = list(filter(lambda x: x % 2 == 0, nums))
        self.assertEqual(evens, [2, 4])

    def test_list_comprehension(self):
        squares = [x ** 2 for x in range(5)]
        self.assertEqual(squares, [0, 1, 4, 9, 16])

    def test_dict_comprehension(self):
        d = {k: k ** 2 for k in range(4)}
        self.assertEqual(d, {0: 0, 1: 1, 2: 4, 3: 9})

    def test_set_comprehension(self):
        s = {x % 3 for x in range(9)}
        self.assertEqual(s, {0, 1, 2})

    def test_generator_expression(self):
        gen = (x ** 2 for x in range(4))
        result = list(gen)
        self.assertEqual(result, [0, 1, 4, 9])

    def test_tuple_unpacking(self):
        a, b, c = (1, 2, 3)
        self.assertEqual(a, 1)
        self.assertEqual(b, 2)
        self.assertEqual(c, 3)

    def test_star_unpacking(self):
        first, *rest = [1, 2, 3, 4, 5]
        self.assertEqual(first, 1)
        self.assertEqual(rest, [2, 3, 4, 5])

    def test_any_all(self):
        self.assertTrue(any([False, True, False]))
        self.assertFalse(any([False, False, False]))
        self.assertTrue(all([True, True, True]))
        self.assertFalse(all([True, False, True]))

    def test_abs_round(self):
        self.assertEqual(abs(-5), 5)
        self.assertEqual(abs(5), 5)
        self.assertEqual(round(3.7), 4)
        self.assertEqual(round(3.2), 3)
        self.assertEqual(round(3.14159, 2), 3.14)

    def test_divmod(self):
        q, r = divmod(17, 5)
        self.assertEqual(q, 3)
        self.assertEqual(r, 2)

    def test_isinstance_multiple_types(self):
        val = 42
        self.assertTrue(isinstance(val, (int, float)))
        self.assertFalse(isinstance(val, (str, list)))

    def test_string_format(self):
        result = "Hello, {}!".format("world")
        self.assertEqual(result, "Hello, world!")
        result2 = f"Value is {42}"
        self.assertEqual(result2, "Value is 42")

    def test_string_format_spec(self):
        result = "{:.2f}".format(3.14159)
        self.assertEqual(result, "3.14")
        result2 = "{:05d}".format(42)
        self.assertEqual(result2, "00042")

    def test_range(self):
        r = list(range(5))
        self.assertEqual(r, [0, 1, 2, 3, 4])
        r2 = list(range(2, 8))
        self.assertEqual(r2, [2, 3, 4, 5, 6, 7])
        r3 = list(range(0, 10, 2))
        self.assertEqual(r3, [0, 2, 4, 6, 8])

    def test_reversed(