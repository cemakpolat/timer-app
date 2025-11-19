import { render, screen, fireEvent } from '@testing-library/react';
import IntervalPanel from '../components/panels/IntervalPanel';

describe('IntervalPanel Component', () => {
  const mockProps = {
    theme: {
      card: '#1a1a1a',
      text: '#ffffff',
      accent: '#3b82f6'
    },
    work: 1500, // 25 minutes in seconds
    rest: 300,  // 5 minutes in seconds
    rounds: 4,
    setWork: jest.fn(),
    setRest: jest.fn(),
    setRounds: jest.fn(),
    startInterval: jest.fn(),
    shareCurrentTimer: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders interval input fields', () => {
    render(<IntervalPanel {...mockProps} />);
    
    expect(screen.getByText('Work (sec)')).toBeInTheDocument();
    expect(screen.getByText('Rest (sec)')).toBeInTheDocument();
    expect(screen.getByText('Rounds')).toBeInTheDocument();
  });

  test('displays current interval values', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs[0].value).toBe('1500'); // work
    expect(inputs[1].value).toBe('300');  // rest
    expect(inputs[2].value).toBe('4');    // rounds
  });

  test('calls setWork when work input changes', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const workInput = screen.getAllByRole('spinbutton')[0];
    fireEvent.change(workInput, { target: { value: '1800' } });

    expect(mockProps.setWork).toHaveBeenCalled();
  });

  test('calls setRest when rest input changes', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const restInput = screen.getAllByRole('spinbutton')[1];
    fireEvent.change(restInput, { target: { value: '600' } });

    expect(mockProps.setRest).toHaveBeenCalled();
  });

  test('calls setRounds when rounds input changes', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const roundsInput = screen.getAllByRole('spinbutton')[2];
    fireEvent.change(roundsInput, { target: { value: '6' } });

    expect(mockProps.setRounds).toHaveBeenCalled();
  });

  test('renders Start Interval button', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const startButton = screen.getByText('Start Interval');
    expect(startButton).toBeInTheDocument();
  });

  test('calls startInterval when button clicked', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const startButton = screen.getByText('Start Interval');
    fireEvent.click(startButton);

    expect(mockProps.startInterval).toHaveBeenCalledTimes(1);
  });

  test('renders share button', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const shareButton = screen.getByText('Share');
    expect(shareButton).toBeInTheDocument();
  });

  test('calls shareCurrentTimer when share button clicked', () => {
    render(<IntervalPanel {...mockProps} />);
    
    const shareButton = screen.getByText('Share');
    fireEvent.click(shareButton);

    expect(mockProps.shareCurrentTimer).toHaveBeenCalledTimes(1);
  });

  test('has correct header text', () => {
    render(<IntervalPanel {...mockProps} />);
    
    expect(screen.getByText('Interval Timer')).toBeInTheDocument();
  });
});
