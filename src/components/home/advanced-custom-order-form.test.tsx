
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AdvancedCustomOrderForm } from './advanced-custom-order-form';

// Mock dependencies
jest.mock('@/hooks/use-auth.tsx', () => ({
  useAuth: () => ({
    user: { 
        uid: 'test-user-id', 
        displayName: 'Test User', 
        email: 'test@example.com' 
    },
  }),
}));

jest.mock('@/firebase', () => ({
  ...jest.requireActual('@/firebase'),
  useFirestore: () => ({}),
  useDoc: () => ({
    data: {
      unitsOfMeasure: [{ name: 'kg' }, { name: 'Piece' }],
      optionalServices: [{ id: 'wrapping', label: 'Gift Wrapping' }],
      shippingZones: [{ name: 'Ikeja', fee: 1500 }],
    },
    loading: false,
  }),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

// Mock firebase/firestore
jest.mock('firebase/firestore', () => ({
  ...jest.requireActual('firebase/firestore'),
  writeBatch: jest.fn(() => ({
    set: jest.fn(),
    commit: jest.fn().mockResolvedValue(null),
  })),
  doc: jest.fn(),
  collection: jest.fn(),
  serverTimestamp: jest.fn(),
}));

describe('AdvancedCustomOrderForm', () => {
  it('renders the form and allows user to fill it out', async () => {
    render(<AdvancedCustomOrderForm />);

    // Check for a few key fields to ensure it rendered
    expect(screen.getByText('Items for Your Quote')).toBeInTheDocument();
    expect(screen.getByText('Your Contact Information')).toBeInTheDocument();

    // Simulate filling out an item
    const itemNameInput = screen.getByLabelText('Item Name');
    fireEvent.change(itemNameInput, { target: { value: 'Fresh Tomatoes' } });
    expect(itemNameInput).toHaveValue('Fresh Tomatoes');
    
    // Simulate filling out contact info
    const phoneInput = screen.getByLabelText('Phone Number');
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    expect(phoneInput).toHaveValue('1234567890');

    // Simulate selecting a delivery option
    const deliveryRadio = screen.getByLabelText('Delivery within Lagos');
    fireEvent.click(deliveryRadio);
    
    // Wait for the LGA dropdown to appear and interact with it
    await waitFor(() => {
        expect(screen.getByText('Select LGA')).toBeInTheDocument();
    });
    
    const lgaSelectTrigger = screen.getByText('Select your Local Government Area');
    fireEvent.mouseDown(lgaSelectTrigger);

    await waitFor(() => {
        const lgaOption = screen.getByText('Ikeja (₦1500)');
        fireEvent.click(lgaOption);
    });

    // Check that the address field is now visible
    const addressTextarea = screen.getByLabelText('Full Shipping Address');
    expect(addressTextarea).toBeInTheDocument();
  });
});
