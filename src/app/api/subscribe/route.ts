import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema for validation & sanitization
const SubscribeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(3, 'Email is required')
    .max(100, 'Email too long')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format')
    .transform((str) => str.replace(/[<>]/g, '')), // Strip angle brackets
  // Add more fields if needed:
  // name: z.string().trim().max(100).optional(),
  // link: z.string().trim().max(300).optional(),
  // message: z.string().trim().max(1000).optional(),
});

export async function POST(req: NextRequest) {
  const endpointPath = '/api/subscribe';
  const RULE_SIGN_UP_KEY = process.env.RULE_SIGN_UP_KEY;

  if (!RULE_SIGN_UP_KEY) {
    return NextResponse.json(
      { message: 'Missing RULE_SIGN_UP_KEY', path: endpointPath },
      { status: 500 },
    );
  }

  let data;
  try {
    data = await req.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    return NextResponse.json(
      { message: `Invalid JSON body ${err}`, path: endpointPath },
      { status: 400 },
    );
  }

  // Zod validation
  const parsed = SubscribeSchema.safeParse(data);
  if (!parsed.success) {
    // Return detailed errors
    return NextResponse.json(
      {
        message: 'Validation error',
        path: endpointPath,
        issues: parsed.error.issues,
      },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  // Proceed with safe/validated email
  const rulePayload = {
    tags: ['finanstidning_users'],
    update_on_duplicate: true,
    subscribers: { email },
  };

  try {
    const response = await fetch('https://app.rule.io/api/v2/subscribers/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RULE_SIGN_UP_KEY}`,
      },
      body: JSON.stringify(rulePayload),
    });

    const responseBody = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          message: responseBody.message || 'Unknown error from Rule.io',
          details: responseBody,
          path: endpointPath,
          email,
        },
        { status: response.status },
      );
    }

    return NextResponse.json(
      { success: true, path: endpointPath },
      { status: 200 },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Internal Server Error', path: endpointPath },
      { status: 500 },
    );
  }
}
