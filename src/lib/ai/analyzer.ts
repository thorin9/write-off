import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export type DeductibilityStatus = 'deductible' | 'likely_deductible' | 'not_deductible' | 'partial'

export type ExpenseAnalysis = {
  category: string
  deductibility: DeductibilityStatus
  confidence: number
  explanation: string
  irs_reference: string
  partial_percentage?: number
}

const SYSTEM_PROMPT = `You are a US tax expert specializing in Schedule C deductions for self-employed and 1099 workers. You analyze expenses and determine their deductibility under IRS rules, primarily IRS Publication 535 (Business Expenses).

For each expense, you must return a JSON object with exactly these fields:
{
  "category": "<IRS Schedule C category>",
  "deductibility": "<deductible|likely_deductible|not_deductible|partial>",
  "confidence": <0-100>,
  "explanation": "<1-2 sentence plain English explanation>",
  "irs_reference": "<relevant IRS publication or rule>",
  "partial_percentage": <number or null>
}

IRS Schedule C Categories: Advertising, Car & Truck Expenses, Commissions & Fees, Contract Labor, Depreciation, Insurance, Interest, Legal & Professional Services, Office Expense, Rent/Lease, Repairs & Maintenance, Supplies, Taxes & Licenses, Travel, Meals (50% Deductible), Utilities, Wages, Other Expenses.

Rules:
- Meals with business purpose: 50% deductible (partial)
- Home office: deductible only if used EXCLUSIVELY and REGULARLY for business
- Personal expenses: not deductible
- Mixed-use items: partially deductible (estimate business percentage)
- Vehicle mileage: deductible for business travel
- Subscriptions/software used for work: deductible
- Always be conservative — if unsure, use likely_deductible or partial

Return ONLY the JSON object, no markdown, no explanation outside the JSON.`

export async function analyzeExpense(
  merchant: string,
  amount: number,
  description: string | null | undefined,
  occupation: string | null | undefined
): Promise<ExpenseAnalysis> {
  const userContext = occupation ? `The user's occupation is: ${occupation}.` : ''

  const prompt = `${userContext}

Analyze this expense for tax deductibility:
- Merchant: ${merchant}
- Amount: $${amount.toFixed(2)}
- Description: ${description || merchant}

Determine the IRS Schedule C category and deductibility status.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: prompt },
    ],
    max_tokens: 400,
    temperature: 0.1,
    response_format: { type: 'json_object' },
  })

  const content = response.choices[0].message.content || '{}'

  try {
    const result = JSON.parse(content) as ExpenseAnalysis
    if (!result.category || !result.deductibility || result.confidence === undefined) {
      throw new Error('Invalid response structure')
    }
    return result
  } catch {
    return {
      category: 'Other Expenses',
      deductibility: 'likely_deductible',
      confidence: 50,
      explanation: 'Could not automatically classify this expense. Please review manually.',
      irs_reference: 'IRS Publication 535',
    }
  }
}

export async function analyzeExpenseBatch(
  expenses: Array<{ id: string; merchant: string; amount: number; description?: string | null }>,
  occupation: string | null | undefined
): Promise<Map<string, ExpenseAnalysis>> {
  const results = new Map<string, ExpenseAnalysis>()

  const chunks: typeof expenses[] = []
  for (let i = 0; i < expenses.length; i += 5) {
    chunks.push(expenses.slice(i, i + 5))
  }

  for (const chunk of chunks) {
    await Promise.all(
      chunk.map(async (expense) => {
        const analysis = await analyzeExpense(
          expense.merchant,
          expense.amount,
          expense.description,
          occupation
        )
        results.set(expense.id, analysis)
      })
    )
  }

  return results
}
