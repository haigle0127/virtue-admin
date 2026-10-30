<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const { user, loadUser, logout } = useAuth()
const api = useApi()
const toast = useToast()
const colorMode = useColorMode()

const saving = ref(false)

const state = reactive({
  password: '',
  confirm: ''
})

const schema = z.object({
  password: z.string().min(6, '密码至少 6 位'),
  confirm: z.string().min(1, '请再次输入密码')
}).refine(data => data.password === data.confirm, {
  message: '两次输入的密码不一致',
  path: ['confirm']
})

type Schema = z.output<typeof schema>

const displayName = computed(() => user.value?.nickname || user.value?.username || '未登录用户')
const roles = computed(() => user.value?.roles || [])

onMounted(() => {
  if (!user.value) {
    loadUser().catch(() => {})
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!user.value) {
    return
  }
  saving.value = true
  try {
    await api.request('/admin-api/user/update-password', {
      method: 'PUT',
      body: { id: user.value.id, password: event.data.password }
    })
    toast.add({
      title: '密码已修改',
      description: '请使用新密码重新登录',
      color: 'success',
      icon: 'i-lucide-check'
    })
    state.password = ''
    state.confirm = ''
    await logout()
  } catch (error) {
    toast.add({
      title: '修改失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    saving.value = false
  }
}

const profileFields = computed(() => [{
  label: '用户名',
  value: user.value?.username
}, {
  label: '昵称',
  value: user.value?.nickname
}, {
  label: '邮箱',
  value: user.value?.email
}, {
  label: '手机号',
  value: user.value?.phone
}, {
  label: '用户 ID',
  value: user.value?.id
}, {
  label: '教育背景',
  value: user.value?.education
}])

const themeOptions = [{
  label: '浅色',
  value: 'light',
  icon: 'i-lucide-sun'
}, {
  label: '深色',
  value: 'dark',
  icon: 'i-lucide-moon'
}, {
  label: '跟随系统',
  value: 'system',
  icon: 'i-lucide-monitor'
}]
</script>

<template>
  <UDashboardPanel id="settings" :ui="{ body: 'lg:py-10' }">
    <template #header>
      <UDashboardNavbar title="个人设置">
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="mx-auto flex w-full max-w-3xl flex-col gap-6">
        <UPageCard variant="subtle">
          <div class="flex flex-wrap items-center gap-4">
            <UAvatar
              :alt="displayName"
              :src="user?.avatar || undefined"
              size="xl"
            />
            <div class="min-w-0">
              <p class="text-lg font-semibold text-highlighted">
                {{ displayName }}
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-1.5">
                <UBadge
                  v-for="role in roles"
                  :key="role"
                  color="primary"
                  variant="subtle"
                  size="sm"
                >
                  {{ role }}
                </UBadge>
                <span v-if="!roles.length" class="text-xs text-muted">未分配角色</span>
              </div>
            </div>
          </div>

          <USeparator />

          <dl class="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div v-for="field in profileFields" :key="field.label">
              <dt class="text-xs text-muted">
                {{ field.label }}
              </dt>
              <dd class="mt-1 truncate text-sm text-highlighted">
                {{ displayText(field.value) }}
              </dd>
            </div>
          </dl>

          <template #footer>
            <p class="text-xs text-muted">
              账号资料由管理员在「用户管理」中维护。
            </p>
          </template>
        </UPageCard>

        <UPageCard
          title="修改密码"
          description="修改后当前登录状态会被吊销，需要使用新密码重新登录。"
          variant="subtle"
        >
          <UForm
            id="change-password-form"
            :schema="schema"
            :state="state"
            class="grid max-w-xl gap-4 sm:grid-cols-2"
            @submit="onSubmit"
          >
            <UFormField name="password" label="新密码" required>
              <UInput
                v-model="state.password"
                type="password"
                placeholder="至少 6 位"
                class="w-full"
              />
            </UFormField>
            <UFormField name="confirm" label="确认密码" required>
              <UInput
                v-model="state.confirm"
                type="password"
                placeholder="再次输入新密码"
                class="w-full"
              />
            </UFormField>
          </UForm>

          <template #footer>
            <UButton
              form="change-password-form"
              type="submit"
              label="修改密码"
              :loading="saving"
            />
          </template>
        </UPageCard>

        <UPageCard
          title="外观"
          description="选择界面的显示模式，设置会保存在当前浏览器。"
          variant="subtle"
        >
          <div class="flex flex-wrap gap-2">
            <UButton
              v-for="option in themeOptions"
              :key="option.value"
              :label="option.label"
              :icon="option.icon"
              :color="colorMode.preference === option.value ? 'primary' : 'neutral'"
              :variant="colorMode.preference === option.value ? 'solid' : 'outline'"
              @click="colorMode.preference = option.value as 'light' | 'dark' | 'system'"
            />
          </div>
        </UPageCard>

        <UPageCard
          title="退出登录"
          description="退出后将清除本地令牌，并吊销当前登录会话的刷新令牌。"
          variant="subtle"
          class="bg-linear-to-tl from-error/5 to-default"
        >
          <template #footer>
            <UButton
              label="退出登录"
              icon="i-lucide-log-out"
              color="error"
              variant="subtle"
              @click="logout"
            />
          </template>
        </UPageCard>
      </div>
    </template>
  </UDashboardPanel>
</template>
