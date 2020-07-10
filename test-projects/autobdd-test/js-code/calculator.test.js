const cal = require('./calculator');

test('add 1 + 2 to equal 3', () => {
    expect(cal.add(1, 2)).toBe(3);
});

test('subtract 5 - 4 to equal 1', () => {
    expect(cal.subtract(5, 4)).toBe(1);
});

test('multiply 3 * 7 to equal 21', () => {
    expect(cal.multiply(3, 7)).toBe(21);
});
