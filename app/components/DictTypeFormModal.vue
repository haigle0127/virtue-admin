<script setup lang="ts">
import * as z from 'zod'
import type { FormSubmitEvent } from '@nuxt/ui'
import type { DictTypeItem, DictTypeSavePayload } from '~/types/api'

const props = defineProps<{
  typeId?: string | null
}>()

const open = defineModel<boolean>('open', { default: false })
const emit = defineEmits<{ saved: [] }>()

const api = useApi()
const toast = useToast()

const loading = ref(false)
const saving = ref(false)

const state = reactive({
  name: '',
  type: '',
  status: '0',
  remark: ''
})

const isEdit = computed(() => !!props.typeId)
const title = computed(() => isEdit.value ? '编辑字典类型' : '新建字典类型')

const schema = z.object({
  name: z.string().trim().min(1, '请输入字典名称'),
  type: z.string().trim().min(1, '请输入字典类型').regex(/^[a-zA-Z][\w-]*$/, '以字母开头，仅支持字母、数字、下划线、短横线'),
  status: z.string(),
  remark: z.string().trim().optional()
})

type Schema = z.output<typeof schema>

watch(open, async (value) => {
  if (!value) {
    return
  }
  loading.value = true
  try {
    if (props.typeId) {
      const item = await api.request<DictTypeItem>('/admin-api/dict-type/get', { query: { id: props.typeId } })
      Object.assign(state, {
        name: item.name || '',
        type: item.type || '',
        status: item.status || '0',
        remark: item.remark || ''
      })
    } else {
      Object.assign(state, { name: '', type: '', status: '0', remark: '' })
    }
  } catch (error) {
    toast.add({
      title: '加载字典类型失败',
      description: (error as Error).message,
      color: 'error',
      icon: 'i-lucide-circle-alert'
    })
  } finally {
    loading.value = false
  }
})

async function onSubmit(event: FormSubmitEvent<Schema>) {
  saving.value = true
  try {
    const payload: DictTypeSavePayload = {
      name: event.data.name,
      type: event.data.type,
      status: event.data.status,
      remark: event.data.remark
    }
    if (props.typeId) {
      payload.id = props.typeId
    }

    await api.request(props.typeId ? '/admin-api/dict-type/update' : '/admin-api/dict-type/create', {
      method: props.typeId ? 'PUT' : 'POST',
      body: payload
    })

    toast.add({
      title: isEdit.value ? '字典类型已更新' : '字典类型已创建',
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
    :description="isEdit ? '修改字典类型的名称、状态与备注' : '字典类型是一组字典数据的集合'"
    :dismissible="!saving"
  >
    <template #body>
      <div v-if="loading" class="flex items-center justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>

      <UForm
        v-else
        id="dict-type-form"
        :schema="schema"
        :state="state"
        class="grid gap-4 sm:grid-cols-2"
        @submit="onSubmit"
      >
        <UFormField name="name" label="字典名称" required>
          <UInput v-model="state.name" placeholder="例如：用户性别" class="w-full" />
        </UFormField>

        <UFormField
          name="type"
          label="字典类型"
          required
          description="英文唯一标识"
        >
          <UInput v-model="state.type" placeholder="例如：system_user_sex" class="w-full" />
        </UFormField>

        <UFormField name="status" label="状态">
          <USelect v-model="state.status" :items="dictStatusOptions" class="w-full" />
        </UFormField>

        <UFormField name="remark" label="备注" class="sm:col-span-2">
          <UTextarea
            v-model="state.remark"
            :rows="2"
            placeholder="用途说明"
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
          form="dict-type-form"
          type="submit"
          :label="isEdit ? '保存修改' : '创建字典类型'"
          :loading="saving"
          :disabled="loading"
        />
      </div>
    </template>
  </UModal>
</template>
