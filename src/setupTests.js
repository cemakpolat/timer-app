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

// Mock Firebase
jest.mock('firebase/app', () => ({
	initializeApp: jest.fn(() => ({})),
	getApps: jest.fn(() => []),
}));

jest.mock('firebase/database', () => ({
	getDatabase: jest.fn(() => ({})),
	ref: jest.fn(() => ({})),
	set: jest.fn(() => Promise.resolve()),
	get: jest.fn(() => Promise.resolve({ val: () => null })),
	onValue: jest.fn(() => jest.fn()),
	off: jest.fn(),
	remove: jest.fn(() => Promise.resolve()),
	serverTimestamp: jest.fn(() => ({ '.sv': 'timestamp' })),
	runTransaction: jest.fn(() => Promise.resolve({ committed: true, snapshot: { val: () => null } })),
	update: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/auth', () => ({
	getAuth: jest.fn(() => ({})),
	signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'test-uid' } })),
}));

// Mock HTMLMediaElement for audio tests
Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
	writable: true,
	value: jest.fn(),
});

Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
	writable: true,
	value: jest.fn(() => Promise.resolve()),
});
