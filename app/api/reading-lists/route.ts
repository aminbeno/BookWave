import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import ReadingList from '@/models/ReadingList';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const lists = await ReadingList.find({ user_id: user.userId }).sort({ created_at: -1 });
    return NextResponse.json(lists.map(l => ({ ...l.toObject(), id: l._id.toString() })));
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
    const list = await ReadingList.create({ ...body, user_id: user.userId });
    return NextResponse.json({ ...list.toObject(), id: list._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
