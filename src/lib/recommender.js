// ピュア関数群：再レンダリングを起こさないロジックをここに隔離
export const getGuidedRecommendations = (selectedWeaponId, stage, picked, recommendations) => {
  if (!selectedWeaponId) return [];
  const recs = recommendations[selectedWeaponId]?.priority || [];
  return recs.filter(r => r.stage === stage && !picked.includes(r.name));
};

export const getSynergyRecommendations = (picked, selectedWeaponId, recommendations, allUpgrades, synergyMap, antiSynergyMap) => {
  if (!picked || picked.length === 0) {
    if (!selectedWeaponId) return [];
    return (recommendations[selectedWeaponId]?.priority || []).filter(r => r.stage === 'early').slice(0, 5);
  }

  const scoreMap = {};
  picked.forEach(p => {
    const list = synergyMap[p] || [];
    list.forEach(s => {
      if (!picked.includes(s)) scoreMap[s] = (scoreMap[s] || 0) + 1;
    });
  });

  Object.keys(allUpgrades).forEach(u => {
    if (picked.includes(u)) return;
    const hasAnti = picked.some(p => (antiSynergyMap[p] || []).includes(u));
    if (hasAnti) scoreMap[u] = -100;
  });

  return Object.entries(scoreMap)
    .sort(([, a], [, b]) => b - a)
    .filter(([, s]) => s > 0)
    .slice(0, 10)
    .map(([name, score]) => ({
      name,
      score,
      description: allUpgrades[name]?.description || 'シナジーあり',
      synergyWith: picked.filter(p => (synergyMap[p] || []).includes(name))
    }));
};

export const evaluateChoices = (available, picked, selectedWeaponId, recommendations, allUpgrades, antiSynergyMap) => {
  if (!available || available.length === 0) return [];
  const weaponRecs = selectedWeaponId ? recommendations[selectedWeaponId] : null;

  return available.map(choice => {
    let score = 0;
    const reasons = [];

    picked.forEach(p => {
      // シナジー表示は呼び出し側で付与可。ここではスコアだけ扱う
    });

    picked.forEach(p => {
      if ((antiSynergyMap[p] || []).includes(choice)) {
        score -= 10;
        reasons.push(`⚠️ ${p}とアンチシナジー`);
      }
    });

    if (weaponRecs) {
      const pr = weaponRecs.priority.find(x => x.name === choice);
      if (pr) { score += 2; reasons.push('武器推奨に含まれる'); }
      if (weaponRecs.avoid.some(a => a.includes(choice))) { score -= 5; reasons.push('武器の避け推奨に該当'); }
    }

    const rarity = allUpgrades[choice]?.rarity;
    if (rarity === 'legendary') score += 1;

    return {
      name: choice,
      score,
      reasons,
      description: allUpgrades[choice]?.description || '',
      recommendation: score >= 3 ? '強く推奨' : score >= 1 ? '推奨' : score >= 0 ? '普通' : '非推奨'
    };
  }).sort((a, b) => b.score - a.score);
};

export const getArchetypeRecommendations = (selectedArchetypeId, picked, archetypes, allUpgrades) => {
  if (!selectedArchetypeId) return [];
  const a = archetypes[selectedArchetypeId];
  if (!a) return [];
  const needed = [];
  a.core.forEach(u => { if (!picked.includes(u)) needed.push({ name: u, description: allUpgrades[u]?.description || '', priority: 'コア', category: 'core' }); });
  (a.synergy || []).forEach(u => { if (!picked.includes(u)) needed.push({ name: u, description: allUpgrades[u]?.description || '', priority: 'シナジー', category: 'synergy' }); });
  return needed;
};
