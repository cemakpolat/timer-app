import { createLogger, configureLogger } from '../utils/logger';

describe('logger', () => {
  let consoleSpies;
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    // Reset env to development for tests
    process.env.NODE_ENV = 'development';
    
    // Enable logging in tests
    configureLogger({ enableInTests: true });
    
    // Create spies for console methods
    consoleSpies = {
      log: jest.spyOn(console, 'log').mockImplementation(),
      info: jest.spyOn(console, 'info').mockImplementation(),
      warn: jest.spyOn(console, 'warn').mockImplementation(),
      error: jest.spyOn(console, 'error').mockImplementation(),
      group: jest.spyOn(console, 'group').mockImplementation(),
      groupCollapsed: jest.spyOn(console, 'groupCollapsed').mockImplementation(),
      groupEnd: jest.spyOn(console, 'groupEnd').mockImplementation(),
      time: jest.spyOn(console, 'time').mockImplementation(),
      timeEnd: jest.spyOn(console, 'timeEnd').mockImplementation()
    };
  });

  afterEach(() => {
    // Restore console methods
    Object.keys(consoleSpies).forEach(key => {
      consoleSpies[key].mockRestore();
    });
    // Reset logger config
    configureLogger({ enableInTests: false });
    // Reset env
    process.env.NODE_ENV = originalEnv;
  });

  describe('createLogger', () => {
    test('creates logger with default name', () => {
      const logger = createLogger();
      expect(logger).toBeDefined();
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    test('creates logger with custom name', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('MyComponent');
      logger.info('test');
      
      // In development, should include component name
      expect(consoleSpies.log).toHaveBeenCalled();
    });

    test('returns logger with all required methods', () => {
      const logger = createLogger();
      expect(logger).toHaveProperty('debug');
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(logger).toHaveProperty('group');
      expect(logger).toHaveProperty('groupCollapsed');
      expect(logger).toHaveProperty('groupEnd');
      expect(logger).toHaveProperty('time');
      expect(logger).toHaveProperty('timeEnd');
    });
  });

  describe('Environment-based logging', () => {
    const originalEnv = process.env.NODE_ENV;

    afterEach(() => {
      process.env.NODE_ENV = originalEnv;
    });

    test('logs in development mode', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('Test');
      
      logger.info('test message');
      expect(consoleSpies.log).toHaveBeenCalled();
    });

    test('suppresses debug in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger('Test');
      
      // eslint-disable-next-line testing-library/no-debugging-utils -- exercises logger.debug, not Testing Library helpers.
      logger.debug('debug message');
      // Debug should be suppressed in production
      expect(consoleSpies.log).not.toHaveBeenCalled();
    });

    test('allows errors in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger('Test');
      
      logger.error('error message');
      expect(consoleSpies.error).toHaveBeenCalled();
    });

    test('allows warnings in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger('Test');
      
      logger.warn('warning message');
      expect(consoleSpies.warn).toHaveBeenCalled();
    });
  });

  describe('Log levels', () => {
    let logger;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      logger = createLogger('TestLogger');
    });

    test('debug method logs with console.log', () => {
      // eslint-disable-next-line testing-library/no-debugging-utils -- exercises logger.debug, not Testing Library helpers.
      logger.debug('debug message', { data: 'test' });
      expect(consoleSpies.log).toHaveBeenCalled();
    });

    test('info method logs with console.log', () => {
      logger.info('info message', { data: 'test' });
      expect(consoleSpies.log).toHaveBeenCalled();
    });

    test('warn method logs with console.warn', () => {
      logger.warn('warning message', { data: 'test' });
      expect(consoleSpies.warn).toHaveBeenCalled();
    });

    test('error method logs with console.error', () => {
      logger.error('error message', { error: new Error('test') });
      expect(consoleSpies.error).toHaveBeenCalled();
    });

    test('supports multiple arguments', () => {
      logger.info('message', 'arg1', 'arg2', { key: 'value' });
      expect(consoleSpies.log).toHaveBeenCalledWith(
        expect.any(String),
        'message',
        'arg1',
        'arg2',
        { key: 'value' }
      );
    });
  });

  describe('Grouped logging', () => {
    let logger;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      logger = createLogger('TestLogger');
    });

    test('group method creates console group', () => {
      logger.group('Test Group');
      expect(consoleSpies.group).toHaveBeenCalled();
    });

    test('groupCollapsed method creates collapsed group', () => {
      logger.groupCollapsed('Test Group');
      expect(consoleSpies.groupCollapsed).toHaveBeenCalled();
    });

    test('groupEnd method closes group', () => {
      logger.groupEnd();
      expect(consoleSpies.groupEnd).toHaveBeenCalled();
    });

    test('group workflow works correctly', () => {
      logger.group('Parent Group');
      logger.info('Child message');
      logger.groupEnd();
      
      expect(consoleSpies.group).toHaveBeenCalledTimes(1);
      expect(consoleSpies.log).toHaveBeenCalledTimes(1);
      expect(consoleSpies.groupEnd).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance timing', () => {
    let logger;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      logger = createLogger('TestLogger');
    });

    test('time method starts timer', () => {
      logger.time('operation');
      expect(consoleSpies.time).toHaveBeenCalled();
    });

    test('timeEnd method ends timer', () => {
      logger.timeEnd('operation');
      expect(consoleSpies.timeEnd).toHaveBeenCalled();
    });

    test('timing workflow', () => {
      logger.time('testOperation');
      // Simulate some work
      logger.timeEnd('testOperation');
      
      expect(consoleSpies.time).toHaveBeenCalledWith(
        expect.stringContaining('testOperation')
      );
      expect(consoleSpies.timeEnd).toHaveBeenCalledWith(
        expect.stringContaining('testOperation')
      );
    });

    test('handles nested timers', () => {
      logger.time('outer');
      logger.time('inner');
      logger.timeEnd('inner');
      logger.timeEnd('outer');
      
      expect(consoleSpies.time).toHaveBeenCalledTimes(2);
      expect(consoleSpies.timeEnd).toHaveBeenCalledTimes(2);
    });
  });

  describe('Logger name formatting', () => {
    test('includes logger name in messages', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('ComponentName');
      
      logger.info('test');
      
      const callArgs = consoleSpies.log.mock.calls[0];
      expect(callArgs[0]).toContain('ComponentName');
    });

    test('handles empty logger name', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('');
      
      expect(() => logger.info('test')).not.toThrow();
    });

    test('handles special characters in name', () => {
      process.env.NODE_ENV = 'development';
      const logger = createLogger('My.Component:Test');
      
      expect(() => logger.info('test')).not.toThrow();
    });
  });

  describe('Error handling', () => {
    let logger;

    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      logger = createLogger('TestLogger');
    });

    test('logs Error objects correctly', () => {
      const error = new Error('Test error');
      logger.error('Error occurred', error);
      
      expect(consoleSpies.error).toHaveBeenCalled();
      const callArgs = consoleSpies.error.mock.calls[0];
      expect(callArgs).toContain(error);
    });

    test('logs error with stack trace', () => {
      const error = new Error('Test error');
      error.stack = 'Error stack trace...';
      
      logger.error('Error with stack', error);
      expect(consoleSpies.error).toHaveBeenCalled();
    });

    test('handles non-Error objects in error log', () => {
      logger.error('Custom error', { message: 'Custom error object' });
      expect(consoleSpies.error).toHaveBeenCalled();
    });
  });

  describe('Production safety', () => {
    test('does not expose sensitive info in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger('SecureLogger');
      
      // eslint-disable-next-line testing-library/no-debugging-utils -- exercises logger.debug, not Testing Library helpers.
      logger.debug('sensitive data', { apiKey: 'secret' });
      
      // Debug should not log in production
      expect(consoleSpies.log).not.toHaveBeenCalled();
    });

    test('critical errors still logged in production', () => {
      process.env.NODE_ENV = 'production';
      const logger = createLogger('ProductionLogger');
      
      logger.error('Critical error', new Error('System failure'));
      
      expect(consoleSpies.error).toHaveBeenCalled();
    });
  });

  describe('Multiple logger instances', () => {
    test('creates independent loggers', () => {
      const logger1 = createLogger('Logger1');
      const logger2 = createLogger('Logger2');
      
      expect(logger1).not.toBe(logger2);
    });

    test('loggers do not interfere with each other', () => {
      process.env.NODE_ENV = 'development';
      const logger1 = createLogger('Logger1');
      const logger2 = createLogger('Logger2');
      
      logger1.info('from logger 1');
      logger2.info('from logger 2');
      
      expect(consoleSpies.log).toHaveBeenCalledTimes(2);
    });
  });
});
