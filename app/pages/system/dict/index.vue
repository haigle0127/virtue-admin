<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DictTypeItem, PageResult } from '~/types/api'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')
const UIcon = resolveComponent('UIcon')

const api = useApi()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  name: '',
  type: '',
  status: 'all'
})

const statusFilterItems = [
  { label: '全部状态', value: 'all' },
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const { rows, total, pageNo, pageSize, loading, load, search, changePage } = usePagedList<DictTypeItem>(query =>
  api.request<PageResult<DictTypeItem>>('/admin-api/dict-type/page', {
    query: {
      ...query,
      name: filters.name || undefined,
      type: filters.type || undefined,
      status: filters.status === 'all' ? undefined : filters.status
    }
  })
)

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<DictTypeItem | null>(null)
const deleting = ref(false)

function resetFilters() {
  filters.name = ''
  filters.type = ''
  filters.status = 'all'
  search()
}

function openCreate() {
  editingId.value = null
  formOpen.value = true
}

function openEdit(row: DictTypeItem) {
  editingId.value = row.id
  formOpen.value = true
}

function openData(row: DictTypeItem) {
  if (!row.type) {
    toast.add({ title: '该字典缺少类型标识', color: 'warning', icon: 'i-lucide-circle-alert' })
    return
  }
  router.push(`/system/dict/${encodeURIComponent(row.type)}`)
}

function askDelete(row: DictTypeItem) {
  deleteTarget.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) {
    return
  }
  deleting.value = true
  try {
    await api.request('/admin-api/dict-type/delete', {
      method: 'DELETE',
      query: { id: deleteTarget.value.id }
    })
    toast.add({ title: '字典类型已删除', color: 'success', icon: 'i-lucide-check' })
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

function getRowItems(row: DictTypeItem) {
  return [
    { type: 'label' as const, label: '操作' },
    {
      label: '管理字典数据',
      icon: 'i-lucide-list-tree',
      onSelect: () => openData(row)
    },
    {
      label: '编辑类型',
      icon: 'i-lucide-pencil',
      onSelect: () => openEdit(row)
    },
    { type: 'separator' as const },
    {
      label: '删除类型',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => askDelete(row)
    }
  ]
}

const columns: TableColumn<DictTypeItem>[] = [
  {
    id: 'name',
    header: '字典名称',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10' }, [
        h(UIcon, { name: 'i-lucide-book-open', class: 'size-4 text-primary' })
      ]),
      h('p', { class: 'truncate text-sm font-medium text-highlighted' }, row.original.name || '未命名字典')
    ])
  },
  {
    id: 'type',
    header: '类型标识',
    cell: ({ row }) => h(
      UBadge,
      { color: 'neutral', variant: 'subtle', class: 'font-mono' },
      () => row.original.type || '—'
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
  await load()
  if (route.query.create === '1') {
    openCreate()
    router.replace({ query: {} })
  }
})
</script>

<template>
  <UDashboardPanel id="dict">
    <template #header>
      <UDashboardNavbar title="字典管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="新建字典类型" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="filters.name"
          icon="i-lucide-search"
          placeholder="搜索字典名称"
          class="w-44"
          @keydown.enter="search"
        />
        <UInput
          v-model="filters.type"
          icon="i-lucide-tag"
          placeholder="搜索类型标识"
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
        empty="暂无字典类型"
      />

      <div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted">
          共 {{ total }} 个字典类型
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

  <DictTypeFormModal
    v-model:open="formOpen"
    :type-id="editingId"
    @saved="load"
  />

  <ConfirmModal
    v-model:open="deleteOpen"
    title="删除字典类型"
    :description="`确定删除「${deleteTarget?.name || '该字典类型'}」吗？该类型下的字典数据不会自动删除。`"
    confirm-label="删除"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>
