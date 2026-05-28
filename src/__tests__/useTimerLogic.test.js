import { act, renderHook } from '@testing-library/react';
import useTimerLogic from '../hooks/useTimerLogic';

function createHookProps(overrides = {}) {
  return {
    ambientSoundType: 'None',
    currentRoom: null,
    getSoundFile: jest.fn(() => null),
    initialTime: 1500,
    inputHours: '',
    inputMinutes: '',
    inputSeconds: '',
    sequence: [],
    setActiveScene: jest.fn(),
    setCurrentRound: jest.fn(),
    setCurrentStep: jest.fn(),
    setCurrentTimerScene: jest.fn(),
    setInitialTime: jest.fn(),
    setInputHours: jest.fn(),
    setInputMinutes: jest.fn(),
    setInputSeconds: jest.fn(),
    setIsRunning: jest.fn(),
    setIsWork: jest.fn(),
    setMode: jest.fn(),
    setTime: jest.fn(),
    startAmbient: jest.fn(),
    startRoomTimer: jest.fn(),
    stopAmbient: jest.fn(),
    work: 40,
    ...overrides,
  };
}

describe('useTimerLogic', () => {
  it('resets the timer back to the initial duration', () => {
    const props = createHookProps({ initialTime: 900 });
    const { result } = renderHook(() => useTimerLogic(props));

    act(() => {
      result.current.resetTimer();
    });

    expect(props.setIsRunning).toHaveBeenCalledWith(false);
    expect(props.setTime).toHaveBeenCalledWith(900);
    expect(props.stopAmbient).toHaveBeenCalledTimes(1);
  });

  it('starts a provided sequence immediately without depending on existing sequence state', () => {
    const props = createHookProps();
    const sequenceData = [{ duration: 5, unit: 'min', scene: 'focus' }];
    const { result } = renderHook(() => useTimerLogic(props));

    act(() => {
      result.current.startSequence(sequenceData);
    });

    expect(props.setMode).toHaveBeenCalledWith('sequence');
    expect(props.setCurrentStep).toHaveBeenCalledWith(0);
    expect(props.setTime).toHaveBeenCalledWith(300);
    expect(props.setIsRunning).toHaveBeenCalledWith(true);
    expect(props.setActiveScene).toHaveBeenCalledWith('focus');
    expect(props.setCurrentTimerScene).toHaveBeenCalledWith('focus');
  });
});