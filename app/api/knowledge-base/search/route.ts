import { type NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import { searchKnowledgeBase } from '@/lib/embeddings';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameter
    const url = new URL(req.url);
    const query = url.searchParams.get('query');
    const limitParam = url.searchParams.get('limit');
    const minSimilarityParam = url.searchParams.get('minSimilarity');

    // Validate query parameter
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Parse optional parameters
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 5;
    const minSimilarity = minSimilarityParam ? Number.parseFloat(minSimilarityParam) : 0.7;

    // Search knowledge base
    const results = await searchKnowledgeBase(query, limit, minSimilarity);

    // Format results for response
    const formattedResults = results.map(({ chunk, source, similarity }) => ({
      id: chunk.id,
      content: chunk.content,
      sourceId: source.id,
      sourceTitle: source.title,
      sourceType: source.sourceType,
      similarity: similarity,
      metadata: {
        ...chunk.metadata,
        sourceMetadata: source.metadata
      }
    }));

    return NextResponse.json(formattedResults);
  } catch (error) {
    console.error('Error searching knowledge base:', error);
    return NextResponse.json(
      { error: 'Failed to search knowledge base' },
      { status: 500 }
    );
  }
}
