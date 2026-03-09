import { useCallback, useState } from 'react'
import type { Flash } from '../types/models'

export function useFlash() {
  const [flash, setFlash] = useState<Flash | null>(null)

  const showFlash = useCallback((kind: Flash['kind'], text: string) => {
    setFlash({ kind, text })
  }, [])

  const clearFlash = useCallback(() => {
    setFlash(null)
  }, [])

  return { flash, showFlash, clearFlash }
}
