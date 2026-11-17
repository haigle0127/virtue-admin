import type { PageResult } from '~/types/api'

export interface PageQuery {
  pageNo: number
  pageSize: number
}

/**
 * 服务端分页列表。筛选条件由调用方在 fetchPage 闭包里读取
 */
export function usePagedList<T>(fetchPage: (query: PageQuery) => Promise<PageResult<T>>) {
  const toast = useToast()
  const rows = shallowRef<T[]>([])
  const total = ref(0)
  const pageNo = ref(1)
  const pageSize = ref(10)
  const loading = ref(false)

  async function load() {
    loading.value = true
    try {
      const result = await fetchPage({ pageNo: pageNo.value, pageSize: pageSize.value })
      rows.value = result.list ?? []
      total.value = Number(result.total ?? 0)
    } catch (error) {
      toast.add({
        title: '加载列表失败',
        description: (error as Error).message,
        color: 'error',
        icon: 'i-lucide-circle-alert'
      })
    } finally {
      loading.value = false
    }
  }

  function search() {
    pageNo.value = 1
    return load()
  }

  function changePage(page: number) {
    pageNo.value = page
    return load()
  }

  return { rows, total, pageNo, pageSize, loading, load, search, changePage }
}
