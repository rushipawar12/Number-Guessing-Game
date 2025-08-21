import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import App from './App'

describe('Number Guessing Game', () => {
  beforeEach(() => {
    // Clear localStorage mocks
    vi.clearAllMocks()
  })

  it('renders the game title', () => {
    render(<App />)
    expect(screen.getByText('🎯 Number Guessing Game')).toBeInTheDocument()
  })

  it('shows difficulty selector', () => {
    render(<App />)
    expect(screen.getByLabelText('Choose Difficulty:')).toBeInTheDocument()
    expect(screen.getByDisplayValue('Medium (1-100)')).toBeInTheDocument()
  })

  it('shows game range and attempts', () => {
    render(<App />)
    expect(screen.getByText('Range: 1 - 100')).toBeInTheDocument()
    expect(screen.getByText('Attempts: 0')).toBeInTheDocument()
  })

  it('allows user to enter a guess', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Enter your guess')
    fireEvent.change(input, { target: { value: '50' } })
    expect(input.value).toBe('50')
  })

  it('provides feedback for guesses', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Enter your guess')
    const button = screen.getByText('Guess!')
    
    fireEvent.change(input, { target: { value: '1' } })
    fireEvent.click(button)
    
    expect(screen.getByText('Attempts: 1')).toBeInTheDocument()
    // Should show either "Too low!" or "Too high!" or "Congratulations!"
    const feedback = screen.getByText(/Too low!|Too high!|Congratulations!/)
    expect(feedback).toBeInTheDocument()
  })

  it('changes difficulty and updates range', () => {
    render(<App />)
    const select = screen.getByLabelText('Choose Difficulty:')
    
    fireEvent.change(select, { target: { value: 'easy' } })
    expect(screen.getByText('Range: 1 - 50')).toBeInTheDocument()
    
    fireEvent.change(select, { target: { value: 'hard' } })
    expect(screen.getByText('Range: 1 - 200')).toBeInTheDocument()
  })

  it('validates input range', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Enter your guess')
    const button = screen.getByText('Guess!')
    
    // Test invalid input (out of range)
    fireEvent.change(input, { target: { value: '999' } })
    fireEvent.click(button)
    
    expect(screen.getByText(/Please enter a valid number between/)).toBeInTheDocument()
  })

  it('disables difficulty selector after first guess', () => {
    render(<App />)
    const input = screen.getByPlaceholderText('Enter your guess')
    const button = screen.getByText('Guess!')
    const select = screen.getByLabelText('Choose Difficulty:')
    
    expect(select).not.toBeDisabled()
    
    fireEvent.change(input, { target: { value: '50' } })
    fireEvent.click(button)
    
    expect(select).toBeDisabled()
  })
})
