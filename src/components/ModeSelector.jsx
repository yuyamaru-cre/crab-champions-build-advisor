import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const ModeSelector = React.memo(function ModeSelector({ onSelect }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[
        { id: 'guided', title: 'ガイド付きモード', desc: '固定優先順位で提案。初心者向け。' },
        { id: 'synergy', title: 'シナジーベースモード', desc: '取得済みと相性の良いものを提案。' },
        { id: 'choice', title: '選択肢評価モード', desc: '今出ている候補を比較評価。' },
        { id: 'archetype', title: 'ビルドアーキタイプモード', desc: '目指す型に必要な要素を提示。' },
      ].map((m) => (
        <Card key={m.id} className="bg-white/10 backdrop-blur-lg border-white/20 cursor-pointer hover:bg-white/20 transition" onClick={() => onSelect(m.id)}>
          <CardHeader>
            <CardTitle className="text-white">{m.title}</CardTitle>
          </CardHeader>
          <CardContent className="text-white">
            <p>{m.desc}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
})

export default ModeSelector
