import {
  showToast,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  handleError,
  withErrorHandling,
  validateOrToast
} from '../utils/toastUtils';

describe('toastUtils', () => {
  let dispatchEventSpy;

  beforeEach(() => {
    // Spy on window.dispatchEvent to verify CustomEvents
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    dispatchEventSpy.mockRestore();
  });

  describe('showToast', () => {
    test('dispatches custom event with message', () => {
      showToast('Test message');
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('app-toast');
      expect(event.detail.message).toBe('Test message');
    });

    test('dispatches with default type info', () => {
      showToast('Info message');
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('info');
    });

    test('dispatches with custom type', () => {
      showToast('Success message', 'success');
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('success');
    });

    test('dispatches with custom duration', () => {
      showToast('Message', 'info', 5000);
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.ttl).toBe(5000);
    });

    test('uses default duration when not specified', () => {
      showToast('Message');
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.ttl).toBe(3000);
    });
  });

  describe('showSuccess', () => {
    test('dispatches toast with success type', () => {
      showSuccess('Operation successful');
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('success');
      expect(event.detail.message).toContain('Operation successful');
    });

    test('uses custom duration if provided', () => {
      showSuccess('Success!', 2000);
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.ttl).toBe(2000);
    });
  });

  describe('showError', () => {
    test('dispatches toast with error type', () => {
      dispatchEventSpy.mockClear();
      showError('Something went wrong');
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('error');
      expect(event.detail.message).toContain('Something went wrong');
    });

    test('uses longer default duration for errors', () => {
      dispatchEventSpy.mockClear();
      showError('Error message');
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.ttl).toBeGreaterThan(3000);
    });
  });

  describe('showInfo', () => {
    test('dispatches toast with info type', () => {
      dispatchEventSpy.mockClear();
      showInfo('Here is some information');
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('info');
      expect(event.detail.message).toContain('Here is some information');
    });
  });

  describe('showWarning', () => {
    test('dispatches toast with warning type', () => {
      dispatchEventSpy.mockClear();
      showWarning('Be careful!');
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('warning');
      expect(event.detail.message).toContain('Be careful!');
    });
  });

  describe('handleError', () => {
    test('shows error toast with message', () => {
      const error = new Error('Test error');
      handleError(error);
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('error');
      expect(event.detail.message).toContain('Test error');
    });

    test('uses custom context in error message', () => {
      const error = new Error('Failed');
      handleError(error, 'saving data');
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.message).toContain('saving data');
      expect(event.detail.message).toContain('Failed');
    });

    test('handles string errors', () => {
      handleError('String error message');
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.message).toContain('String error message');
    });

    test('handles errors without message', () => {
      handleError({});
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.message).toBeDefined();
    });
  });

  describe('withErrorHandling', () => {
    test('executes function successfully', async () => {
      dispatchEventSpy.mockClear();
      const fn = jest.fn().mockResolvedValue('result');
      const result = await withErrorHandling(fn);
      
      expect(fn).toHaveBeenCalled();
      expect(result).toBe('result');
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    test('catches and handles errors', async () => {
      dispatchEventSpy.mockClear();
      const error = new Error('Function failed');
      const fn = jest.fn().mockRejectedValue(error);
      
      const result = await withErrorHandling(fn);
      
      expect(result).toBeUndefined();
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('error');
    });

    test('uses custom error context', async () => {
      dispatchEventSpy.mockClear();
      const fn = jest.fn().mockRejectedValue(new Error('Failed'));
      
      await withErrorHandling(fn, { context: 'loading data' });
      
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.message).toBeDefined();
    });

    test('shows success message on success', async () => {
      dispatchEventSpy.mockClear();
      const fn = jest.fn().mockResolvedValue('ok');
      
      await withErrorHandling(fn, { successMessage: 'Success!', showSuccess: true });
      
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('success');
    });

    test('handles synchronous errors', async () => {
      dispatchEventSpy.mockClear();
      const fn = jest.fn().mockImplementation(() => {
        throw new Error('Sync error');
      });
      
      const result = await withErrorHandling(fn);
      
      expect(result).toBeUndefined();
      expect(dispatchEventSpy).toHaveBeenCalled();
    });
  });

  describe('validateOrToast', () => {
    test('returns true when validation passes', () => {
      dispatchEventSpy.mockClear();
      const result = validateOrToast(true, 'Error message');
      
      expect(result).toBe(true);
      expect(dispatchEventSpy).not.toHaveBeenCalled();
    });

    test('shows error toast when validation fails', () => {
      dispatchEventSpy.mockClear();
      const result = validateOrToast(false, 'Validation failed');
      
      expect(result).toBe(false);
      expect(dispatchEventSpy).toHaveBeenCalled();
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.detail.type).toBe('error');
    });

    test('handles truthy conditions', () => {
      expect(validateOrToast('string', 'Error')).toBe(true);
      expect(validateOrToast(1, 'Error')).toBe(true);
      expect(validateOrToast([], 'Error')).toBe(true);
      expect(validateOrToast({}, 'Error')).toBe(true);
    });

    test('handles falsy conditions', () => {
      dispatchEventSpy.mockClear();
      expect(validateOrToast(false, 'Error')).toBe(false);
      expect(validateOrToast(0, 'Error')).toBe(false);
      expect(validateOrToast('', 'Error')).toBe(false);
      expect(validateOrToast(null, 'Error')).toBe(false);
      expect(validateOrToast(undefined, 'Error')).toBe(false);
      
      expect(dispatchEventSpy).toHaveBeenCalledTimes(5);
    });

    test('works with function conditions', () => {
      dispatchEventSpy.mockClear();
      const condition = () => false;
      const result = validateOrToast(condition(), 'Must be true');
      
      expect(result).toBe(false);
      expect(dispatchEventSpy).toHaveBeenCalled();
    });
  });

  describe('Toast event structure', () => {
    test('events are CustomEvent instances', () => {
      dispatchEventSpy.mockClear();
      showToast('Test');
      
      if (dispatchEventSpy.mock.calls.length > 0) {
        const event = dispatchEventSpy.mock.calls[0][0];
        expect(event).toBeInstanceOf(CustomEvent);
      } else {
        expect(dispatchEventSpy).toHaveBeenCalled();
      }
    });

    test('events have detail property', () => {
      dispatchEventSpy.mockClear();
      showSuccess('Success');
      
      if (dispatchEventSpy.mock.calls.length > 0) {
        const event = dispatchEventSpy.mock.calls[0][0];
        expect(event.detail).toBeDefined();
        expect(typeof event.detail).toBe('object');
      } else {
        expect(dispatchEventSpy).toHaveBeenCalled();
      }
    });

    test('detail contains required fields', () => {
      dispatchEventSpy.mockClear();
      showInfo('Info', 4000);
      
      if (dispatchEventSpy.mock.calls.length > 0) {
        const event = dispatchEventSpy.mock.calls[0][0];
        expect(event.detail).toHaveProperty('message');
        expect(event.detail).toHaveProperty('type');
        expect(event.detail).toHaveProperty('ttl');
      } else {
        expect(dispatchEventSpy).toHaveBeenCalled();
      }
    });
  });
});
