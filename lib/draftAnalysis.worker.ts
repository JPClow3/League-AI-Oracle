/**
 * Draft Analysis Web Worker
 * Performs heavy computations off the main thread for better performance
 *
 * Handles:
 * - Team composition analysis
 * - Synergy calculations
 * - Counter matchup analysis
 * - Win rate predictions
 */

interface DraftAnalysisRequest {
  type: 'analyzeTeam' | 'calculateSynergy' | 'findCounters' | 'predictWinRate';
  data: any;
}

interface DraftAnalysisResponse {
  type: string;
  result: any;
  timestamp: number;
}

// Champion data cache
let championData: any = null;

/**
 * Analyze team composition
 */
function analyzeTeamComposition(team: any[]) {
  const analysis = {
    roles: team.map(champ => champ.role),
    damageTypes: {
      physical: 0,
      magical: 0,
      true: 0,
    },
    crowdControl: 0,
    tankiness: 0,
    mobility: 0,
    waveclear: 0,
    poke: 0,
    engage: 0,
    disengage: 0,
  };

  // Analyze each champion
  team.forEach(champion => {
    // Damage type distribution
    analysis.damageTypes.physical += champion.damageType?.physical || 0;
    analysis.damageTypes.magical += champion.damageType?.magical || 0;
    analysis.damageTypes.true += champion.damageType?.true || 0;

    // Team attributes
    analysis.crowdControl += champion.crowdControl || 0;
    analysis.tankiness += champion.tankiness || 0;
    analysis.mobility += champion.mobility || 0;
    analysis.waveclear += champion.waveclear || 0;
    analysis.poke += champion.poke || 0;
    analysis.engage += champion.engage || 0;
    analysis.disengage += champion.disengage || 0;
  });

  // Normalize scores
  const teamSize = team.length || 1;
  Object.keys(analysis).forEach(key => {
    if (key !== 'roles' && key !== 'damageTypes') {
      (analysis as any)[key] = (analysis as any)[key] / teamSize;
    }
  });

  // Calculate overall team strength
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (analysis.crowdControl > 7) strengths.push('Excellent crowd control');
  if (analysis.crowdControl < 4) weaknesses.push('Limited crowd control');

  if (analysis.tankiness > 7) strengths.push('High tankiness');
  if (analysis.tankiness < 3) weaknesses.push('Squishy composition');

  if (analysis.engage > 7) strengths.push('Strong engage');
  if (analysis.engage < 3) weaknesses.push('Weak engage');

  const physicalPercent = analysis.damageTypes.physical / (analysis.damageTypes.physical + analysis.damageTypes.magical || 1);
  if (physicalPercent > 0.7) weaknesses.push('Heavy physical damage (enemy can stack armor)');
  if (physicalPercent < 0.3) weaknesses.push('Heavy magic damage (enemy can stack MR)');

  return {
    ...analysis,
    strengths,
    weaknesses,
    balanced: Math.abs(physicalPercent - 0.5) < 0.2,
  };
}

/**
 * Calculate synergy between champions
 */
function calculateSynergy(champions: any[]) {
  const synergyScore = {
    total: 0,
    pairs: [] as { champ1: string; champ2: string; score: number; reason: string }[],
  };

  // Check each pair of champions
  for (let i = 0; i < champions.length; i++) {
    for (let j = i + 1; j < champions.length; j++) {
      const champ1 = champions[i];
      const champ2 = champions[j];

      let pairScore = 0;
      const reasons: string[] = [];

      // CC chain synergy
      if (champ1.crowdControl > 6 && champ2.crowdControl > 6) {
        pairScore += 2;
        reasons.push('CC chain potential');
      }

      // Engage + Follow-up
      if (champ1.engage > 7 && champ2.damage > 7) {
        pairScore += 3;
        reasons.push('Engage + Damage follow-up');
      }

      // Protect the carry
      if (champ1.tankiness > 7 && champ2.damage > 8) {
        pairScore += 2;
        reasons.push('Tank protects carry');
      }

      // Poke composition
      if (champ1.poke > 7 && champ2.poke > 7) {
        pairScore += 2;
        reasons.push('Poke synergy');
      }

      // Split push + teamfight
      if (champ1.splitPush > 7 && champ2.teamfight > 7) {
        pairScore += 2;
        reasons.push('Split push + Teamfight pressure');
      }

      if (pairScore > 0) {
        synergyScore.pairs.push({
          champ1: champ1.name,
          champ2: champ2.name,
          score: pairScore,
          reason: reasons.join(', '),
        });
        synergyScore.total += pairScore;
      }
    }
  }

  return synergyScore;
}

/**
 * Find counter champions
 */
function findCounters(enemyTeam: any[], allChampions: any[]) {
  const counters = allChampions.map(champion => {
    let counterScore = 0;

    enemyTeam.forEach(enemy => {
      // Mobility counters immobile champions
      if (champion.mobility > 7 && enemy.mobility < 4) {
        counterScore += 2;
      }

      // Tanks counter assassins
      if (champion.tankiness > 8 && enemy.assassin) {
        counterScore += 3;
      }

      // Disengage counters engage
      if (champion.disengage > 7 && enemy.engage > 7) {
        counterScore += 2;
      }

      // Waveclear counters siege
      if (champion.waveclear > 8 && enemy.siege > 7) {
        counterScore += 2;
      }

      // Direct matchup advantage
      if (champion.counters?.includes(enemy.name)) {
        counterScore += 5;
      }
    });

    return {
      champion: champion.name,
      score: counterScore,
      role: champion.role,
    };
  });

  return counters
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);
}

/**
 * Predict win rate based on composition
 */
function predictWinRate(blueTeam: any[], redTeam: any[]) {
  const blueAnalysis = analyzeTeamComposition(blueTeam);
  const redAnalysis = analyzeTeamComposition(redTeam);

  // Compare team attributes
  let blueSuperior = 0;
  let redSuperior = 0;

  const attributes = ['crowdControl', 'tankiness', 'engage', 'waveclear'];
  attributes.forEach(attr => {
    const blueStat = (blueAnalysis as any)[attr];
    const redStat = (redAnalysis as any)[attr];

    if (blueStat > redStat) blueSuperior++;
    if (redStat > blueStat) redSuperior++;
  });

  // Balance check
  const blueBalance = blueAnalysis.balanced ? 1 : 0;
  const redBalance = redAnalysis.balanced ? 1 : 0;

  // Calculate win rate (50% base + adjustments)
  const blueAdvantage = (blueSuperior - redSuperior) * 5 + (blueBalance - redBalance) * 5;
  const blueWinRate = Math.max(30, Math.min(70, 50 + blueAdvantage));

  return {
    blueTeamWinRate: blueWinRate,
    redTeamWinRate: 100 - blueWinRate,
    blueAdvantages: blueAnalysis.strengths,
    redAdvantages: redAnalysis.strengths,
    blueWeaknesses: blueAnalysis.weaknesses,
    redWeaknesses: redAnalysis.weaknesses,
  };
}

/**
 * Message handler
 */
self.onmessage = (event: MessageEvent<DraftAnalysisRequest>) => {
  const { type, data } = event.data;
  const startTime = performance.now();

  let result: any;

  try {
    switch (type) {
      case 'analyzeTeam':
        result = analyzeTeamComposition(data.team);
        break;

      case 'calculateSynergy':
        result = calculateSynergy(data.champions);
        break;

      case 'findCounters':
        result = findCounters(data.enemyTeam, data.allChampions);
        break;

      case 'predictWinRate':
        result = predictWinRate(data.blueTeam, data.redTeam);
        break;

      default:
        throw new Error(`Unknown analysis type: ${type}`);
    }

    const duration = performance.now() - startTime;

    const response: DraftAnalysisResponse = {
      type,
      result: {
        ...result,
        computationTime: duration,
      },
      timestamp: Date.now(),
    };

    self.postMessage(response);
  } catch (error) {
    self.postMessage({
      type: 'error',
      result: {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      timestamp: Date.now(),
    });
  }
};

// Notify that worker is ready
self.postMessage({ type: 'ready', result: null, timestamp: Date.now() });

