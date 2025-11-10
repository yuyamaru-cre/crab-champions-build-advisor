import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import weapons from '@/data/weapons.json';
import buildArchetypes from '@/data/build_archetypes.json';
import synergyMap from '@/data/synergy_map.json';
import antiSynergyMap from '@/data/anti_synergy_map.json';
import allUpgrades from '@/data/upgrades.json';
import recommendations from '@/data/recommendations.json';
import ModeSelector from '@/components/ModeSelector.jsx';
import WeaponSelector from '@/components/WeaponSelector.jsx';
import UpgradePicker from '@/components/UpgradePicker.jsx';
import { getGuidedRecommendations, getSynergyRecommendations, evaluateChoices, getArchetypeRecommendations } from '@/lib/recommender';


/* データは JSON から読み込み済み */

/* データは JSON から読み込み済み */

/* データは JSON から読み込み済み */

/* データは JSON から読み込み済み */

/* データは JSON から読み込み済み */

// 永続化は別タスクで最適化予定。今回はデータ分離と描画分割にフォーカス。

const STORAGE_KEYS = {
  session: 'ccba:session:v1',
  favorites: 'ccba:favorites:v1',
  history: 'ccba:history:v1',
};

const takeSnapshot = ({ mode, selectedWeaponId, stage, pickedUpgrades, selectedArchetype, availableChoices }) => ({
  mode,
  selectedWeaponId: selectedWeaponId || null,
  stage,
  pickedUpgrades,
  selectedArchetype,
  availableChoices,
  timestamp: Date.now(),
});

const App = () => {
  const [mode, setMode] = useState(null); // 'guided', 'synergy', 'choice', 'archetype'
  const [selectedWeaponId, setSelectedWeaponId] = useState(null);
  const [stage, setStage] = useState('early');
  const [pickedUpgrades, setPickedUpgrades] = useState([]);
  const [selectedArchetype, setSelectedArchetype] = useState(null);
  const [availableChoices, setAvailableChoices] = useState([]);

  // 保存系UI状態
  const [showSavePanel, setShowSavePanel] = useState(false);
  const [showFavoritesList, setShowFavoritesList] = useState(false);
  const [showHistoryList, setShowHistoryList] = useState(false);

  // 保存データ
  const [favorites, setFavorites] = useState([]); // {id, name, snapshot, createdAt}
  const [history, setHistory] = useState([]); // [snapshot]

  // 履歴の連投制御
  const lastHistoryPushRef = useRef(0);

  const weaponById = useMemo(() => Object.fromEntries(weapons.map(w => [w.id, w])), []);
  const selectedWeapon = selectedWeaponId ? weaponById[selectedWeaponId] : null;

  const handleWeaponSelect = (weapon) => {
    setSelectedWeaponId(weapon.id);
    setPickedUpgrades([]);
    setStage('early');
    setSelectedArchetype(null);
    setAvailableChoices([]);
  };

  const handleUpgradePick = (upgrade) => {
    setPickedUpgrades([...pickedUpgrades, upgrade]);
  };

  const handleUpgradeUnpick = (upgrade) => {
    setPickedUpgrades(pickedUpgrades.filter(u => u !== upgrade));
  };

  const guidedRecs = useMemo(() => getGuidedRecommendations(selectedWeaponId, stage, pickedUpgrades, recommendations), [selectedWeaponId, stage, pickedUpgrades]);

  const synergyRecs = useMemo(() => (
    getSynergyRecommendations(pickedUpgrades, selectedWeaponId, recommendations, allUpgrades, synergyMap, antiSynergyMap)
  ), [pickedUpgrades, selectedWeaponId]);

  const evaluatedChoices = useMemo(() => (
    evaluateChoices(availableChoices, pickedUpgrades, selectedWeaponId, recommendations, allUpgrades, antiSynergyMap)
  ), [availableChoices, pickedUpgrades, selectedWeaponId]);

  const archetypeNeeds = useMemo(() => (
    getArchetypeRecommendations(selectedArchetype, pickedUpgrades, buildArchetypes, allUpgrades)
  ), [selectedArchetype, pickedUpgrades]);

  const filteredRecommendations = mode === 'guided' ? guidedRecs : [];

  // --- セッション/お気に入り/履歴: 初期ロード ---
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      if (raw) {
        const sess = JSON.parse(raw);
        setMode(sess.mode || null);
        setSelectedWeaponId(sess.selectedWeaponId || null);
        setStage(sess.stage || 'early');
        setPickedUpgrades(Array.isArray(sess.pickedUpgrades) ? sess.pickedUpgrades : []);
        setSelectedArchetype(sess.selectedArchetype || null);
        setAvailableChoices(Array.isArray(sess.availableChoices) ? sess.availableChoices : []);
      }
      const favRaw = localStorage.getItem(STORAGE_KEYS.favorites);
      if (favRaw) setFavorites(JSON.parse(favRaw));
      const histRaw = localStorage.getItem(STORAGE_KEYS.history);
      if (histRaw) setHistory(JSON.parse(histRaw));
    } catch (e) {
      console.error('セッション復元エラー', e);
    }
  }, []);

  // --- セッション自動保存 + 履歴追記（3秒デバウンス） ---
  useEffect(() => {
    const snapshot = takeSnapshot({ mode, selectedWeaponId, stage, pickedUpgrades, selectedArchetype, availableChoices });
    // セッション保存（200ms遅延）
    const t = setTimeout(() => {
      try { localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(snapshot)); } catch {}
    }, 200);

    // 履歴に記録
    const now = Date.now();
    const last = history[0];
    const isSameAsLast = last &&
      last.mode === snapshot.mode &&
      last.selectedWeaponId === snapshot.selectedWeaponId &&
      last.stage === snapshot.stage &&
      JSON.stringify(last.pickedUpgrades) === JSON.stringify(snapshot.pickedUpgrades) &&
      last.selectedArchetype === snapshot.selectedArchetype &&
      JSON.stringify(last.availableChoices) === JSON.stringify(snapshot.availableChoices);

    if (!isSameAsLast && now - lastHistoryPushRef.current > 3000) {
      lastHistoryPushRef.current = now;
      const next = [snapshot, ...history].slice(0, 100);
      setHistory(next);
      try { localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(next)); } catch {}
    }

    return () => clearTimeout(t);
  }, [mode, selectedWeaponId, stage, pickedUpgrades, selectedArchetype, availableChoices]);

  const saveFavorite = () => {
    const defaultName = `${selectedWeapon?.name || '汎用'} - ${new Date().toLocaleString()}`;
    const name = window.prompt('お気に入り名を入力してください', defaultName);
    if (!name) return;
    const snapshot = takeSnapshot({ mode, selectedWeaponId, stage, pickedUpgrades, selectedArchetype, availableChoices });
    const fav = { id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()), name, snapshot, createdAt: Date.now() };
    const next = [fav, ...favorites].slice(0, 50);
    setFavorites(next);
    try { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next)); } catch {}
  };

  const loadSnapshot = (snap) => {
    setMode(snap.mode || null);
    setSelectedWeaponId(snap.selectedWeaponId || null);
    setStage(snap.stage || 'early');
    setPickedUpgrades(Array.isArray(snap.pickedUpgrades) ? snap.pickedUpgrades : []);
    setSelectedArchetype(snap.selectedArchetype || null);
    setAvailableChoices(Array.isArray(snap.availableChoices) ? snap.availableChoices : []);
    try { localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(snap)); } catch {}
  };

  const deleteFavorite = (id) => {
    const next = favorites.filter(f => f.id !== id);
    setFavorites(next);
    try { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(next)); } catch {}
  };

  const clearAllSaved = () => {
    if (!window.confirm('保存データ（セッション/お気に入り/履歴）を全てクリアします。よろしいですか？')) return;
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
      localStorage.removeItem(STORAGE_KEYS.favorites);
      localStorage.removeItem(STORAGE_KEYS.history);
    } catch {}
    setMode(null);
    setSelectedWeaponId(null);
    setStage('early');
    setPickedUpgrades([]);
    setSelectedArchetype(null);
    setAvailableChoices([]);
    setFavorites([]);
    setHistory([]);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2 text-center">🦀 Crab Champions Build Advisor</h1>
        <p className="text-blue-200 text-center mb-4">あなたのプレイスタイルに合わせた4つのモード</p>

        {/* 保存/読み込みツールバー */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={() => setShowSavePanel(v => !v)} className="bg-white/15 hover:bg-white/25 text-white">
              💾 保存/読み込み
            </Button>
            <Button onClick={saveFavorite} className="bg-yellow-600 hover:bg-yellow-700 text-white">
              ⭐ お気に入りに保存
            </Button>
            <Button onClick={() => setShowFavoritesList(v => !v)} className="bg-purple-600 hover:bg-purple-700 text-white">
              お気に入り一覧
            </Button>
            <Button onClick={() => setShowHistoryList(v => !v)} className="bg-blue-600 hover:bg-blue-700 text-white">
              🕘 履歴
            </Button>
            <Button onClick={clearAllSaved} className="bg-red-600 hover:bg-red-700 text-white">
              🧹 保存データを全てクリア
            </Button>
          </div>

          {(showSavePanel || showFavoritesList || showHistoryList) && (
            <div className="mt-4 space-y-4">
              {showSavePanel && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">現在のセッション</CardTitle>
                  </CardHeader>
                  <CardContent className="text-white text-sm">
                    <div className="flex flex-wrap gap-3 items-center">
                      <span>モード: {mode || '未選択'}</span>
                      <span>|</span>
                      <span>武器: {selectedWeapon?.name || '未選択'}</span>
                      <span>|</span>
                      <span>ステージ: {stage}</span>
                      <span>|</span>
                      <span>取得済み: {pickedUpgrades.length}件</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showFavoritesList && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">お気に入り</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {favorites.length === 0 ? (
                      <p className="text-blue-200">まだお気に入りはありません。現在の状態を「お気に入りに保存」してください。</p>
                    ) : (
                      <div className="space-y-2">
                        {favorites.map(f => (
                          <div key={f.id} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10 text-white">
                            <div className="min-w-0">
                              <p className="font-semibold truncate">{f.name}</p>
                              <p className="text-xs text-blue-200">{new Date(f.createdAt).toLocaleString()} | {weaponById[f.snapshot.selectedWeaponId]?.name || '武器未選択'} / {f.snapshot.mode || 'モード未選択'}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button onClick={() => loadSnapshot(f.snapshot)} className="bg-green-600 hover:bg-green-700 text-white" size="sm">復元</Button>
                              <Button onClick={() => deleteFavorite(f.id)} className="bg-red-600 hover:bg-red-700 text-white" size="sm">削除</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {showHistoryList && (
                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">履歴（最大100件）</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {history.length === 0 ? (
                      <p className="text-blue-200">履歴はまだありません。操作すると自動で記録されます。</p>
                    ) : (
                      <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                        {history.map((h, idx) => (
                          <div key={h.timestamp + '-' + idx} className="flex items-center justify-between bg-white/5 p-3 rounded border border-white/10 text-white">
                            <div className="min-w-0">
                              <p className="text-sm truncate">{new Date(h.timestamp).toLocaleString()} — {weaponById[h.selectedWeaponId]?.name || '武器未選択'} / {h.mode || 'モード未選択'} / 取得済み{h.pickedUpgrades?.length || 0}件</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button onClick={() => loadSnapshot(h)} className="bg-green-600 hover:bg-green-700 text-white" size="sm">この時点に復元</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        {/* Mode Selection */}
        {!mode && (
          <ModeSelector onSelect={setMode} />
        )}

        {/* Weapon Selection (common for all modes) */}
        {mode && !selectedWeapon && (
          <WeaponSelector
            weapons={weapons}
            onBack={() => { setMode(null); setPickedUpgrades([]); }}
            onSelect={handleWeaponSelect}
          />
        )}

        {/* Mode 1: Guided Mode */}
        {mode === 'guided' && selectedWeapon && (
          <div className="space-y-6">
            <div className="flex gap-4">
<Button onClick={() => { setMode(null); setSelectedWeaponId(null); }} variant="secondary">
                ← モード変更
              </Button>
<Button onClick={() => setSelectedWeaponId(null)} variant="destructive">
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
                    variant={stage === 'early' ? 'primary' : 'secondary'}
                  >
                    序盤 (Stage 1-3)
                  </Button>
<Button
                    onClick={() => setStage('mid')}
                    variant={stage === 'mid' ? 'primary' : 'secondary'}
                  >
                    中盤 (Stage 4-6)
                  </Button>
<Button
                    onClick={() => setStage('late')}
                    variant={stage === 'late' ? 'primary' : 'secondary'}
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
                {guidedRecs.length > 0 ? (
                  <div className="space-y-4">
                    {guidedRecs.map((rec, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-bold text-yellow-300">{idx + 1}. {rec.name}</h3>
                          <Button
                            onClick={() => handleUpgradePick(rec.name)}
variant="success" className="text-sm"
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
<Button onClick={() => { setMode(null); setSelectedWeaponId(null); }} className="bg-gray-500">
                ← モード変更
              </Button>
<Button onClick={() => setSelectedWeaponId(null)} className="bg-red-500">
                武器変更
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">取得済みアップグレードを選択</CardTitle>
              </CardHeader>
              <CardContent>
                <UpgradePicker
                  title={"取得済みアップグレードを選択"}
                  upgrades={allUpgrades}
                  selected={pickedUpgrades}
                  onToggle={(name) => pickedUpgrades.includes(name) ? handleUpgradeUnpick(name) : handleUpgradePick(name)}
                  groupBy="category"
                />
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
                {synergyRecs.length > 0 ? (
                  <div className="space-y-4">
                    {synergyRecs.map((rec, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div>
<h3 className="text-xl font-bold text-white">
                              {rec.name} 
<span className="text-sm text-slate-300 ml-2">シナジー度: {rec.score}</span>
                            </h3>
                            {rec.synergyWith && rec.synergyWith.length > 0 && (
<p className="text-sm text-slate-300 mt-1">
                                相性: {rec.synergyWith.join(', ')}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleUpgradePick(rec.name)}
variant="success" className="text-sm"
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
<Button onClick={() => { setMode(null); setSelectedWeaponId(null); }} className="bg-gray-500">
                ← モード変更
              </Button>
<Button onClick={() => setSelectedWeaponId(null)} className="bg-red-500">
                武器変更
              </Button>
            </div>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">取得済みアップグレード</CardTitle>
              </CardHeader>
              <CardContent>
                <UpgradePicker
                  title={"取得済みアップグレード"}
                  upgrades={allUpgrades}
                  selected={pickedUpgrades}
                  onToggle={(name) => pickedUpgrades.includes(name) ? handleUpgradeUnpick(name) : handleUpgradePick(name)}
                  groupBy="category"
                />
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="text-white">今出ている選択肢を入力</CardTitle>
              </CardHeader>
              <CardContent>
                <UpgradePicker
                  title={"今出ている選択肢"}
                  upgrades={allUpgrades}
                  selected={availableChoices}
                  onToggle={(name) => availableChoices.includes(name)
                    ? setAvailableChoices(availableChoices.filter(c => c !== name))
                    : setAvailableChoices([...availableChoices, name])}
                  groupBy="category"
                  hideNames={pickedUpgrades}
                />
              </CardContent>
            </Card>

            {availableChoices.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">選択肢の評価</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {evaluatedChoices.map((choice, idx) => (
                      <div key={idx} className="bg-white/5 p-4 rounded-lg border border-white/10">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-yellow-300">
                              {idx + 1}. {choice.name}
<span className={`text-sm ml-3 text-slate-300`}>
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
variant="success" className="text-sm ml-4"
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
<Button onClick={() => { setMode(null); setSelectedWeaponId(null); setSelectedArchetype(null); }} variant="secondary">
                ← モード変更
              </Button>
              <Button onClick={() => setSelectedWeaponId(null)} className="bg-red-500">
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
<Button onClick={() => setSelectedArchetype(null)} variant="secondary" size="sm">
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
                    <UpgradePicker
                      title={"取得済みアップグレード"}
                      upgrades={allUpgrades}
                      selected={pickedUpgrades}
                      onToggle={(name) => pickedUpgrades.includes(name) ? handleUpgradeUnpick(name) : handleUpgradePick(name)}
                      groupBy="category"
                    />
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">必要なアップグレード</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {archetypeNeeds.length > 0 ? (
                      <div className="space-y-4">
                        {archetypeNeeds.map((rec, idx) => (
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
                        このビルドに必要なアップグレードは全て取得済みです。
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
