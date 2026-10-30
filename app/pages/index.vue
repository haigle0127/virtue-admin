<script setup lang="ts">
import type { DictDataItem, DictTypeItem, PageResult, RoleItem, UserPageItem } from '~/types/api'

const api = useApi()
const toast = useToast()
const { user } = useAuth()

const loading = ref(true)
const stats = reactive({
  users: 0,
  roles: 0,
  dictTypes: 0,
  dictData: 0
})
const recentUsers = ref<UserPageItem[]>([])

const greeting = computed(() => {
  const name = user.value?.nickname || user.value?.username
  return name ? `欢迎回来，${name}` : '欢迎回来'
})

function userName(item: UserPageItem) {
  return item.nickname || item.username || '未命名用户'
}

async function load() {
  loading.value = true
  try {
    const [users, roles, dictTypes, dictData, recent] = await Promise.all([
      api.request<PageResult<UserPageItem>>('/admin-api/user/page', { query: { pageNo: 1, pageSize: 1 } }),
      api.request<PageResult<RoleItem>>('/admin-api/role/page', { query: { pageNo: 1, pageSize: 1 } }),
      api.request<PageResult<DictTypeItem>>('/admin-api/dict-type/page', { query: { pageNo: 1, pageSize: 1 } }),
      api.request<PageResult<DictDataItem>>('/admin-api/dict-data/page', { query: { pageNo: 1, pageSize: 1 } }),
      api.request<PageResult<UserPageItem>>('/admin-api/user/page', { query: { pageNo: 1, pageSize: 5 } })
    ])
    stats.users = Number(users.total ?? 0)
    stats.roles = Number(roles.total ?? 0)
    stats.dictTypes = Number(dictTypes.total ?? 0)
    stats.dictData = Number(dictData.total ?? 0)
    recentUsers.value = recent.list ?? []
  } catch (error) {
    toast.add({
      title: '加载概览失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    loading.value = false
  }
}

onMounted(load)

const quickActions = [{
  label: '新建用户',
  description: '创建后台登录账号',
  icon: 'i-lucide-user-plus',
  to: '/system/users?create=1'
}, {
  label: '新建角色',
  description: '定义一组权限标识',
  icon: 'i-lucide-shield-plus',
  to: '/system/roles?create=1'
}, {
  label: '新建字典',
  description: '维护系统枚举数据',
  icon: 'i-lucide-book-plus',
  to: '/system/dict?create=1'
}]
</script>

<template>
  <UDashboardPanel id="home">
    <template #header>
      <UDashboardNavbar title="仪表盘">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            label="刷新"
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            :loading="loading"
            @click="load"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p class="text-sm text-muted">
            {{ greeting }}
          </p>
          <h1 class="mt-1 text-2xl font-semibold tracking-tight text-highlighted">
            系统概览
          </h1>
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="用户总数"
          :value="stats.users"
          hint="可登录后台的账号"
          icon="i-lucide-users"
          :loading="loading"
        />
        <StatCard
          label="角色总数"
          :value="stats.roles"
          hint="参与接口鉴权的角色"
          icon="i-lucide-shield-check"
          :loading="loading"
        />
        <StatCard
          label="字典类型"
          :value="stats.dictTypes"
          hint="系统枚举分组"
          icon="i-lucide-book-open"
          :loading="loading"
        />
        <StatCard
          label="字典数据"
          :value="stats.dictData"
          hint="所有枚举项"
          icon="i-lucide-list-tree"
          :loading="loading"
        />
      </div>

      <div class="grid gap-4 xl:grid-cols-3">
        <UPageCard
          title="最近用户"
          description="最新创建的 5 个账号"
          variant="subtle"
          class="xl:col-span-2"
        >
          <template #footer>
            <UButton
              to="/system/users"
              label="查看全部"
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-arrow-right"
            />
          </template>

          <div v-if="loading" class="space-y-3">
            <USkeleton v-for="i in 4" :key="i" class="h-12 w-full" />
          </div>

          <div v-else-if="!recentUsers.length" class="py-10 text-center text-sm text-muted">
            暂无用户数据
          </div>

          <div v-else class="divide-y divide-default">
            <div
              v-for="item in recentUsers"
              :key="item.id"
              class="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
            >
              <UAvatar :alt="userName(item)" size="sm" />
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-highlighted">
                  {{ userName(item) }}
                </p>
                <p class="truncate text-xs text-muted">
                  @{{ item.username || '未设置账号' }}
                </p>
              </div>
              <UBadge
                :color="isDisabled(item.status) ? 'error' : 'success'"
                variant="subtle"
                size="sm"
              >
                {{ isDisabled(item.status) ? '停用' : '正常' }}
              </UBadge>
            </div>
          </div>
        </UPageCard>

        <UPageCard title="快捷操作" description="常用管理入口" variant="subtle">
          <div class="space-y-2">
            <NuxtLink
              v-for="action in quickActions"
              :key="action.to"
              :to="action.to"
              class="flex items-center gap-3 rounded-xl border border-default p-3 transition hover:bg-elevated/60"
            >
              <div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <UIcon :name="action.icon" class="size-4 text-primary" />
              </div>
              <div class="min-w-0">
                <p class="text-sm font-medium text-highlighted">
                  {{ action.label }}
                </p>
                <p class="truncate text-xs text-muted">
                  {{ action.description }}
                </p>
              </div>
              <UIcon name="i-lucide-chevron-right" class="ms-auto size-4 text-dimmed" />
            </NuxtLink>
          </div>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
