import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const WeaponSelector = React.memo(function WeaponSelector({ weapons, onBack, onSelect }) {
  return (
    <>
      <Button onClick={onBack} variant="secondary" className="mb-4">← モード選択に戻る</Button>
      <Card className="bg-white/10 backdrop-blur-lg border-white/20">
        <CardHeader>
          <CardTitle className="text-white">まず武器を選択してください</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {weapons.map(w => (
              <Button key={w.id} onClick={() => onSelect(w)} variant="primary" className="h-24 flex flex-col items-center justify-center">
                <span className="font-bold text-lg">{w.name}</span>
                <span className="text-xs mt-1">Tier {w.tier}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </>
  )
})

export default WeaponSelector
