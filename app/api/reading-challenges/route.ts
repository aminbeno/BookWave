import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ReadingChallenge from '@/models/ReadingChallenge';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const challenges = await ReadingChallenge.find({ user_id: user.userId }).sort({ year: -1 });
    return NextResponse.json(challenges.map(c => ({ ...c.toObject(), id: c._id.toString() })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const body = await req.json();
    const challenge = await ReadingChallenge.create({ ...body, user_id: user.userId });
    return NextResponse.json({ ...challenge.toObject(), id: challenge._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
