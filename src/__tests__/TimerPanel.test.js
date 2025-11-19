import { render, screen, fireEvent } from '@testing-library/react';
import TimerPanel from '../components/panels/TimerPanel';

describe('TimerPanel Component', () => {
  const mockProps = {
    theme: {
      card: '#1a1a1a',
      text: '#ffffff',
      accent: '#3b82f6'
    },
    inputHours: 0,
    inputMinutes: 25,
    inputSeconds: 0,
    setInputHours: jest.fn(),
    setInputMinutes: jest.fn(),
    setInputSeconds: jest.fn(),
    startTimer: jest.fn(),
    shareCurrentTimer: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders timer input fields', () => {
    render(<TimerPanel {...mockProps} />);
    
    const hourInput = screen.getByPlaceholderText('HH');
    const minuteInput = screen.getByPlaceholderText('MM');
    const secondInput = screen.getByPlaceholderText('SS');

    expect(hourInput).toBeInTheDocument();
    expect(minuteInput).toBeInTheDocument();
    expect(secondInput).toBeInTheDocument();
  });

  test('displays current timer values', () => {
    render(<TimerPanel {...mockProps} />);
    
    const minuteInput = screen.getByPlaceholderText('MM');
    expect(minuteInput.value).toBe('25');
  });

  test('calls setInputMinutes when minute input changes', () => {
    render(<TimerPanel {...mockProps} />);
    
    const minuteInput = screen.getByPlaceholderText('MM');
    fireEvent.change(minuteInput, { target: { value: '30' } });

    expect(mockProps.setInputMinutes).toHaveBeenCalled();
  });

  test('renders all quick preset buttons', () => {
    render(<TimerPanel {...mockProps} />);
    
    expect(screen.getByText('10s')).toBeInTheDocument();
    expect(screen.getByText('30s')).toBeInTheDocument();
    expect(screen.getByText('1m')).toBeInTheDocument();
    expect(screen.getByText('5m')).toBeInTheDocument();
    expect(screen.getByText('10m')).toBeInTheDocument();
    expect(screen.getByText('15m')).toBeInTheDocument();
    expect(screen.getByText('25m')).toBeInTheDocument();
    expect(screen.getByText('45m')).toBeInTheDocument();
  });

  test('calls startTimer with correct value when preset button clicked', () => {
    render(<TimerPanel {...mockProps} />);
    
    const preset25m = screen.getByText('25m');
    fireEvent.click(preset25m);

    expect(mockProps.startTimer).toHaveBeenCalledWith(1500); // 25 * 60 = 1500 seconds
  });

  test('shows share button when timer values are set', () => {
    const propsWithValues = {
      ...mockProps,
      inputMinutes: 25
    };

    render(<TimerPanel {...propsWithValues} />);
    
    const shareButton = screen.getByText('Share');
    expect(shareButton).toBeInTheDocument();
  });

  test('does not show share button when all values are zero', () => {
    const propsWithZeros = {
      ...mockProps,
      inputHours: 0,
      inputMinutes: 0,
      inputSeconds: 0
    };

    render(<TimerPanel {...propsWithZeros} />);
    
    const shareButton = screen.queryByText('Share');
    expect(shareButton).not.toBeInTheDocument();
  });

  test('starts timer when play button clicked with values', () => {
    const propsWithValues = {
      ...mockProps,
      inputHours: 1,
      inputMinutes: 30,
      inputSeconds: 45
    };

    render(<TimerPanel {...propsWithValues} />);
    
    const playButton = screen.getByTestId('start-timer-button');
    fireEvent.click(playButton);
    // 1 hour + 30 min + 45 sec = 3600 + 1800 + 45 = 5445 seconds
    expect(mockProps.startTimer).toHaveBeenCalledWith(5445);
  });
});
