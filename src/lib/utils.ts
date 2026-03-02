import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function getDeductibilityColor(status: string | null | undefined): string {
  switch (status) {
    case 'deductible':
      return 'text-green-500'
    case 'likely_deductible':
      return 'text-amber-500'
    case 'not_deductible':
      return 'text-red-500'
    case 'partial':
      return 'text-amber-400'
    default:
      return 'text-gray-400'
  }
}

export function getDeductibilityBadgeVariant(status: string | null | undefined) {
  switch (status) {
    case 'deductible':
      return 'deductible'
    case 'likely_deductible':
      return 'likely'
    case 'not_deductible':
      return 'nondeductible'
    case 'partial':
      return 'partial'
    default:
      return 'pending'
  }
}

export function getDeductibilityLabel(status: string | null | undefined): string {
  switch (status) {
    case 'deductible':
      return '✅ Deductible'
    case 'likely_deductible':
      return '🟡 Likely Deductible'
    case 'not_deductible':
      return '🔴 Not Deductible'
    case 'partial':
      return '⚠️ Partially Deductible'
    default:
      return '⏳ Pending Analysis'
  }
}

export const IRS_CATEGORIES = [
  'Advertising',
  'Car & Truck Expenses',
  'Commissions & Fees',
  'Contract Labor',
  'Depletion',
  'Depreciation',
  'Employee Benefit Programs',
  'Insurance',
  'Interest (Mortgage)',
  'Interest (Other)',
  'Legal & Professional Services',
  'Office Expense',
  'Pension & Profit Sharing',
  'Rent (Machinery/Equipment)',
  'Rent (Other Business Property)',
  'Repairs & Maintenance',
  'Supplies',
  'Taxes & Licenses',
  'Travel',
  'Meals (50% Deductible)',
  'Utilities',
  'Wages',
  'Other Expenses',
] as const

export const OCCUPATIONS = [
  'Rideshare / Delivery Driver (Uber, Lyft, DoorDash)',
  'Freelance Designer / Photographer',
  'Freelance Developer / Engineer',
  'Real Estate Agent / Broker',
  'Consultant',
  'Content Creator / Influencer',
  'Musician / Artist',
  'Personal Trainer / Coach',
  'Therapist / Healthcare Provider',
  'Sales Representative',
  'Writer / Journalist',
  'Marketing Specialist',
  'Virtual Assistant',
  'Tutor / Educator',
  'Handyman / Contractor',
  'Other',
] as const

export const TAX_BRACKETS = [
  '10% (up to ~$11K)',
  '12% (~$11K–$44K)',
  '22% (~$44K–$95K)',
  '24% (~$95K–$201K)',
  '32% (~$201K–$383K)',
  '35% (~$383K–$578K)',
  '37% (over ~$578K)',
] as const
