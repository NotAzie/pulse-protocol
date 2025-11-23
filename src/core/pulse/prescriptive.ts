/**
 * Prescriptive Countermeasure Engine
 *
 * Rather than passively presenting graphs, this engine translates root-cause
 * causal topology into actionable executive interventions, with mathematically
 * projected Friction Reduction Scores (FRS) and institutional ROI.
 */

import type { CausalAnalysis } from './causal';

export interface PrescriptiveAction {
  id: string;
  title: string;
  domain: string;
  description: string;
  projectedFrictionReduction: number; // Percentage [e.g. 42%]
  implementationEffort: 'Low' | 'Medium' | 'High';
  roiScore: number;                   // 1.0 - 10.0 scale
  priorityRank: number;
}

const ACTION_CATALOG: Record<string, Array<{ title: string; desc: string; effort: 'Low' | 'Medium' | 'High'; baseReduction: number; baseRoi: number }>> = {
  wifi: [
    {
      title: 'Deploy High-Density Mesh APs in Study Halls',
      desc: 'Target Block A and 3rd-floor library access points experiencing severe packet drops.',
      effort: 'Medium',
      baseReduction: 38,
      baseRoi: 8.9,
    },
    {
      title: 'Re-authenticate Captive Portal Session Lease',
      desc: 'Extend student wireless session timeout from 60 minutes to 24 hours to prevent frequent disconnects.',
      effort: 'Low',
      baseReduction: 25,
      baseRoi: 9.6,
    },
  ],
  library: [
    {
      title: 'Dynamic Overflow Seating Allocation',
      desc: 'Open auxiliary auditoriums B102 & C204 for quiet study during peak examination hours.',
      effort: 'Low',
      baseReduction: 34,
      baseRoi: 9.2,
    },
    {
      title: 'Real-time Study Pod Reservation System',
      desc: 'Implement QR-code based 2-hour maximum seat locks to eliminate seat camping.',
      effort: 'Medium',
      baseReduction: 29,
      baseRoi: 8.4,
    },
  ],
  dining: [
    {
      title: 'Staggered Meal Window Extensions',
      desc: 'Shift dining hall operating hours by +45 minutes to flatten peak lunchtime queue spikes.',
      effort: 'Low',
      baseReduction: 41,
      baseRoi: 9.4,
    },
    {
      title: 'Express Mobile Grab-and-Go Stations',
      desc: 'Introduce pre-packaged student favorites in satellite carts outside high-traffic lecture halls.',
      effort: 'Medium',
      baseReduction: 33,
      baseRoi: 8.7,
    },
  ],
  hvac: [
    {
      title: 'Thermostat Zone Rebalancing',
      desc: 'Calibrate automated airflow dampeners in Blocks B and C to fix cold spots.',
      effort: 'Low',
      baseReduction: 28,
      baseRoi: 8.8,
    },
  ],
  admin: [
    {
      title: 'Digital Queuing & Ticket Push Notifications',
      desc: 'Allow students to queue virtually via SMS instead of waiting in crowded physical hallways.',
      effort: 'Low',
      baseReduction: 45,
      baseRoi: 9.7,
    },
  ],
};

export class PrescriptiveEngine {
  static generateActions(causal: CausalAnalysis): PrescriptiveAction[] {
    const actions: PrescriptiveAction[] = [];
    const root = causal.rootCauseNode;

    // Prioritize root-cause domain
    if (root && ACTION_CATALOG[root.id]) {
      const templates = ACTION_CATALOG[root.id];
      for (const t of templates) {
        actions.push({
          id: `act-${root.id}-${actions.length + 1}`,
          title: t.title,
          domain: root.label,
          description: t.desc,
          projectedFrictionReduction: Math.min(65, Math.round(t.baseReduction * (1 + root.centrality * 0.1))),
          implementationEffort: t.effort,
          roiScore: t.baseRoi,
          priorityRank: actions.length + 1,
        });
      }
    }

    // Add secondary actions for other nodes
    for (const node of causal.nodes) {
      if (node !== root && ACTION_CATALOG[node.id]) {
        const topTemplate = ACTION_CATALOG[node.id][0];
        if (topTemplate && actions.length < 5) {
          actions.push({
            id: `act-${node.id}-${actions.length + 1}`,
            title: topTemplate.title,
            domain: node.label,
            description: topTemplate.desc,
            projectedFrictionReduction: topTemplate.baseReduction,
            implementationEffort: topTemplate.effort,
            roiScore: topTemplate.baseRoi,
            priorityRank: actions.length + 1,
          });
        }
      }
    }

    if (actions.length === 0) {
      // Fallback general action
      actions.push({
        id: 'act-gen-1',
        title: 'Conduct Deep Campus Signal Survey',
        domain: 'University Experience',
        description: 'Collect continuous micro-feedback across lecture halls and residential dorms.',
        projectedFrictionReduction: 20,
        implementationEffort: 'Low',
        roiScore: 8.5,
        priorityRank: 1,
      });
    }

    actions.sort((a, b) => b.roiScore - a.roiScore);
    actions.forEach((act, idx) => { act.priorityRank = idx + 1; });

    return actions;
  }
}
