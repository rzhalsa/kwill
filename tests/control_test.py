import unittest

'''
control_test.py

A test which always succeeds in order to test ci_controller.py
'''

class ControlTest(unittest.TestCase):
    def test_add_positive_numbers(self):
        self.assertEqual(add(1, 2), 3)

    def test_add_negative_numbers(self):
        self.assertEqual(add(-1, -2), -3)

    def test_add_mixed_numbers(self):
        self.assertEqual(add(1, -2), -1)
        self.assertEqual(add(-1, 2), 1)

# Function which returns the sum of integers a and b
def add(a: int, b: int):
    return a + b

if __name__ == "__main__":
    unittest.main()