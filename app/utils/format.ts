export function displayText(value: unknown) {
  return value === null || value === undefined || value === '' ? '—' : String(value)
}

export function isDisabled(status: unknown) {
  return String(status) === '1'
}

export function dictBadgeColor(colorType?: string | null) {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'error' | 'neutral'> = {
    primary: 'primary',
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'error',
    error: 'error'
  }
  return map[colorType || ''] ?? 'neutral'
}

export const statusOptions = [
  { label: '正常', value: 0 },
  { label: '停用', value: 1 }
]

export const dictStatusOptions = [
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

export const tableUi = {
  base: 'table-fixed border-separate border-spacing-0',
  thead: '[&>tr]:bg-elevated/50 [&>tr]:after:content-none',
  tbody: '[&>tr]:last:[&>td]:border-b-0',
  th: 'py-2 first:rounded-l-lg last:rounded-r-lg border-y border-default first:border-l last:border-r',
  td: 'border-b border-default',
  separator: 'h-0'
}
