// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock indexedDB and idb's openDB for Node.js test environment
if (typeof indexedDB === 'undefined') {
	global.indexedDB = {
		open: jest.fn(),
		deleteDatabase: jest.fn(),
		cmp: jest.fn(),
	};
}

// Mock idb's openDB to return a fake db object
jest.mock('idb', () => {
	const fakeDB = {
		put: jest.fn(),
		get: jest.fn(),
		delete: jest.fn(),
		clear: jest.fn(),
		getAllKeys: jest.fn(),
	};
	return {
		openDB: jest.fn(() => Promise.resolve(fakeDB)),
	};
});
