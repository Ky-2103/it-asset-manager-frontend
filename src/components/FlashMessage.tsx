import type { Flash } from '../types/models'

type Props = {
  flash: Flash | null
}

export function FlashMessage({ flash }: Props) {
  if (!flash) return null
  return <div className={`flash ${flash.kind}`}>{flash.text}</div>
}
