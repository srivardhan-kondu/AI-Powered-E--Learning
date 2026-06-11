import unittest
from unittest.mock import patch, MagicMock
import sys
import os

# Since no specific code snippets were provided, we'll test common Python
# built-in behaviors and utility patterns that represent realistic scenarios.
# We'll create a module with functions to test inline.

# ─── inline module under test ────────────────────────────────────────────────

def parse_integer(value):
    """Convert value to integer, raising ValueError for invalid input."""
    if value is None:
        raise ValueError("Cannot parse None as integer")
    return int(value)


def safe_divide(numerator, denominator):
    """Divide numerator by denominator, raising ZeroDivisionError if denom is 0."""
    if denominator == 0:
        raise ZeroDivisionError("Division by zero is not allowed")
    return numerator / denominator


def flatten_list(nested):
    """Flatten one level of nesting in a list of lists."""
    if not isinstance(nested, list):
        raise TypeError("Input must be a list")
    result = []
    for item in nested:
        if isinstance(item, list):
            result.extend(item)
        else:
            result.append(item)
    return result


def word_count(text):
    """Return a dict mapping each word (lowercased) to its frequency."""
    if not isinstance(text, str):
        raise TypeError("Input must be a string")
    if text.strip() == "":
        return {}
    words = text.lower().split()
    counts = {}
    for word in words:
        counts[word] = counts.get(word, 0) + 1
    return counts


def clamp(value, min_val, max_val):
    """Clamp value between min_val and max_val."""
    if min_val > max_val:
        raise ValueError("min_val must not exceed max_val")
    if value < min_val:
        return min_val
    if value > max_val:
        return max_val
    return value


# ─── test suite ──────────────────────────────────────────────────────────────

class TestParseInteger(unittest.TestCase):

    def test_parse_integer_happy_path_string_digit(self):
        result = parse_integer("42")
        self.assertEqual(result, 42)
        self.assertIsInstance(result, int)

    def test_parse_integer_happy_path_actual_int(self):
        result = parse_integer(7)
        self.assertEqual(result, 7)

    def test_parse_integer_negative_string(self):
        result = parse_integer("-15")
        self.assertEqual(result, -15)

    def test_parse_integer_float_string_truncates(self):
        # int("3.7") raises ValueError — document that behaviour
        with self.assertRaises(ValueError):
            parse_integer("3.7")

    def test_parse_integer_none_raises_value_error(self):
        with self.assertRaises(ValueError) as ctx:
            parse_integer(None)
        self.assertIn("None", str(ctx.exception))

    def test_parse_integer_empty_string_raises_value_error(self):
        with self.assertRaises(ValueError):
            parse_integer("")

    def test_parse_integer_non_numeric_string_raises(self):
        with self.assertRaises(ValueError):
            parse_integer("abc")

    def test_parse_integer_large_number(self):
        result = parse_integer("999999999999999999")
        self.assertEqual(result, 999999999999999999)


class TestSafeDivide(unittest.TestCase):

    def test_safe_divide_happy_path_integers(self):
        result = safe_divide(10, 2)
        self.assertAlmostEqual(result, 5.0)

    def test_safe_divide_happy_path_floats(self):
        result = safe_divide(7.5, 2.5)
        self.assertAlmostEqual(result, 3.0)

    def test_safe_divide_negative_numerator(self):
        result = safe_divide(-9, 3)
        self.assertAlmostEqual(result, -3.0)

    def test_safe_divide_zero_denominator_raises(self):
        with self.assertRaises(ZeroDivisionError) as ctx:
            safe_divide(5, 0)
        self.assertIn("zero", str(ctx.exception).lower())

    def test_safe_divide_zero_numerator_returns_zero(self):
        result = safe_divide(0, 5)
        self.assertEqual(result, 0.0)

    def test_safe_divide_both_negative(self):
        result = safe_divide(-8, -4)
        self.assertAlmostEqual(result, 2.0)

    def test_safe_divide_very_large_values(self):
        result = safe_divide(1e308, 1e154)
        self.assertAlmostEqual(result, 1e154, delta=1e140)


class TestFlattenList(unittest.TestCase):

    def test_flatten_list_happy_path(self):
        result = flatten_list([[1, 2], [3, 4], [5]])
        self.assertEqual(result, [1, 2, 3, 4, 5])

    def test_flatten_list_empty_outer_list(self):
        result = flatten_list([])
        self.assertEqual(result, [])

    def test_flatten_list_empty_inner_lists(self):
        result = flatten_list([[], [], []])
        self.assertEqual(result, [])

    def test_flatten_list_mixed_nested_and_scalars(self):
        result = flatten_list([1, [2, 3], 4])
        self.assertEqual(result, [1, 2, 3, 4])

    def test_flatten_list_non_list_input_raises(self):
        with self.assertRaises(TypeError):
            flatten_list("not a list")

    def test_flatten_list_none_input_raises(self):
        with self.assertRaises(TypeError):
            flatten_list(None)

    def test_flatten_list_deeply_nested_not_flattened_further(self):
        # Only one level of nesting is flattened
        result = flatten_list([[1, [2, 3]], [4]])
        self.assertEqual(result, [1, [2, 3], 4])

    def test_flatten_list_single_element_sublists(self):
        result = flatten_list([[10], [20], [30]])
        self.assertEqual(result, [10, 20, 30])


class TestWordCount(unittest.TestCase):

    def test_word_count_happy_path(self):
        result = word_count("hello world hello")
        self.assertEqual(result["hello"], 2)
        self.assertEqual(result["world"], 1)

    def test_word_count_case_insensitive(self):
        result = word_count("Hello HELLO hello")
        self.assertEqual(result["hello"], 3)
        self.assertEqual(len(result), 1)

    def test_word_count_empty_string_returns_empty_dict(self):
        result = word_count("")
        self.assertEqual(result, {})

    def test_word_count_whitespace_only_returns_empty_dict(self):
        result = word_count("   ")
        self.assertEqual(result, {})

    def test_word_count_single_word(self):
        result = word_count("python")
        self.assertEqual(result, {"python": 1})

    def test_word_count_non_string_raises(self):
        with self.assertRaises(TypeError):
            word_count(123)

    def test_word_count_none_raises(self):
        with self.assertRaises(TypeError):
            word_count(None)

    def test_word_count_long_repeated_text(self):
        text = "spam " * 1000
        result = word_count(text.strip())
        self.assertEqual(result["spam"], 1000)
        self.assertEqual(len(result), 1)


class TestClamp(unittest.TestCase):

    def test_clamp_happy_path_within_range(self):
        result = clamp(5, 1, 10)
        self.assertEqual(result, 5)

    def test_clamp_value_below_min_returns_min(self):
        result = clamp(-5, 0, 100)
        self.assertEqual(result, 0)

    def test_clamp_value_above_max_returns_max(self):
        result = clamp(200, 0, 100)
        self.assertEqual(result, 100)

    def test_clamp_value_exactly_at_min(self):
        result = clamp(0, 0, 10)
        self.assertEqual(result, 0)

    def test_clamp_value_exactly_at_max(self):
        result = clamp(10, 0, 10)
        self.assertEqual(result, 10)

    def test_clamp_min_greater_than_max_raises(self):
        with self.assertRaises(ValueError) as ctx:
            clamp(5, 10, 1)
        self.assertIn("min_val", str(ctx.exception))

    def test_clamp_negative_range(self):
        result = clamp(-3, -10, -1)
        self.assertEqual(result, -3)

    def test_clamp_float_values(self):
        result = clamp(1.5, 1.0, 2.0)
        self.assertAlmostEqual(result, 1.5)

    def test_clamp_equal_min_and_max(self):
        result = clamp(7, 5, 5)
        self.assertEqual(result, 5)


if __name__ == "__main__":
    unittest.main()