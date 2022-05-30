if (process.env.NODE_ENV === 'production') {
    throw 'test can not execute at production env.';
}
process.env.NODE_ENV = 'test';
