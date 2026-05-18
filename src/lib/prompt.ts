import Anthropic from '@anthropic-ai/sdk'
import type { Plan } from './db'

const SYSTEM = `You are a focused day-planning assistant. The user gave you their calendar for today, the last 24 hours of email, and the Linear issues currently in progress. Your job is to produce a tight, actionable plan: top priorities (which should reference open issues when they exist), suggested time blocks that respect existing meetings, and a triage queue of emails that need a response today. Be specific. Don't invent meetings. Don't suggest blocks that overlap real events. When an in-progress Linear issue is the most important thing on the user's plate, name it in the priorities by its identifier (e.g. LEA-180).`

const planTool = {
  name: 'render_day_plan',
  description: 'Return the structured day plan for the user.',
  input_schema: {
    type: 'object' as const,
    properties: {
      priorities: {
        type: 'array',
        items: { type: 'string' },
        minItems: 1,
        maxItems: 5,
        description: 'Top 1–5 priorities for the day, in plain language.',
      },
      blocks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            time: { type: 'string', description: 'Time range, e.g. "9:30–10:30"' },
            what: { type: 'string', description: 'What the user should do.' },
            why: {
              type: 'string',
              description: 'One-line rationale tied to a real event or email.',
            },
          },
          required: ['time', 'what', 'why'],
        },
      },
      triage: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            subject: { type: 'string' },
            reason: {
              type: 'string',
              description: 'Why this email needs attention today.',
            },
            urgency: { type: 'string', enum: ['high', 'medium', 'low'] },
          },
          required: ['from', 'subject', 'reason', 'urgency'],
        },
      },
    },
    required: ['priorities', 'blocks', 'triage'],
  },
}

export async function generatePlan(input: {
  events: unknown[]
  messages: unknown[]
  issues: unknown[]
}): Promise<Plan> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY not set. Set it in your Leash dashboard secrets.')
  }
  const anthropic = new Anthropic({ apiKey })
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: SYSTEM,
    tools: [planTool as never],
    tool_choice: { type: 'tool', name: 'render_day_plan' },
    messages: [
      {
        role: 'user',
        content: `Today's calendar events:\n${JSON.stringify(input.events, null, 2)}\n\nLast 24h of email:\n${JSON.stringify(input.messages, null, 2)}\n\nOpen Linear issues assigned to you (in progress):\n${JSON.stringify(input.issues, null, 2)}\n\nProduce my day plan.`,
      },
    ],
  })
  const block = response.content.find((b) => b.type === 'tool_use')
  if (!block || block.type !== 'tool_use') {
    throw new Error('Claude did not return a tool_use block')
  }
  return block.input as Plan
}
