import { render, screen } from '@testing-library/react';
import { EmptyState } from './empty-state';

describe('EmptyState', () => {
  it('renders the title correctly', () => {
    render(<EmptyState title="No items found" />);
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
  });

  it('renders the description if provided', () => {
    render(
      <EmptyState 
        title="No items found" 
        description="Please try another search" 
      />
    );
    
    expect(screen.getByText('No items found')).toBeInTheDocument();
    expect(screen.getByText('Please try another search')).toBeInTheDocument();
  });
});
