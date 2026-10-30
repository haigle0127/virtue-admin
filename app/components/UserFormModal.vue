<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RoleItem, UserDetail, UserSavePayload } from '~/types/api'

const props = defineProps<{
  userId?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [] }>()

const api = useApi()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)
const roleOptions = ref<{ label: string, value: string }[]>([])

const state = reactive({
  username: '',
  nickname: '',
  email: '',
  phone: '',
  password: '',
  status: 0,
  roleIds: [] as string[]
})

const isEdit = computed(() => !!props.userId)
const title = computed(() => isEdit.value ? '编辑用户' : '新建用户')

const schema = z.object({
  username: z.string().trim().min(1, '请输入用户名'),
  nickname: z.string().trim().optional(),
  email: z.string().trim().refine(v => !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), '邮箱格式不正确'),
  phone: z.string().trim().refine(v => !v || /^1\d{10}$/.test(v), '请输入 11 位手机号'),
  password: z.string().refine(v => !v || v.length >= 6, '密码至少 6 位'),
  status: z.number().int(),
  roleIds: z.array(z.string())
})

type Schema = z.output<typeof schema>

function resetState() {
  Object.assign(state, {
    username: '',
    nickname: '',
    email: '',
    phone: '',
    password: '',
    status: 0,
    roleIds: []
  })
}

function fillState(detail: UserDetail) {
  Object.assign(state, {
    username: detail.username || '',
    nickname: detail.nickname || '',
    email: detail.email || '',
    phone: detail.phone || detail.mobile || '',
    password: '',
    status: detail.status ?? 0,
    roleIds: (detail.roleIds || []).map(String)
  })
}

async function prepare() {
  loading.value = true
  try {
    const roles = await api.request<RoleItem[]>('/admin-api/role/simple-list')
    roleOptions.value = roles.map(role => ({
      label: role.name || role.mark || '未命名角色',
      value: role.id
    }))
    if (props.userId) {
      const detail = await api.request<UserDetail>('/admin-api/user/get', { query: { id: props.userId } })
      fillState(detail)
    } else {
      resetState()
    }
  } catch (error) {
    toast.add({
      title: '加载用户信息失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    loading.value = false
  }
}

watch(open, (value) => {
  if (value) {
    prepare()
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  try {
    const data = event.data
    const payload: UserSavePayload = {
      username: data.username,
      nickname: data.nickname,
      email: data.email,
      phone: data.phone,
      status: data.status,
      roleIds: data.roleIds.map(Number)
    }
    if (props.userId) {
      payload.id = props.userId
    } else if (data.password) {
      payload.password = data.password
    }

    await api.request(props.userId ? '/admin-api/user/update' : '/admin-api/user/create', {
      method: props.userId ? 'PUT' : 'POST',
      body: payload
    })

    toast.add({
      title: isEdit.value ? '用户已更新' : '用户已创建',
      color: 'success',
      icon: 'i-lucide-check'
    })
    open.value = false
    emit('saved')
  } catch (error) {
    toast.add({
      title: '保存失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="open"
    :title="title"
    :description="isEdit ? '修改账号信息与角色绑定' : '创建一个新的后台账号'"
    :dismissible="!saving"
  >
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>

      <UForm
        v-else
        id="user-form"
        :schema="schema"
        :state="state"
        class="grid gap-4 sm:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField name="username" label="用户名" required>
          <UInput v-model="state.username" placeholder="登录账号" class="w-full" />
        </UFormField>

        <UFormField name="nickname" label="昵称">
          <UInput v-model="state.nickname" placeholder="显示名称" class="w-full" />
        </UFormField>

        <UFormField name="email" label="邮箱">
          <UInput
            v-model="state.email"
            type="email"
            placeholder="name@example.com"
            class="w-full"
          />
        </UFormField>

        <UFormField name="phone" label="手机号">
          <UInput v-model="state.phone" placeholder="11 位手机号" class="w-full" />
        </UFormField>

        <UFormField
          v-if="!isEdit"
          name="password"
          label="初始密码"
          description="留空默认为 123456"
        >
          <UInput
            v-model="state.password"
            type="password"
            placeholder="至少 6 位"
            class="w-full"
          />
        </UFormField>

        <UFormField name="status" label="状态">
          <USelect v-model="state.status" :items="statusOptions" class="w-full" />
        </UFormField>

        <UFormField name="roleIds" label="角色" class="sm:col-span-2">
          <USelectMenu
            v-model="state.roleIds"
            :items="roleOptions"
            value-key="value"
            multiple
            placeholder="选择该用户拥有的角色"
            class="w-full"
          />
        </UFormField>
      </UForm>
    </template>

    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton
          label="取消"
          color="neutral"
          variant="ghost"
          :disabled="saving"
          @click="open = false"
        />
        <UButton
          form="user-form"
          type="submit"
          :label="isEdit ? '保存修改' : '创建用户'"
          :loading="saving"
          :disabled="loading"
        />
      </div>
    </template>
  </UModal>
</template>
