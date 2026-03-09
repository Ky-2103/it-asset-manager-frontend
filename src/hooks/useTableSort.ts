import { useMemo, useState } from 'react'

export type SortDirection = 'asc' | 'desc'

type SortValue = string | number | Date | null | undefined

type SortAccessor<T> = (row: T) => SortValue

type SortAccessors<T, TField extends string> = Record<TField, SortAccessor<T>>

type UseTableSortOptions<T, TField extends string> = {
  rows: T[]
  initialField: TField
  accessors: SortAccessors<T, TField>
}

function compareSortValues(a: SortValue, b: SortValue) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  if (typeof a === 'number' && typeof b === 'number') {
    return a - b
  }

  const aDate = a instanceof Date ? a.getTime() : null
  const bDate = b instanceof Date ? b.getTime() : null

  if (aDate != null && bDate != null) {
    return aDate - bDate
  }

  return String(a).localeCompare(String(b))
}

export function useTableSort<T, TField extends string>({ rows, initialField, accessors }: UseTableSortOptions<T, TField>) {
  const [sortField, setSortField] = useState<TField>(initialField)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  function handleSort(field: TField) {
    if (sortField === field) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortDirection('asc')
  }

  function getSortArrow(field: TField) {
    if (sortField !== field) return '↕'
    return sortDirection === 'asc' ? '↑' : '↓'
  }

  const sortedRows = useMemo(() => {
    const direction = sortDirection === 'asc' ? 1 : -1
    const accessor = accessors[sortField]

    return [...rows].sort((a, b) => compareSortValues(accessor(a), accessor(b)) * direction)
  }, [accessors, rows, sortDirection, sortField])

  return {
    sortField,
    sortDirection,
    sortedRows,
    handleSort,
    getSortArrow,
  }
}
