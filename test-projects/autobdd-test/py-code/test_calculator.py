import pytest
import calculator

def test_add():
    value = calculator.add(3.0, 2.0)
    assert value == 5.0

def test_subtract():
    value = calculator.subtract(3.0, 2.0)
    assert value == 1.0

@pytest.mark.xfail(reason='bug CAL-1234')
def test_subtract_negative():
    value = calculator.subtract(3.0, 2.0)
    assert value == -1.0

def test_multiply():
    value = calculator.multiply(3.0, 2.0)
    assert value == 6.0

def test_divide():
    value = calculator.divide(3.0, 2.0)
    assert value == 1.5

def test_maximum():
    value = calculator.maximum(3.0, 2.0)
    assert value == 3.0

def test_minimum():
    value = calculator.minimum(3.0, 2.0)
    assert value == 2.0
