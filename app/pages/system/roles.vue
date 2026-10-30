<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PageResult, RoleItem } from '~/types/api'

const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const api = useApi()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  name: '',
  code: '',
  status: 'all'
})

const statusFilterItems = [
  { label: '全部状态', value: 'all' },
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const { rows, total, pageNo, pageSize, loading, load, search, changePage } = usePagedList<RoleItem>(query =>
  api.request<PageResult<RoleItem>>('/admin-api/role/page', {
    query: {
      ...query,
      name: filters.name || undefined,
      code: filters.code || undefined,
      status: filters.status === 'all' ? undefined : Number(filters.status)
    }
  })
)

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<RoleItem | null>(null)
const deleting = ref(false)

function roleName(item: RoleItem) {
  return item.name || '未命名角色'
}

function roleCode(item: RoleItem) {
  return item.mark || item.code || ''
}

function resetFilters() {
  filters.name = ''
  filters.code = ''
  filters.status = 'all'
  search()
}

function openCreate() {
  editingId.value = null
  formOpen.value = true
}

function openEdit(row: RoleItem) {
  editingId.value = row.id
  formOpen.value = true
}

function askDelete(row: RoleItem) {
  deleteTarget.value = row
  deleteOpen.value = true
}

async function confirmDelete() {
  if (!deleteTarget.value) {
    return
  }
  deleting.value = true
  try {
    await api.request('/admin-api/role/delete', {
      method: 'DELETE',
      query: { id: deleteTarget.value.id }
    })
    toast.add({ title: '角色已删除', color: 'success', icon: 'i-lucide-check' })
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

function getRowItems(row: RoleItem) {
  return [
    { type: 'label' as const, label: '操作' },
    {
      label: '编辑角色',
      icon: 'i-lucide-pencil',
      onSelect: () => openEdit(row)
    },
    { type: 'separator' as const },
    {
      label: '删除角色',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      onSelect: () => askDelete(row)
    }
  ]
}

const columns: TableColumn<RoleItem>[] = [
  {
    id: 'name',
    header: '角色名称',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h('div', { class: 'flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10' }, [
        h(resolveComponent('UIcon'), { name: 'i-lucide-shield-check', class: 'size-4 text-primary' })
      ]),
      h('p', { class: 'truncate text-sm font-medium text-highlighted' }, roleName(row.original))
    ])
  },
  {
    id: 'code',
    header: '角色标识',
    cell: ({ row }) => h(
      UBadge,
      { color: 'neutral', variant: 'subtle', class: 'font-mono' },
      () => roleCode(row.original) || '—'
    )
  },
  {
    id: 'description',
    header: '说明',
    cell: ({ row }) => h(
      'p',
      { class: 'truncate text-sm text-muted' },
      row.original.description || row.original.remark || '—'
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
        color: isDisabled(row.original.status ?? row.original.state) ? 'error' : 'success',
        variant: 'subtle'
      },
      () => isDisabled(row.original.status ?? row.original.state) ? '停用' : '正常'
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
  <UDashboardPanel id="roles">
    <template #header>
      <UDashboardNavbar title="角色管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="新建角色" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="filters.name"
          icon="i-lucide-search"
          placeholder="搜索角色名称"
          class="w-44"
          @keydown.enter="search"
        />
        <UInput
          v-model="filters.code"
          icon="i-lucide-tag"
          placeholder="搜索角色标识"
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
        empty="暂无角色数据"
      />

      <div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted">
          共 {{ total }} 个角色
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

  <RoleFormModal
    v-model:open="formOpen"
    :role-id="editingId"
    @saved="load"
  />

  <ConfirmModal
    v-model:open="deleteOpen"
    title="删除角色"
    :description="`确定删除「${deleteTarget ? roleName(deleteTarget) : ''}」吗？已绑定该角色的用户会失去对应权限。`"
    confirm-label="删除"
    :loading="deleting"
    @confirm="confirmDelete"
  />
</template>
