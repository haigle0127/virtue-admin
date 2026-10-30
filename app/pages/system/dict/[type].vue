<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DictDataItem, DictTypeItem, PageResult } from '~/types/api'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const api = useApi()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const dictType = computed(() => decodeURIComponent(String(route.params.type || '')))
const typeName = ref('')
const typeRemark = ref('')

const filters = reactive({
  label: '',
  status: 'all'
})

const statusFilterItems = [
  { label: '全部状态', value: 'all' },
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const { rows, total, pageNo, pageSize, loading, load, search, changePage } = usePagedList<DictDataItem>(query =>
  api.request<PageResult<DictDataItem>>('/admin-api/dict-data/page', {
    query: {
      ...query,
      dictType: dictType.value,
      label: filters.label || undefined,
      status: filters.status === 'all' ? undefined : filters.status
    }
  })
)

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<DictDataItem | null>(null)
const deleting = ref(false)

const pageTitle = computed(() => typeName.value ? `字典数据 · ${typeName.value}` : '字典数据')

async function loadTypeInfo() {
  try {
    const list = await api.request<DictTypeItem[]>('/admin-api/dict-type/simple-list')
    const found = list.find(item => item.type === dictType.value)
    typeName.value = found?.name || dictType.value
    typeRemark.value = found?.remark || ''
  } catch {
    typeName.value = dictType.value
    typeRemark.value = ''
  }
}

function resetFilters() {
  filters.label = ''
  filters.status = 'all'
  search()
}

function openCreate() {
  editingId.value = null
  formOpen.value = true
}

function openEdit(row: DictDataItem) {
  editingId.value = row.id
  formOpen.value = true
}

function askDelete(row: DictDataItem) {
  deleteTarget.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) {
    return
  }
  deleting.value = true
  try {
    await api.request('/admin-api/dict-data/delete', {
      method: 'DELETE',
      query: { id: deleteTarget.value.id }
    })
    toast.add({ title: '字典数据已删除', color: 'success', icon: 'i-lucide-check' })
    deleteOpen.value = false
    deleteTarget.value = null
    await load()
  } catch (error) {
    toast.add({
      title: '删除失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    deleting.value = false
  }
}

function getRowItems(row: DictDataItem) {
  return [
    { type: 'label' as const, label: '操作' },
    {
      label: '编辑数据',
      icon: 'i-lucide-pencil',
      onSelect: () => openEdit(row)
    },
    { type: 'separator' as const },
    {
      label: '删除数据',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => askDelete(row)
    }
  ]
}

const columns: TableColumn<DictDataItem>[] = [
  {
    id: 'label',
    header: '标签',
    cell: ({ row }) => h(
      UBadge,
      { color: dictBadgeColor(row.original.colorType), variant: 'subtle' },
      () => row.original.label || '—'
    )
  },
  {
    id: 'value',
    header: '字典值',
    cell: ({ row }) => h(
      'span',
      { class: 'font-mono text-sm text-default' },
      displayText(row.original.value)
    )
  },
  {
    id: 'sort',
    header: '排序',
    cell: ({ row }) => h('span', { class: 'text-sm text-muted' }, displayText(row.original.sort))
  },
  {
    id: 'status',
    header: '状态',
    cell: ({ row }) => h(
      UBadge,
      {
        color: isDisabled(row.original.status) ? 'error' : 'success',
        variant: 'subtle'
      },
      () => isDisabled(row.original.status) ? '停用' : '正常'
    )
  },
  {
    id: 'remark',
    header: '备注',
    cell: ({ row }) => h(
      'p',
      { class: 'truncate text-sm text-muted' },
      displayText(row.original.remark)
    )
  },
  {
    id: 'actions',
    header: '',
    cell: ({ row }) => h('div', { class: 'flex justify-end' }, [
      h(
        UDropdownMenu,
        {
          content: { align: 'end' },
          items: getRowItems(row.original)
        },
        () => h(UButton, {
          icon: 'i-lucide-ellipsis-vertical',
          color: 'neutral',
          variant: 'ghost',
          square: true
        })
      )
    ])
  }
]

onMounted(async () => {
  await Promise.all([loadTypeInfo(), load()])
})

watch(dictType, () => {
  filters.label = ''
  filters.status = 'all'
  loadTypeInfo()
  search()
})
</script>

<template>
  <UDashboardPanel id="dict-data">
    <template #header>
      <UDashboardNavbar :title="pageTitle">
        <template #leading>
          <UDashboardSidebarCollapse />
          <UButton
            icon="i-lucide-arrow-left"
            color="neutral"
            variant="ghost"
            square
            aria-label="返回字典管理"
            @click="router.push('/system/dict')"
          />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="新建字典数据" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center gap-2 text-sm">
        <UBadge color="neutral" variant="subtle" class="font-mono">
          {{ dictType }}
        </UBadge>
        <span class="text-muted">{{ typeRemark || '该类型下的枚举数据' }}</span>
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="filters.label"
          icon="i-lucide-search"
          placeholder="搜索字典标签"
          class="w-44"
          @keydown.enter="search"
        />
        <USelect v-model="filters.status" :items="statusFilterItems" class="w-32" />
        <UButton label="查询" icon="i-lucide-search" @click="search" />
        <UButton
          label="重置"
          color="neutral"
          variant="ghost"
          @click="resetFilters"
        />
      </div>

      <UTable
        :data="rows"
        :columns="columns"
        :loading="loading"
        :ui="tableUi"
        empty="该字典类型下暂无数据"
      />

      <div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted">
          共 {{ total }} 条字典数据
        </p>
        <UPagination
          :page="pageNo"
          :items-per-page="pageSize"
          :total="total"
          @update:page="changePage"
        />
      </div>
    </template>
  </UDashboardPanel>

  <DictDataFormModal
    v-model:open="formOpen"
    :dict-type="dictType"
    :data-id="editingId"
    @saved="load"
  />

  <ConfirmModal
    v-model:open="deleteOpen"
    title="删除字典数据"
    :description="`确定删除「${deleteTarget?.label || '该字典数据'}」吗？此操作不可恢复。`"
    confirm-label="删除"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>
