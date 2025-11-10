import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const weapons = [
  { id: 'minigun', name: 'Minigun', tier: 'S', procRate: 17, magazineSize: 200 },
  { id: 'sniper', name: 'Sniper Rifle', tier: 'S', procRate: 60, magazineSize: 5 },
  { id: 'crossbow', name: 'Crossbow', tier: 'A', procRate: 60, magazineSize: 12 },
  { id: 'flamethrower', name: 'Flamethrower', tier: 'A', procRate: 27, magazineSize: 100 },
  { id: 'blade', name: 'Blade Launcher', tier: 'S', procRate: 30, magazineSize: 9 },
  { id: 'orb', name: 'Orb Launcher', tier: 'S', procRate: 27, magazineSize: 40 },
  { id: 'arcane', name: 'Arcane Wand', tier: 'A', procRate: 40, magazineSize: 30 },
  { id: 'ice', name: 'Ice Staff', tier: 'B', procRate: 35, magazineSize: 50 },
  { id: 'auto_rifle', name: 'Auto Rifle', tier: 'B', procRate: 20, magazineSize: 30 },
  { id: 'dual_shotgun', name: 'Dual Shotguns', tier: 'B', procRate: 50, magazineSize: 8 },
];

const buildArchetypes = {
  critical: {
    name: 'クリティカルビルド',
    description: '高クリティカル率と爆発的ダメージ',
    core: ['Sharpshooter', 'Mega Crit', 'Critical Blast', 'Critical Link', 'Power Punch'],
    synergy: ['Critical Arrow', 'Critical Chain', 'Critical Thinking']
  },
  poison: {
    name: 'ポイズンビルド',
    description: '全ダメージを増幅する最強マルチプライヤー',
    core: ['Poison Shot', 'Oil Can', 'Lingering Fumes'],
    synergy: ['Strength Up', 'Gemstone', 'Checklist', 'Assassin']
  },
  elemental_fire: {
    name: '火エレメンタルビルド',
    description: '継続ダメージで敵を焼き尽くす',
    core: ['Fire Shot', 'Oil Can', 'Fire Storm', 'Firestarter'],
    synergy: ['Strength Up', 'Supercharged'],
    avoid: ['Ice Shot', 'Ice Grenade']
  },
  elemental_ice: {
    name: '氷エレメンタルビルド',
    description: '群衆制御で敵を完全凍結',
    core: ['Ice Shot', 'Ice Dash', 'Bouncing Shot'],
    synergy: ['Strength Up', 'Piercing Shot'],
    avoid: ['Fire Shot', 'Fire Grenade']
  },
  scaling: {
    name: 'スケーリングビルド',
    description: '後半で指数関数的に強くなる',
    core: ['Gemstone', 'Checklist', 'Assassin'],
    synergy: ['Power Armor', 'Money is Power', 'Poison Shot', 'Collector']
  },
  flat_damage: {
    name: 'フラットダメージビルド',
    description: '高発射速度武器向け',
    core: ['Sharp Shot', 'Wind Up', 'Clip Shot'],
    synergy: ['All You Can Eat', 'Escalating Shot', 'Streak Shot']
  }
};

// アップグレード間のシナジー関係を定義
const synergyMap = {
  'Sharpshooter': ['Mega Crit', 'Critical Blast', 'Critical Link', 'Power Punch', 'Critical Arrow', 'Critical Chain'],
  'Mega Crit': ['Sharpshooter', 'Critical Blast', 'Power Punch', 'Critical Link'],
  'Critical Blast': ['Sharpshooter', 'Mega Crit', 'Time Shot', 'Supercharged'],
  'Critical Link': ['Sharpshooter', 'Damage Shot', 'Spiral Shot'],
  'Poison Shot': ['Oil Can', 'Lingering Fumes', 'Strength Up', 'Gemstone', 'Checklist'],
  'Fire Shot': ['Oil Can', 'Fire Storm', 'Firestarter', 'Strength Up', 'Supercharged'],
  'Ice Shot': ['Bouncing Shot', 'Piercing Shot', 'Strength Up'],
  'Wind Up': ['Clip Shot', 'Sharp Shot', 'All You Can Eat', 'Mag Shot'],
  'Clip Shot': ['Wind Up', 'Sharp Shot', 'Mag Shot'],
  'Sharp Shot': ['Wind Up', 'Clip Shot', 'Escalating Shot', 'Streak Shot'],
  'Bouncing Shot': ['Aura Shot', 'Piercing Shot', 'Homing Shot'],
  'Arc Shot': ['Split Shot', 'Triple Shot', 'Homing Shot'],
  'Gemstone': ['Checklist', 'Assassin', 'Poison Shot', 'Collector'],
  'Checklist': ['Gemstone', 'Assassin', 'Poison Shot'],
  'Aura Shot': ['Bouncing Shot', 'Piercing Shot'],
  'Oil Can': ['Poison Shot', 'Fire Shot', 'Firestarter'],
  'Supercharged': ['Fire Shot', 'Critical Blast', 'Time Shot'],
  'Homing Shot': ['Arc Shot', 'Split Shot', 'Bouncing Shot']
};

// アンチシナジー（避けるべき組み合わせ）
const antiSynergyMap = {
  'Fire Shot': ['Ice Shot', 'Ice Grenade', 'Ice Dash'],
  'Ice Shot': ['Fire Shot', 'Fire Grenade', 'Fire Storm'],
  'Grip Tape': ['Rocket Launcher', 'Sniper Rifle'],
  'Hoarder': ['Multiplayer']
};

// 全アップグレードのデータベース
const allUpgrades = {
  // Damage Perks
  'Sharp Shot': { category: 'damage', rarity: 'common', description: '1発あたり+5固定ダメージ' },
  'Damage Shot': { category: 'damage', rarity: 'epic', description: '+200%ベースダメージ' },
  'Collector': { category: 'damage', rarity: 'common', description: 'パークレベルごとに2%ダメージ増加' },
  'Gemstone': { category: 'scaling', rarity: 'epic', description: 'クリアした島ごとに+ダメージ' },
  'Checklist': { category: 'scaling', rarity: 'epic', description: '25キルごとに+ダメージ' },
  'Assassin': { category: 'scaling', rarity: 'legendary', description: 'スケーリングダメージパーク' },
  
  // Critical Perks
  'Sharpshooter': { category: 'critical', rarity: 'epic', description: 'クリティカル率増加（収穫逓減）' },
  'Mega Crit': { category: 'critical', rarity: 'legendary', description: 'クリティカルを3倍クリティカルに変換' },
  'Critical Blast': { category: 'critical', rarity: 'epic', description: 'クリティカル時に爆発' },
  'Critical Link': { category: 'critical', rarity: 'legendary', description: 'クリティカル時に5発のホーミング弾' },
  'Power Punch': { category: 'critical', rarity: 'epic', description: '+200%クリティカルダメージ' },
  'Critical Arrow': { category: 'critical', rarity: 'legendary', description: 'クリティカル時に矢をスポーン' },
  'Critical Chain': { category: 'critical', rarity: 'epic', description: 'クリティカル後5秒間+33%クリティカル率' },
  
  // Elemental Mods
  'Poison Shot': { category: 'elemental', rarity: 'legendary', description: '全ダメージを最大250%増幅' },
  'Fire Shot': { category: 'elemental', rarity: 'epic', description: '火エレメンタルスタック適用' },
  'Ice Shot': { category: 'elemental', rarity: 'epic', description: '敵を凍結（ボスは免疫）' },
  'Lightning Shot': { category: 'elemental', rarity: 'epic', description: 'チェーンライトニング効果' },
  'Arcane Shot': { category: 'elemental', rarity: 'epic', description: 'クリティカル可能なDoT' },
  'Oil Can': { category: 'elemental', rarity: 'epic', description: 'ポイズン/火ダメージブースト' },
  'Strength Up': { category: 'elemental', rarity: 'common', description: 'プロックあたりのスタック数増加' },
  'Lingering Fumes': { category: 'elemental', rarity: 'epic', description: '敵撃破時にポイズン拡散' },
  'Fire Storm': { category: 'elemental', rarity: 'legendary', description: '5秒間で400火スタック適用' },
  'Firestarter': { category: 'elemental', rarity: 'epic', description: '火スタック/ダメージ増加' },
  
  // Weapon Mods
  'Wind Up': { category: 'weapon_mod', rarity: 'common', description: '発射弾丸ごとに+1ダメージ（最大25）' },
  'Clip Shot': { category: 'weapon_mod', rarity: 'common', description: '残弾ごとに+1ダメージ（最大25）' },
  'Bouncing Shot': { category: 'weapon_mod', rarity: 'legendary', description: 'バウンスごとに+66%ダメージ' },
  'Aura Shot': { category: 'weapon_mod', rarity: 'legendary', description: '弾丸に約1カニ幅のAOE付与' },
  'Piercing Shot': { category: 'weapon_mod', rarity: 'legendary', description: '弾丸が敵を貫通' },
  'Arc Shot': { category: 'weapon_mod', rarity: 'epic', description: '水平アーク状に発射' },
  'Split Shot': { category: 'weapon_mod', rarity: 'epic', description: 'フォーメーション系モッド' },
  'Triple Shot': { category: 'weapon_mod', rarity: 'epic', description: '3発に分岐' },
  'Homing Shot': { category: 'weapon_mod', rarity: 'epic', description: '弾丸が自動ターゲット' },
  
  // Utility
  'Supercharged': { category: 'utility', rarity: 'epic', description: '発射速度+25%' },
  'All You Can Eat': { category: 'utility', rarity: 'common', description: '敵撃破後3秒間弾薬消費なし' },
  'Escalating Shot': { category: 'utility', rarity: 'common', description: '連続ヒットで5%ダメージ増加' },
  'Streak Shot': { category: 'utility', rarity: 'common', description: '連続ヒットでダメージ増加' },
  'Mag Shot': { category: 'utility', rarity: 'common', description: 'マガジンサイズ増加' },
  'Grip Tape': { category: 'utility', rarity: 'common', description: '発射速度増加' },
  'Regenerating Armor': { category: 'survival', rarity: 'legendary', description: '各島開始時に1アーマー獲得' },
  'Power Armor': { category: 'survival', rarity: 'epic', description: 'アーマープレートごとに+ダメージ' },
  'Money is Power': { category: 'scaling', rarity: 'epic', description: 'クリスタルに基づく+ダメージ' },
};

const recommendations = {
  minigun: {
    priority: [
      { name: 'Wind Up', description: '発射した弾丸ごとに+1ダメージ（最大25）。200発マガジンで最大効果', stage: 'early' },
      { name: 'Clip Shot', description: '残弾ごとに+1ダメージ（最大25）。200発マガジンで最大効果', stage: 'early' },
      { name: 'Sharp Shot', description: '1発あたり+5固定ダメージ。高発射速度で真価を発揮', stage: 'early' },
      { name: 'Poison Shot', description: '全ダメージを最大250%増幅する最強シナジー', stage: 'mid' },
      { name: 'Gemstone', description: 'クリアした島ごとに+ダメージ。早めに取得', stage: 'early' },
      { name: 'Checklist', description: '25キルごとに+ダメージ。スケーリングビルドの核', stage: 'mid' },
    ],
    avoid: ['Grip Tape（発射速度より固定ダメージを優先）']
  },
  sniper: {
    priority: [
      { name: 'Critical Link', description: 'クリティカル時に5発のホーミング弾。高ベースダメージで最強', stage: 'early' },
      { name: 'Arc Shot', description: '10倍Procマルチプライヤーで2-3回で確率最大化', stage: 'early' },
      { name: 'Split Shot', description: 'Arc Shotと同様、フォーメーション系モッド', stage: 'early' },
      { name: 'Sharpshooter', description: 'クリティカル率増加。高ベースダメージと相性抜群', stage: 'mid' },
      { name: 'Damage Shot', description: '+200%ベースダメージ。高ベースダメージ武器で最効果的', stage: 'mid' },
      { name: 'Poison Shot', description: '全ダメージを増幅するユニバーサルマルチプライヤー', stage: 'late' },
    ],
    avoid: ['Grip Tape（低発射速度武器では効果薄）']
  },
  crossbow: {
    priority: [
      { name: 'Triple Shot', description: '7発の矢がさらに増加。範囲制圧力向上', stage: 'early' },
      { name: 'Arc Shot', description: '追加弾モッド。矢の数を増やす', stage: 'early' },
      { name: 'Bouncing Shot', description: '貫通とバウンスで1発あたりのヒット数最大化', stage: 'early' },
      { name: 'Homing Shot', description: '多数の弾丸で群衆制圧が壊滅的に', stage: 'mid' },
      { name: 'Sharpshooter', description: 'クリティカルビルドで大規模単体ダメージ', stage: 'mid' },
      { name: 'Poison Shot', description: 'ダメージマルチプライヤー', stage: 'late' },
    ],
    avoid: []
  },
  flamethrower: {
    priority: [
      { name: 'Fire Shot', description: '火エレメンタルスタックを急速に蓄積', stage: 'early' },
      { name: 'Oil Can', description: '燃焼敵へのダメージブースト', stage: 'early' },
      { name: 'Poison Shot', description: 'エレメンタル＋ポイズンの組み合わせ', stage: 'mid' },
      { name: 'Aura Shot', description: '貫通弾とAOEの相性が良好', stage: 'mid' },
      { name: 'Supercharged', description: '発射速度増加で更なるスタック蓄積', stage: 'late' },
    ],
    avoid: ['Ice Shot（火と氷は互いに打ち消す）']
  },
  blade: {
    priority: [
      { name: 'Bouncing Shot', description: '貫通する多段ヒットと極めて相性良好', stage: 'early' },
      { name: 'Aura Shot', description: '円盤の軌道に約1カニ幅のAOE付与', stage: 'early' },
      { name: 'Piercing Shot', description: 'チョークポイントでの制圧力最大化', stage: 'early' },
      { name: 'Poison Shot', description: 'ユニバーサルダメージマルチプライヤー', stage: 'mid' },
      { name: 'Critical Blast', description: 'クリティカル時の爆発でさらなるAOE', stage: 'late' },
    ],
    avoid: []
  },
  orb: {
    priority: [
      { name: 'Aura Shot', description: '低速弾と相性が良い', stage: 'early' },
      { name: 'Bouncing Shot', description: 'バウンスでダメージ増加', stage: 'early' },
      { name: 'Poison Shot', description: 'ダメージ増幅の核', stage: 'mid' },
      { name: 'Gemstone', description: 'スケーリングダメージ。早期取得推奨', stage: 'early' },
      { name: 'Checklist', description: 'キルごとのダメージ増加', stage: 'mid' },
    ],
    avoid: []
  },
  arcane: {
    priority: [
      { name: 'Arcane Shot', description: '開始時レベル2。さらに強化', stage: 'early' },
      { name: 'Sharpshooter', description: 'Arcane DoTはクリティカル可能', stage: 'early' },
      { name: 'Mega Crit', description: 'クリティカルを3倍クリティカルに', stage: 'mid' },
      { name: 'Critical Blast', description: 'ArcaneプロックがCritical Blastを発動', stage: 'mid' },
      { name: 'Poison Shot', description: 'グローバルダメージブーストの恩恵を受ける', stage: 'late' },
    ],
    avoid: []
  },
  ice: {
    priority: [
      { name: 'Ice Shot', description: '固有の群衆制御（凍結）能力', stage: 'early' },
      { name: 'Bouncing Shot', description: '無限貫通効果を発揮', stage: 'early' },
      { name: 'Strength Up', description: 'プロックあたりのスタック数増加', stage: 'mid' },
      { name: 'Piercing Shot', description: '弾丸が敵を貫通', stage: 'mid' },
      { name: 'Poison Shot', description: 'ダメージマルチプライヤー', stage: 'late' },
    ],
    avoid: ['Fire Shot（火と氷は互いに打ち消す）']
  },
  auto_rifle: {
    priority: [
      { name: 'Sharp Shot', description: '高発射速度で固定ダメージが効果的', stage: 'early' },
      { name: 'Escalating Shot', description: '連続ヒットで5%ずつダメージ増加', stage: 'early' },
      { name: 'Poison Shot', description: 'ユニバーサルマルチプライヤー', stage: 'mid' },
      { name: 'Gemstone', description: 'スケーリングダメージの開始', stage: 'early' },
      { name: 'Supercharged', description: '発射速度25%増加', stage: 'mid' },
    ],
    avoid: []
  },
  dual_shotgun: {
    priority: [
      { name: 'Arc Shot', description: 'ショットガンの拡散と相性良好', stage: 'early' },
      { name: 'Split Shot', description: 'フォーメーション系モッド', stage: 'early' },
      { name: 'Bouncing Shot', description: '多弾数でバウンス効果大', stage: 'early' },
      { name: 'Poison Shot', description: 'ダメージ増幅', stage: 'mid' },
      { name: 'Critical Blast', description: 'クリティカル時の爆発', stage: 'late' },
    ],
    avoid: []
  },
};

const App = () => {
  const [mode, setMode] = useState(null); // 'guided', 'synergy', 'choice', 'archetype'
  const [selectedWeapon, setSelectedWeapon] = useState(null);
  const [stage, setStage] = useState('early');
  const [pickedUpgrades, setPickedUpgrades] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [availableChoices, setAvailableChoices] = useState([]);

  const handleWeaponSelect = (weapon) => {
    setSelectedWeapon(weapon);
    setPickedUpgrades([]);
    setStage('early');
  };

  const handleUpgradePick = (upgrade) => {
    setPickedUpgrades([...pickedUpgrades, upgrade]);
  };

  const handleUpgradeUnpick = (upgrade) => {
    setPickedUpgrades(pickedUpgrades.filter(u => u !== upgrade));
  };

  // Mode 1: ガイド付きモード（元の実装）
  const getGuidedRecommendations = () => {
    if (!selectedWeapon) return [];
    return recommendations[selectedWeapon.id].priority.filter(rec => 
      !pickedUpgrades.includes(rec.name) && rec.stage === stage
    );
  };

  // Mode 2: シナジーベースモード
  const getSynergyRecommendations = () => {
    if (pickedUpgrades.length === 0) {
      // 何も取ってない場合は武器に合った基本的なものを提案
      if (!selectedWeapon) return [];
      return recommendations[selectedWeapon.id].priority
        .filter(rec => rec.stage === 'early')
        .slice(0, 5);
    }

    const recommendations = [];
    const scoreMap = {};

    // 取得済みアップグレードとシナジーがあるものをスコアリング
    pickedUpgrades.forEach(picked => {
      if (synergyMap[picked]) {
        synergyMap[picked].forEach(synergy => {
          if (!pickedUpgrades.includes(synergy)) {
            scoreMap[synergy] = (scoreMap[synergy] || 0) + 1;
          }
        });
      }
    });

    // アンチシナジーチェック
    Object.keys(allUpgrades).forEach(upgrade => {
      if (pickedUpgrades.includes(upgrade)) return;
      
      let hasAntiSynergy = false;
      pickedUpgrades.forEach(picked => {
        if (antiSynergyMap[picked]?.includes(upgrade)) {
          hasAntiSynergy = true;
        }
      });
      
      if (hasAntiSynergy) {
        scoreMap[upgrade] = -100; // 避けるべき
      }
    });

    // スコア順にソート
    const sorted = Object.entries(scoreMap)
      .sort(([, a], [, b]) => b - a)
      .filter(([, score]) => score > 0)
      .slice(0, 10);

    return sorted.map(([name, score]) => ({
      name,
      description: allUpgrades[name]?.description || 'シナジーあり',
      score,
      synergyWith: pickedUpgrades.filter(p => synergyMap[p]?.includes(name))
    }));
  };

  // Mode 3: 選択肢モード
  const evaluateChoices = () => {
    if (availableChoices.length === 0) return [];

    return availableChoices.map(choice => {
      let score = 0;
      let reasons = [];

      // 取得済みアップグレードとのシナジーチェック
      pickedUpgrades.forEach(picked => {
        if (synergyMap[picked]?.includes(choice)) {
          score += 3;
          reasons.push(`${picked}とシナジーあり`);
        }
      });

      // アンチシナジーチェック
      pickedUpgrades.forEach(picked => {
        if (antiSynergyMap[picked]?.includes(choice)) {
          score -= 10;
          reasons.push(`⚠️ ${picked}とアンチシナジー`);
        }
      });

      // 武器との相性
      if (selectedWeapon) {
        const weaponRecs = recommendations[selectedWeapon.id];
        const priority = weaponRecs.priority.find(p => p.name === choice);
        if (priority) {
          score += 2;
          reasons.push(`${selectedWeapon.name}と相性良好`);
        }
        if (weaponRecs.avoid.some(a => a.includes(choice))) {
          score -= 5;
          reasons.push(`⚠️ ${selectedWeapon.name}には不向き`);
        }
      }

      // レアリティボーナス
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

  // Mode 4: アーキタイプモード
  const getArchetypeRecommendations = () => {
    if (!selectedArchetype) return [];
    
    const archetype = buildArchetypes[selectedArchetype];
    const needed = [];

    // コアアップグレードで未取得のもの
    archetype.core.forEach(upgrade => {
      if (!pickedUpgrades.includes(upgrade)) {
        needed.push({
          name: upgrade,
          description: allUpgrades[upgrade]?.description || '',
          priority: 'コア',
          category: 'core'
        });
      }
    });

    // シナジーアップグレードで未取得のもの
    archetype.synergy?.forEach(upgrade => {
      if (!pickedUpgrades.includes(upgrade)) {
        needed.push({
          name: upgrade,
          description: allUpgrades[upgrade]?.description || '',
          priority: 'シナジー',
          category: 'synergy'
        });
      }
    });

    return needed;
  };

  const filteredRecommendations = mode === 'guided' ? getGuidedRecommendations() : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">🦀 Crab Champions Build Advisor</h1>
        <p className="text-blue-200 text-center mb-8">あなたのプレイスタイルに合わせた4つのモード</p>
        
        {/* Mode Selection */}
        {!mode && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card 
              className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/20 transition"
              onClick={() => setMode('guided')}
            >
              <CardHeader>
                <CardTitle className="text-white">📋 ガイド付きモード</CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <p>固定された優先順位に従ってアップグレードを提案します。初心者向け。</p>
                <ul className="mt-3 text-sm text-blue-200 list-disc list-inside">
                  <li>武器ごとの最適ビルドパス</li>
                  <li>ステージ別の推奨順序</li>
                  <li>避けるべきアンチシナジー</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/20 transition"
              onClick={() => setMode('synergy')}
            >
              <CardHeader>
                <CardTitle className="text-white">🔗 シナジーベースモード</CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <p>取得済みアップグレードとシナジーがあるものを動的に提案します。</p>
                <ul className="mt-3 text-sm text-blue-200 list-disc list-inside">
                  <li>既存ビルドとの相性を自動判定</li>
                  <li>アンチシナジーを自動回避</li>
                  <li>柔軟なビルド構築</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/20 transition"
              onClick={() => setMode('choice')}
            >
              <CardHeader>
                <CardTitle className="text-white">🎯 選択肢評価モード</CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <p>今出ている選択肢を入力すると、どれが最適かを判定します。</p>
                <ul className="mt-3 text-sm text-blue-200 list-disc list-inside">
                  <li>実際のゲームプレイに最も近い</li>
                  <li>選択肢を比較評価</li>
                  <li>理由付きで推奨度を表示</li>
                </ul>
              </CardContent>
            </Card>

            <Card 
              className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/20 transition"
              onClick={() => setMode('archetype')}
            >
              <CardHeader>
                <CardTitle className="text-white">🎨 ビルドアーキタイプモード</CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <p>目指すビルドタイプを選び、それに必要なアップグレードを提案します。</p>
                <ul className="mt-3 text-sm text-blue-200 list-disc list-inside">
                  <li>明確なビルド方針</li>
                  <li>コア＋シナジーアイテム</li>
                  <li>6種のアーキタイプから選択</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Weapon Selection (common for all modes) */}
        {mode && !selectedWeapon && (
          <>
            <Button 
              onClick={() => { setMode(null); setPickedUpgrades([]); }}
              className="mb-4 bg-gray-500 hover:bg-gray-600"
            >
              ← モード選択に戻る
            </Button>
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">まず武器を選択してください</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {weapons.map(weapon => (
                    <Button
                      key={weapon.id}
                      onClick={() => handleWeaponSelect(weapon)}
                      className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-2 border-white/30"
                    >
                      <span className="font-bold text-lg">{weapon.name}</span>
                      <span className="text-xs mt-1">Tier {weapon.tier}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Mode 1: Guided Mode */}
        {mode === 'guided' && selectedWeapon && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => { setMode(null); setSelectedWeapon(null); }} className="bg-gray-500">
                ← モード変更
              </Button>
              <Button onClick={() => setSelectedWeapon(null)} className="bg-red-500">
                武器変更
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  選択中: {selectedWeapon.name} (Tier {selectedWeapon.tier})
                </CardTitle>
              </CardHeader>
              <CardContent className="text-white">
                <div className="flex gap-4 text-sm">
                  <span>Proc Rate: {selectedWeapon.procRate}%</span>
                  <span>|</span>
                  <span>マガジン: {selectedWeapon.magazineSize}発</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">ゲームステージを選択</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <Button
                    onClick={() => setStage('early')}
                    className={stage === 'early' ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-500 hover:bg-gray-600'}
                  >
                    序盤 (Stage 1-3)
                  </Button>
                  <Button
                    onClick={() => setStage('mid')}
                    className={stage === 'mid' ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-gray-500 hover:bg-gray-600'}
                  >
                    中盤 (Stage 4-6)
                  </Button>
                  <Button
                    onClick={() => setStage('late')}
                    className={stage === 'late' ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}
                  >
                    後半 (Stage 7+)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {pickedUpgrades.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">取得済みアップグレード</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pickedUpgrades.map((upgrade, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-500/50 rounded-full text-white text-sm">
                        {upgrade}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">
                  おすすめアップグレード ({stage === 'early' ? '序盤' : stage === 'mid' ? '中盤' : '後半'})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredRecommendations.length > 0 ? (
                  <div className="space-y-4">
                    {filteredRecommendations.map((rec, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-yellow-300">{idx + 1}. {rec.name}</h3>
                          <Button
                            onClick={() => handleUpgradePick(rec.name)}
                            className="bg-green-500 hover:bg-green-600 text-sm"
                            size="sm"
                          >
                            取得済みにする
                          </Button>
                        </div>
                        <p className="text-white">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white text-center py-8">
                    このステージでおすすめのアップグレードは全て取得済みです！
                  </p>
                )}
              </CardContent>
            </Card>

            {recommendations[selectedWeapon.id].avoid.length > 0 && (
              <Card className="bg-red-900/20 backdrop-blur-lg border-red-500/30">
                <CardHeader>
                  <CardTitle className="text-red-300">⚠️ 避けるべきアップグレード</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc list-inside text-red-200 space-y-2">
                    {recommendations[selectedWeapon.id].avoid.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Mode 2: Synergy Mode */}
        {mode === 'synergy' && selectedWeapon && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => { setMode(null); setSelectedWeapon(null); }} className="bg-gray-500">
                ← モード変更
              </Button>
              <Button onClick={() => setSelectedWeapon(null)} className="bg-red-500">
                武器変更
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">取得済みアップグレードを選択</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {Object.keys(allUpgrades).map(upgrade => (
                    <Button
                      key={upgrade}
                      onClick={() => {
                        if (pickedUpgrades.includes(upgrade)) {
                          handleUpgradeUnpick(upgrade);
                        } else {
                          handleUpgradePick(upgrade);
                        }
                      }}
                      className={`text-sm ${
                        pickedUpgrades.includes(upgrade)
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      size="sm"
                    >
                      {upgrade}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {pickedUpgrades.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">現在のビルド</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {pickedUpgrades.map((upgrade, idx) => (
                      <div key={idx} className="px-3 py-2 bg-purple-500/50 rounded-lg text-white text-sm flex items-center gap-2">
                        {upgrade}
                        <button onClick={() => handleUpgradeUnpick(upgrade)} className="text-red-300 hover:text-red-100">
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">シナジー推奨アップグレード</CardTitle>
              </CardHeader>
              <CardContent>
                {getSynergyRecommendations().length > 0 ? (
                  <div className="space-y-4">
                    {getSynergyRecommendations().map((rec, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="text-xl font-bold text-yellow-300">
                              {rec.name} 
                              <span className="text-sm text-blue-300 ml-2">シナジー度: {rec.score}</span>
                            </h3>
                            {rec.synergyWith && rec.synergyWith.length > 0 && (
                              <p className="text-sm text-green-300 mt-1">
                                🔗 {rec.synergyWith.join(', ')} とシナジーあり
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleUpgradePick(rec.name)}
                            className="bg-green-500 hover:bg-green-600 text-sm"
                            size="sm"
                          >
                            取得する
                          </Button>
                        </div>
                        <p className="text-white">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-white text-center py-8">
                    アップグレードを選択すると、シナジーのある推奨が表示されます
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Mode 3: Choice Mode */}
        {mode === 'choice' && selectedWeapon && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => { setMode(null); setSelectedWeapon(null); }} className="bg-gray-500">
                ← モード変更
              </Button>
              <Button onClick={() => setSelectedWeapon(null)} className="bg-red-500">
                武器変更
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">取得済みアップグレード</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {Object.keys(allUpgrades).map(upgrade => (
                    <Button
                      key={upgrade}
                      onClick={() => {
                        if (pickedUpgrades.includes(upgrade)) {
                          handleUpgradeUnpick(upgrade);
                        } else {
                          handleUpgradePick(upgrade);
                        }
                      }}
                      className={`text-sm ${
                        pickedUpgrades.includes(upgrade)
                          ? 'bg-green-500 hover:bg-green-600'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      size="sm"
                    >
                      {upgrade}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">今出ている選択肢を入力</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                  {Object.keys(allUpgrades).filter(u => !pickedUpgrades.includes(u)).map(upgrade => (
                    <Button
                      key={upgrade}
                      onClick={() => {
                        if (availableChoices.includes(upgrade)) {
                          setAvailableChoices(availableChoices.filter(c => c !== upgrade));
                        } else {
                          setAvailableChoices([...availableChoices, upgrade]);
                        }
                      }}
                      className={`text-sm ${
                        availableChoices.includes(upgrade)
                          ? 'bg-blue-500 hover:bg-blue-600'
                          : 'bg-gray-600 hover:bg-gray-500'
                      }`}
                      size="sm"
                    >
                      {upgrade}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {availableChoices.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">選択肢の評価</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evaluateChoices().map((choice, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-yellow-300">
                              {idx + 1}. {choice.name}
                              <span className={`text-sm ml-3 ${
                                choice.recommendation === '強く推奨' ? 'text-green-300' :
                                choice.recommendation === '推奨' ? 'text-blue-300' :
                                choice.recommendation === '普通' ? 'text-gray-300' : 'text-red-300'
                              }`}>
                                {choice.recommendation} (スコア: {choice.score})
                              </span>
                            </h3>
                            <p className="text-white mt-1">{choice.description}</p>
                            {choice.reasons.length > 0 && (
                              <ul className="mt-2 space-y-1">
                                {choice.reasons.map((reason, ridx) => (
                                  <li key={ridx} className="text-sm text-blue-200">• {reason}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                          <Button
                            onClick={() => {
                              handleUpgradePick(choice.name);
                              setAvailableChoices([]);
                            }}
                            className="bg-green-500 hover:bg-green-600 text-sm ml-4"
                            size="sm"
                          >
                            これを取得
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Mode 4: Archetype Mode */}
        {mode === 'archetype' && selectedWeapon && (
          <div className="space-y-6">
            <div className="flex gap-4">
              <Button onClick={() => { setMode(null); setSelectedWeapon(null); setSelectedArchetype(null); }} className="bg-gray-500">
                ← モード変更
              </Button>
              <Button onClick={() => setSelectedWeapon(null)} className="bg-red-500">
                武器変更
              </Button>
            </div>

            {!selectedArchetype ? (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">ビルドアーキタイプを選択</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {Object.entries(buildArchetypes).map(([key, archetype]) => (
                      <div
                        key={key}
                        onClick={() => setSelectedArchetype(key)}
                        className="bg-white/5 p-4 rounded-lg border border-white/20 cursor-pointer hover:bg-white/10 transition"
                      >
                        <h3 className="text-xl font-bold text-yellow-300 mb-2">{archetype.name}</h3>
                        <p className="text-white text-sm mb-3">{archetype.description}</p>
                        <div className="text-xs text-blue-200">
                          <p className="font-semibold">コアアイテム:</p>
                          <p>{archetype.core.join(', ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex justify-between items-center">
                      <span>{buildArchetypes[selectedArchetype].name}</span>
                      <Button onClick={() => setSelectedArchetype(null)} className="bg-gray-500" size="sm">
                        アーキタイプ変更
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-white">
                    <p>{buildArchetypes[selectedArchetype].description}</p>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">取得済みアップグレード</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-96 overflow-y-auto">
                      {Object.keys(allUpgrades).map(upgrade => (
                        <Button
                          key={upgrade}
                          onClick={() => {
                            if (pickedUpgrades.includes(upgrade)) {
                              handleUpgradeUnpick(upgrade);
                            } else {
                              handleUpgradePick(upgrade);
                            }
                          }}
                          className={`text-sm ${
                            pickedUpgrades.includes(upgrade)
                              ? 'bg-green-500 hover:bg-green-600'
                              : 'bg-gray-600 hover:bg-gray-500'
                          }`}
                          size="sm"
                        >
                          {upgrade}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">必要なアップグレード</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getArchetypeRecommendations().length > 0 ? (
                      <div className="space-y-4">
                        {getArchetypeRecommendations().map((rec, idx) => (
                          <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="text-xl font-bold text-yellow-300">
                                  {rec.name}
                                  <span className={`text-sm ml-3 ${
                                    rec.category === 'core' ? 'text-red-300' : 'text-blue-300'
                                  }`}>
                                    [{rec.priority}]
                                  </span>
                                </h3>
                                <p className="text-white mt-1">{rec.description}</p>
                              </div>
                              <Button
                                onClick={() => handleUpgradePick(rec.name)}
                                className="bg-green-500 hover:bg-green-600 text-sm"
                                size="sm"
                              >
                                取得する
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-white text-center py-8">
                        このビルドに必要なアップグレードは全て取得済みです！🎉
                      </p>
                    )}
                  </CardContent>
                </Card>

                {buildArchetypes[selectedArchetype].avoid && (
                  <Card className="bg-red-900/20 backdrop-blur-lg border-red-500/30">
                    <CardHeader>
                      <CardTitle className="text-red-300">⚠️ このビルドでは避けるべき</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {buildArchetypes[selectedArchetype].avoid.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-red-500/30 rounded-full text-red-200 text-sm">
                            {item}
                          </span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
