<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

definePageMeta({
  layout: false
})

const route = useRoute()
const auth = useAuth()
const toast = useToast()
const colorMode = useColorMode()

const loading = ref(false)
const showPassword = ref(false)

const state = reactive({
  username: '',
  password: ''
})

const schema = z.object({
  username: z.string().trim().min(1, '请输入账号'),
  password: z.string().min(1, '请输入密码')
})

type Schema = z.output<typeof schema>

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function onSubmit(event: FormSubmitEvent<Schema>) {
  loading.value = true
  try {
    await auth.login(event.data.username, event.data.password)
    const redirect = typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
      ? route.query.redirect
      : '/'
    await navigateTo(redirect)
  } catch (error) {
    toast.add({
      title: '登录失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    loading.value = false
  }
}

const highlights = [{
  icon: 'i-lucide-key-round',
  title: '无状态 JWT 鉴权',
  description: '访问令牌短期有效，刷新令牌自动轮换'
}, {
  icon: 'i-lucide-shield-check',
  title: '基于角色的权限控制',
  description: '一个账号可绑定多个角色'
}, {
  icon: 'i-lucide-layers',
  title: '统一的后台体验',
  description: '用户、角色、字典集中管理'
}]
</script>

<template>
  <div class="min-h-svh bg-default lg:grid lg:grid-cols-[1.05fr_1fr]">
    <aside class="relative hidden flex-col justify-between overflow-hidden bg-green-950 p-12 text-white lg:flex xl:p-16">
      <div class="bg-grid absolute inset-0 opacity-40" />
      <div class="absolute -right-32 -top-32 size-96 rounded-full bg-primary-500/25 blur-3xl" />

      <div class="relative flex items-center gap-3">
        <div class="flex size-11 items-center justify-center rounded-2xl bg-linear-to-br from-primary-400 to-primary-600 shadow-lg shadow-primary-900/40">
          <UIcon name="i-lucide-hexagon" class="size-6" />
        </div>
        <div class="leading-tight">
          <p class="text-lg font-semibold tracking-wide">
            Virtue
          </p>
          <p class="text-xs text-green-200/70">
            管理后台
          </p>
        </div>
      </div>

      <div class="relative max-w-lg">
        <p class="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-green-100/80">
          <span class="size-1.5 rounded-full bg-primary-400" />
          Spring Boot · Spring Security · Nuxt
        </p>
        <h1 class="text-4xl font-semibold leading-tight tracking-tight xl:text-5xl">
          把系统管理，
          <br>
          做得更优雅。
        </h1>
        <p class="mt-5 max-w-md text-base leading-relaxed text-green-100/70">
          Virtue 提供一套干净、可靠的权限与数据管理方案，让日常运维专注在真正重要的事情上。
        </p>
      </div>

      <div class="relative grid gap-4">
        <div
          v-for="item in highlights"
          :key="item.title"
          class="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
        >
          <div class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10">
            <UIcon :name="item.icon" class="size-4 text-primary-300" />
          </div>
          <div>
            <p class="text-sm font-medium">
              {{ item.title }}
            </p>
            <p class="mt-0.5 text-xs text-green-100/60">
              {{ item.description }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <main class="relative flex min-h-svh items-center justify-center px-6 py-12 lg:px-12">
      <div class="absolute right-6 top-6">
        <UButton
          :icon="colorMode.value === 'dark' ? 'i-lucide-sun' : 'i-lucide-moon'"
          color="neutral"
          variant="ghost"
          square
          aria-label="切换主题"
          @click="toggleTheme"
        />
      </div>

      <div class="w-full max-w-sm">
        <div class="mb-10 flex items-center gap-3 lg:hidden">
          <div class="flex size-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-400 to-primary-600">
            <UIcon name="i-lucide-hexagon" class="size-5 text-white" />
          </div>
          <div class="leading-tight">
            <p class="text-base font-semibold text-highlighted">
              Virtue
            </p>
            <p class="text-xs text-muted">
              管理后台
            </p>
          </div>
        </div>

        <div class="mb-8">
          <h2 class="text-2xl font-semibold tracking-tight text-highlighted">
            欢迎回来
          </h2>
          <p class="mt-2 text-sm text-muted">
            登录后即可管理系统账号、角色与字典数据
          </p>
        </div>

        <UForm
          :schema="schema"
          :state="state"
          class="space-y-5"
          @submit="onSubmit"
        >
          <UFormField name="username" label="账号">
            <UInput
              v-model="state.username"
              size="lg"
              icon="i-lucide-user"
              placeholder="用户名 / 邮箱 / 手机号"
              autocomplete="username"
              class="w-full"
            />
          </UFormField>

          <UFormField name="password" label="密码">
            <UInput
              v-model="state.password"
              :type="showPassword ? 'text' : 'password'"
              size="lg"
              icon="i-lucide-lock"
              placeholder="请输入密码"
              autocomplete="current-password"
              class="w-full"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="link"
                  size="xs"
                  :aria-label="showPassword ? '隐藏密码' : '显示密码'"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <UButton
            type="submit"
            size="lg"
            block
            :loading="loading"
            label="登录"
          />
        </UForm>

        <div class="mt-6 flex items-start gap-3 rounded-xl border border-default bg-elevated/40 p-3.5">
          <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-primary" />
          <p class="text-xs leading-relaxed text-muted">
            本地开发默认账号 <span class="font-medium text-highlighted">admin</span>，密码
            <span class="font-medium text-highlighted">123456</span>。请勿用于生产环境。
          </p>
        </div>

        <p class="mt-10 text-center text-xs text-dimmed">
          Virtue © 2016–2026 · haigletech
        </p>
      </div>
    </main>
  </div>
</template>
