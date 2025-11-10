import React, { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'

// props:
// - title?: string
// - upgrades: Record<string, { category: string; rarity: string; description?: string }>
// - selected: string[]
// - onToggle: (name: string) => void
// - groupBy?: 'category' | null
// - hideNames?: string[] // 表示から除外したい名前
// - compact?: boolean
const UpgradePicker = React.memo(function UpgradePicker({
  title,
  upgrades,
  selected,
  onToggle,
  groupBy = 'category',
  hideNames = [],
  compact = false,
}) {
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState([]) // 空 = 全て
  const [rarityFilter, setRarityFilter] = useState([]) // 空 = 全て
  const [sortAsc, setSortAsc] = useState(true)
  const [showSelectedOnly, setShowSelectedOnly] = useState(false)
  const [pinSelectedFirst, setPinSelectedFirst] = useState(true)

  const names = useMemo(() => Object.keys(upgrades), [upgrades])
  const allCategories = useMemo(() => Array.from(new Set(names.map(n => upgrades[n]?.category).filter(Boolean))), [names, upgrades])
  const allRarities = useMemo(() => Array.from(new Set(names.map(n => upgrades[n]?.rarity).filter(Boolean))), [names, upgrades])
  const hidden = useMemo(() => new Set(hideNames || []), [hideNames])
  const selectedSet = useMemo(() => new Set(selected || []), [selected])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const cats = new Set(categoryFilter)
    const rars = new Set(rarityFilter)
    let list = names.filter(n => !hidden.has(n)).filter(n => {
      const meta = upgrades[n] || {}
      const nameOk = q === '' || n.toLowerCase().includes(q) || (meta.description || '').toLowerCase().includes(q)
      const catOk = categoryFilter.length === 0 || cats.has(meta.category)
      const rarOk = rarityFilter.length === 0 || rars.has(meta.rarity)
      const selOk = !showSelectedOnly || selectedSet.has(n)
      return nameOk && catOk && rarOk && selOk
    })
    list.sort((a, b) => {
      if (pinSelectedFirst) {
        const sa = selectedSet.has(a)
        const sb = selectedSet.has(b)
        if (sa !== sb) return sa ? -1 : 1
      }
      return sortAsc ? a.localeCompare(b) : b.localeCompare(a)
    })
    return list
  }, [names, hidden, upgrades, query, categoryFilter, rarityFilter, sortAsc, showSelectedOnly, pinSelectedFirst, selectedSet])

  const grouped = useMemo(() => {
    if (groupBy !== 'category') return { All: filtered }
    const map = {}
    for (const n of filtered) {
      const cat = upgrades[n]?.category || 'other'
      if (!map[cat]) map[cat] = []
      map[cat].push(n)
    }
    return map
  }, [filtered, groupBy, upgrades])

  const categorySelectedCount = useMemo(() => {
    const counter = {}
    Object.keys(upgrades).forEach(n => {
      const cat = upgrades[n]?.category || 'other'
      if (!counter[cat]) counter[cat] = { total: 0, selected: 0 }
      counter[cat].total += 1
      if (selectedSet.has(n)) counter[cat].selected += 1
    })
    return counter
  }, [upgrades, selectedSet])

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {title && <h3 className="text-white font-semibold mr-2">{title}</h3>}
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="検索（名前/説明）"
          className="rounded-md bg-white/10 text-white placeholder-white/60 px-3 py-2 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
        />
        <Button variant="secondary" size="sm" onClick={() => setSortAsc(!sortAsc)}>
          並び替え: {sortAsc ? 'A→Z' : 'Z→A'}
        </Button>
        <Button variant="secondary" size="sm" onClick={() => { setQuery(''); setCategoryFilter([]); setRarityFilter([]); }}>リセット</Button>
        <Button variant={showSelectedOnly ? 'primary' : 'secondary'} size="sm" onClick={() => setShowSelectedOnly(v => !v)}>
          選択済みのみ
        </Button>
        <Button variant={pinSelectedFirst ? 'primary' : 'secondary'} size="sm" onClick={() => setPinSelectedFirst(v => !v)}>
          選択を先頭に
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-blue-200">カテゴリ:</span>
        {allCategories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])}
            className={`px-2 py-1 rounded text-xs border ${categoryFilter.includes(cat) ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/80 border-white/10'}`}
          >{cat}</button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-blue-200">レアリティ:</span>
        {allRarities.map(r => (
          <button
            key={r}
            onClick={() => setRarityFilter(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r])}
            className={`px-2 py-1 rounded text-xs border ${rarityFilter.includes(r) ? 'bg-white/20 text-white border-white/30' : 'bg-white/5 text-white/80 border-white/10'}`}
          >{r}</button>
        ))}
      </div>

      <div className="space-y-2">
        {/* 選択済みバッジ一覧 */}
        {selected && selected.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {selected.map(n => (
              <span key={n} className="px-2 py-1 rounded-full text-xs bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                ✓ {n}
              </span>
            ))}
          </div>
        )}
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {Object.entries(grouped).map(([cat, list]) => (
            <div key={cat}>
              {groupBy === 'category' && (
                <div className="text-xs uppercase tracking-wide text-blue-300/80 mb-2 flex items-center justify-between">
                  <span>{cat}</span>
                  <span className="text-[10px] text-blue-200">選択 {categorySelectedCount[cat]?.selected || 0}/{categorySelectedCount[cat]?.total || list.length}</span>
                </div>
              )}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {list.map(name => {
                  const isSel = selectedSet.has(name)
                  const rar = upgrades[name]?.rarity
                  return (
                    <Button
                      key={name}
                      size="sm"
                      aria-pressed={isSel}
                      variant={isSel ? 'primary' : 'secondary'}
                      className={`text-sm justify-between ${isSel ? 'border-emerald-400/50 ring-1 ring-emerald-400/40 bg-emerald-500/10 text-emerald-100' : ''}`}
                      title={upgrades[name]?.description || ''}
                      onClick={() => onToggle(name)}
                    >
                      <span className="flex items-center gap-1">
                        {isSel && <span className="text-emerald-300">✓</span>}
                        <span>{name}</span>
                      </span>
                      {rar && (
                        <span className={`ml-2 text-[10px] px-1 py-[1px] rounded border ${
                          rar === 'legendary' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-400/30' :
                          rar === 'epic' ? 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-400/30' :
                          'bg-slate-500/20 text-slate-200 border-slate-400/30'
                        }`}>
                          {rar}
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
})

export default UpgradePicker
