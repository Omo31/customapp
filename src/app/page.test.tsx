import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Home from './page'
 
// Mock the useAuth hook
jest.mock('@/hooks/use-auth', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    isAdmin: false,
  }),
}));

// Mock the placeholder images
jest.mock('@/lib/placeholder-images', () => ({
  PlaceHolderImages: [
    {
      id: 'hero-background',
      imageUrl: 'https://picsum.photos/seed/1/600/400',
      description: 'Nigerian food',
      imageHint: 'nigerian food jollof'
    },
    {
      id: 'feature-foods',
      imageUrl: 'https://picsum.photos/seed/10/400/300',
      description: 'Authentic Nigerian Foods',
      imageHint: 'nigerian food'
    },
     {
      id: 'feature-fresh',
      imageUrl: 'https://picsum.photos/seed/11/400/300',
      description: 'Freshness Guaranteed',
      imageHint: 'fresh vegetables'
    },
     {
      id: 'feature-delivery',
      imageUrl: 'https://picsum.photos/seed/12/400/300',
      description: 'Fast & Reliable Delivery',
      imageHint: 'delivery box'
    }
  ],
}));

describe('Home', () => {
  it('renders a heading', () => {
    render(<Home />)
 
    const heading = screen.getByRole('heading', {
      name: /Authentic Nigerian Foods, Delivered to You/i,
    })
 
    expect(heading).toBeInTheDocument()
  })
})
