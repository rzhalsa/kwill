import sys
import os
import unittest

'''
ci_controller.py

Tests all other tests in this directory for use by the Backend CI (defined in .github/workflows/backend.yml)
'''

def main():
    # Discover and run all tests in current directory
    loader = unittest.TestLoader()
    
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    try:
        # Load tests from all Python files (but skip this file)
        # All test files using unittest must end in _test.py for this to work
        suite = loader.discover(current_dir, pattern='*_test.py')
        
        '''
        Create a test runner object which executes all tests. Set verbosity to 2 so if any
        tests fail, the exact failure point can be identified.
        '''
        runner = unittest.TextTestRunner(verbosity = 2)
        result = runner.run(suite)
        
        # Exit with error code if any of the tests failed, otherwise return 0
        sys.exit(0 if result.wasSuccessful() else 1)
        
    except Exception as e:
        # Handle any exception with running the tests and log the encountered exception to the terminal
        print(f"Error running tests: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()