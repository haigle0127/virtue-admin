<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'

const props = defineProps<{
  userId?: string | null
  username?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [] }>()

const api = useApi()
const toast = useToast()
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

watch(open, (value) => {
  if (value) {
    state.password = ''
    state.confirm = ''
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  if (!props.userId) {
    return
  }
  saving.value = true
  try {
    await api.request('/admin-api/user/update-password', {
      method: 'PUT',
      body: { id: props.userId, password: event.data.password }
    })
    toast.add({
      title: '密码已重置',
      description: '该用户需要重新登录',
      color: 'success',
      icon: 'i-lucide-check'
    })
    open.value = false
    emit('saved')
  } catch (error) {
    toast.add({
      title: '重置失败',
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
    title="重置密码"
    :description="`为 ${username || '该用户'} 设置新的登录密码`"
    :dismissible="!saving"
  >
    <template #body>
      <UForm
        id="password-form"
        :schema="schema"
        :state="state"
        class="space-y-4"
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
          form="password-form"
          type="submit"
          label="重置密码"
          :loading="saving"
        />
      </div>
    </template>
  </UModal>
</template>
