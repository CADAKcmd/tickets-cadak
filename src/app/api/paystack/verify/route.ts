import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const reference = req.nextUrl.searchParams.get('reference');
    if (!reference) {
      return NextResponse.json({ error: 'Missing reference' }, { status: 400 });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ error: 'PAYSTACK_SECRET_KEY missing' }, { status: 500 });
    }

    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const data = await verifyRes.json();

    if (!verifyRes.ok || !data?.status) {
      const msg = data?.message || 'Verify failed';
      return NextResponse.json({ ok: false, error: msg }, { status: 400 });
    }

    const isSuccess = data.data?.status === 'success';
    return NextResponse.json({ ok: isSuccess, data: data.data });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Server error' }, { status: 500 });
  }
}