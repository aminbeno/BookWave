import { NextRequest, NextResponse } from 'next/server';
import { connectMongoDB } from '@/lib/mongodb';
import JournalEntry from '@/models/JournalEntry';
import { getAuthUser } from '@/lib/auth-helper';

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    await connectMongoDB();
    const { searchParams } = new URL(req.url);
    const bookId = searchParams.get('book_id');

    const query: any = { user_id: user.userId };
    if (bookId) query.book_id = bookId;

    const entries = await JournalEntry.find(query).sort({ created_at: -1 });
    return NextResponse.json(entries.map(e => ({ ...e.toObject(), id: e._id.toString() })));
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
    const entry = await JournalEntry.create({ ...body, user_id: user.userId });
    return NextResponse.json({ ...entry.toObject(), id: entry._id.toString() }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
