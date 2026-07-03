import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorState } from './error-state';

describe('ErrorState', () => {
  it('renders default text correctly', () => {
    render(<ErrorState />);
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('We couldn\'t load this content. Please try again.')).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(
      <ErrorState 
        title="Custom Error" 
        message="This is a custom error message" 
      />
    );
    
    expect(screen.getByText('Custom Error')).toBeInTheDocument();
    expect(screen.getByText('This is a custom error message')).toBeInTheDocument();
  });

  it('calls onRetry when button is clicked', () => {
    const onRetryMock = jest.fn();
    render(<ErrorState onRetry={onRetryMock} />);
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });
});
