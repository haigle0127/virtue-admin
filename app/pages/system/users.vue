<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { PageResult, UserPageItem } from '~/types/api'

const UAvatar = resolveComponent('UAvatar')
const UBadge = resolveComponent('UBadge')
const UButton = resolveComponent('UButton')
const UCheckbox = resolveComponent('UCheckbox')
const UDropdownMenu = resolveComponent('UDropdownMenu')

const api = useApi()
const auth = useAuth()
const toast = useToast()
const route = useRoute()
const router = useRouter()

const filters = reactive({
  username: '',
  mobile: '',
  status: 'all'
})

const statusFilterItems = [
  { label: '全部状态', value: 'all' },
  { label: '正常', value: '0' },
  { label: '停用', value: '1' }
]

const { rows, total, pageNo, pageSize, loading, load, search, changePage } = usePagedList<UserPageItem>(query =>
  api.request<PageResult<UserPageItem>>('/admin-api/user/page', {
    query: {
      ...query,
      username: filters.username || undefined,
      mobile: filters.mobile || undefined,
      status: filters.status === 'all' ? undefined : Number(filters.status)
    }
  })
)

const rowSelection = ref<Record<string, boolean>>({})
const selectedIds = computed(() => Object.keys(rowSelection.value).filter(id => rowSelection.value[id]))
const deletableIds = computed(() => selectedIds.value.filter(id => String(id) !== String(auth.user.value?.id)))

const formOpen = ref(false)
const editingId = ref<string | null>(null)
const passwordOpen = ref(false)
const passwordTarget = ref<UserPageItem | null>(null)
const deleteOpen = ref(false)
const deleteTarget = ref<UserPageItem | null>(null)
const batchOpen = ref(false)
const deleting = ref(false)

function userName(item: UserPageItem) {
  return item.nickname || item.username || '未命名用户'
}

function isSelf(item: UserPageItem) {
  return String(item.id) === String(auth.user.value?.id)
}

function resetFilters() {
  filters.username = ''
  filters.mobile = ''
  filters.status = 'all'
  search()
}

async function refresh() {
  rowSelection.value = {}
  await load()
}

function onPageChange(page: number) {
  rowSelection.value = {}
  changePage(page)
}

function openCreate() {
  editingId.value = null
  formOpen.value = true
}

function openEdit(row: UserPageItem) {
  editingId.value = row.id
  formOpen.value = true
}

function openPassword(row: UserPageItem) {
  passwordTarget.value = row
  passwordOpen.value = true
}

function askDelete(row: UserPageItem) {
  if (isSelf(row)) {
    return
  }
  deleteTarget.value = row
  deleteOpen.value = true
}

async function toggleStatus(row: UserPageItem) {
  if (isSelf(row)) {
    return
  }
  try {
    await api.request('/admin-api/user/update-status', {
      method: 'PUT',
      body: { id: row.id, status: isDisabled(row.status) ? 0 : 1 }
    })
    toast.add({
      title: isDisabled(row.status) ? '账号已启用' : '账号已停用',
      color: 'success',
      icon: 'i-lucide-check'
    })
    await load()
  } catch (error) {
    toast.add({
      title: '操作失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  }
}

async function confirmDelete() {
  if (!deleteTarget.value) {
    return
  }
  deleting.value = true
  try {
    await api.request('/admin-api/user/delete', {
      method: 'DELETE',
      query: { id: deleteTarget.value.id }
    })
    toast.add({ title: '用户已删除', color: 'success', icon: 'i-lucide-check' })
    deleteOpen.value = false
    deleteTarget.value = null
    await refresh()
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

async function confirmBatchDelete() {
  if (!deletableIds.value.length) {
    return
  }
  deleting.value = true
  try {
    await api.request('/admin-api/user/delete-list', {
      method: 'DELETE',
      query: { ids: deletableIds.value.join(',') }
    })
    toast.add({ title: `已删除 ${deletableIds.value.length} 个用户`, color: 'success', icon: 'i-lucide-check' })
    batchOpen.value = false
    await refresh()
  } catch (error) {
    toast.add({
      title: '批量删除失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    deleting.value = false
  }
}

function getRowItems(row: UserPageItem) {
  const self = isSelf(row)
  return [
    { type: 'label' as const, label: '操作' },
    {
      label: '编辑资料',
      icon: 'i-lucide-pencil',
      onSelect: () => openEdit(row)
    },
    {
      label: '重置密码',
      icon: 'i-lucide-key-round',
      onSelect: () => openPassword(row)
    },
    {
      label: isDisabled(row.status) ? '启用账号' : '停用账号',
      icon: isDisabled(row.status) ? 'i-lucide-circle-check' : 'i-lucide-circle-pause',
      disabled: self,
      onSelect: () => toggleStatus(row)
    },
    { type: 'separator' as const },
    {
      label: self ? '删除用户（当前账号）' : '删除用户',
      icon: 'i-lucide-trash-2',
      color: 'error' as const,
      disabled: self,
      onSelect: () => askDelete(row)
    }
  ]
}

const columns: TableColumn<UserPageItem>[] = [
  {
    id: 'select',
    header: ({ table }) => h(UCheckbox, {
      'modelValue': table.getIsSomePageRowsSelected()
        ? 'indeterminate'
        : table.getIsAllPageRowsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => table.toggleAllPageRowsSelected(!!value),
      'ariaLabel': '全选'
    }),
    cell: ({ row }) => h(UCheckbox, {
      'modelValue': row.getIsSelected(),
      'onUpdate:modelValue': (value: boolean | 'indeterminate') => row.toggleSelected(!!value),
      'ariaLabel': '选择该行'
    })
  },
  {
    id: 'user',
    header: '用户',
    cell: ({ row }) => h('div', { class: 'flex items-center gap-3' }, [
      h(UAvatar, { alt: userName(row.original), size: 'sm' }),
      h('div', { class: 'min-w-0' }, [
        h('p', { class: 'truncate text-sm font-medium text-highlighted' }, userName(row.original)),
        h('p', { class: 'truncate text-xs text-muted' }, `@${row.original.username || '未设置账号'}`)
      ])
    ])
  },
  {
    id: 'contact',
    header: '联系方式',
    cell: ({ row }) => h('div', { class: 'min-w-0' }, [
      h('p', { class: 'truncate text-sm text-default' }, displayText(row.original.phone || row.original.mobile)),
      h('p', { class: 'truncate text-xs text-muted' }, displayText(row.original.email))
    ])
  },
  {
    accessorKey: 'status',
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
  <UDashboardPanel id="users">
    <template #header>
      <UDashboardNavbar title="用户管理">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton icon="i-lucide-plus" label="新建用户" @click="openCreate" />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-center gap-2">
        <UInput
          v-model="filters.username"
          icon="i-lucide-search"
          placeholder="搜索用户名"
          class="w-44"
          @keydown.enter="search"
        />
        <UInput
          v-model="filters.mobile"
          icon="i-lucide-smartphone"
          placeholder="搜索手机号"
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

        <div class="ms-auto">
          <UButton
            v-if="deletableIds.length"
            :label="`批量删除 (${deletableIds.length})`"
            icon="i-lucide-trash-2"
            color="error"
            variant="subtle"
            @click="batchOpen = true"
          />
        </div>
      </div>

      <UTable
        v-model:row-selection="rowSelection"
        :data="rows"
        :columns="columns"
        :loading="loading"
        :get-row-id="(row: UserPageItem) => row.id"
        :ui="tableUi"
        empty="暂无用户数据"
      />

      <div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-default pt-4">
        <p class="text-sm text-muted">
          共 {{ total }} 个用户
        </p>
        <UPagination
          :page="pageNo"
          :items-per-page="pageSize"
          :total="total"
          @update:page="onPageChange"
        />
      </div>
    </template>
  </UDashboardPanel>

  <UserFormModal
    v-model:open="formOpen"
    :user-id="editingId"
    @saved="refresh"
  />

  <UserPasswordModal
    v-model:open="passwordOpen"
    :user-id="passwordTarget?.id"
    :username="passwordTarget?.username"
    @saved="refresh"
  />

  <ConfirmModal
    v-model:open="deleteOpen"
    title="删除用户"
    :description="`确定删除「${deleteTarget ? userName(deleteTarget) : ''}」吗？该操作会吊销其登录状态，且不可恢复。`"
    confirm-label="删除"
    :loading="deleting"
    @confirm="confirmDelete"
  />

  <ConfirmModal
    v-model:open="batchOpen"
    title="批量删除用户"
    :description="`将删除选中的 ${deletableIds.length} 个用户，并吊销他们的登录状态，此操作不可恢复。`"
    confirm-label="批量删除"
    :loading="deleting"
    @confirm="confirmBatchDelete"
  />
</template>
