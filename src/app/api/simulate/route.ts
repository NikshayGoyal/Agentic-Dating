import { NextRequest, NextResponse } from 'next/server';
import { runDatingSimulation } from '@/lib/agents/orchestrator';
import { generateRankings } from '@/lib/agents/ranker';
import { getAllPeople } from '@/lib/db';

export const maxDuration = 300; // 5 minutes max

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { personIds } = body;

    // If no specific IDs provided, use all people
    const people = getAllPeople() as Array<{ id: string }>;
    const ids = personIds || people.map((p) => p.id);

    if (ids.length < 2) {
      return NextResponse.json(
        { error: 'Need at least 2 people to run dating simulation' },
        { status: 400 }
      );
    }

    console.log(`[Simulate] Starting dating simulation for ${ids.length} people...`);

    // Run dating simulation
    await runDatingSimulation(ids);

    // Generate rankings
    console.log(`[Simulate] Generating rankings...`);
    await generateRankings(ids);

    console.log(`[Simulate] Simulation complete!`);

    return NextResponse.json({
      success: true,
      message: `Dating simulation complete for ${ids.length} people`,
      peopleCount: ids.length,
    });
  } catch (error) {
    console.error('Simulation error:', error);
    return NextResponse.json(
      { error: 'Simulation failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
