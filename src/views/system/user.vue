<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.name" :placeholder="$t('system.user.username')" style="width: 200px;" class="filter-item" @keyup.enter.native="handleFilter" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter(1)">
        {{ $t('table.search') }}
      </el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">
        {{ $t('table.add') }}
      </el-button>
    </div>
    <!-- 列表 -->
    <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
      <el-table-column :label="$t('system.user.avatar')" width="90px" align="center" prop="avatar">
        <template slot-scope="scope">
          <el-image v-if="scope.row.avatar !== null" :src="`${scope.row.avatar}`" style="width: 20px; height: 20px" />
          <el-image v-if="scope.row.avatar === null" src="http://upyun.haigle.cn/head.png" style="width: 20px; height: 20px" />
        </template>
      </el-table-column>
      <el-table-column align="center" :label="$t('system.user.email')" prop="email" />
      <el-table-column align="center" :label="$t('system.user.username')" prop="username" />
      <el-table-column align="center" :label="$t('system.user.phone')" prop="phone" />
      <el-table-column width="250" :label="$t('table.actions')" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button-group>
            <el-button type="primary" effect="dark" size="small" @click="handleUpdate(row)">{{ $t('table.edit') }}</el-button>
            <el-button type="danger" effect="dark" size="small" @click="handleDelete(row)">{{ $t('table.delete') }}</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="handleFilter" />
    <!-- 增加，修改-->
    <el-dialog :title="$t('system.user.'+dialogStatus)" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">
        <el-form-item :label="$t('system.user.username')" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>
        <el-form-item :label="$t('system.user.phone')" prop="phone">
          <el-input v-model="temp.phone" />
        </el-form-item>
        <el-form-item :label="$t('system.user.email')" prop="email">
          <el-input v-model="temp.email" />
        </el-form-item>
        <el-form-item :label="$t('system.user.roleTree')">
          <el-tree
            ref="tree"
            :data="roleAllList"
            show-checkbox
            highlight-current
            node-key="id"
            :props="{children: 'children', label: 'name'}"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          {{ $t('table.cancel') }}
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          {{ $t('table.confirm') }}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, save, update, remove, getRoleAllList, getUserRoleList } from '@/api/system/user'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'User',
  directives: { waves },
  components: { Pagination },
  data() {
    return {
      listLoading: true,
      listQuery: {
        name: '',
        page: 1,
        pageSize: 20
      },
      total: 0,
      list: [],
      roleAllList: [],
      roleListChecked: [],
      temp: {
        id: undefined,
        username: '',
        email: '',
        phone: '',
        roleList: []
      },
      dialogStatus: '',
      dialogFormVisible: false,
      rules: {
        username: [{ required: true, message: this.$t('system.user.usernameNotBlank'), trigger: 'blur' }],
        phone: [{ required: true, message: this.$t('system.user.phoneNotBlank'), trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      list(this.listQuery).then(response => {
        this.list = response.data.rows
        this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.1 * 1000)
      })
    },
    getRoleAllList() {
      getRoleAllList().then(resp => {
        this.roleAllList = resp.data
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        username: '',
        email: '',
        phone: '',
        roleList: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.getRoleAllList()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys([])
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.roleList = this.$refs.tree.getCheckedKeys()
          save(this.temp).then(resp => {
            if (resp.success) {
              this.getList()
              this.dialogFormVisible = false
            }
            this.$message({
              message: resp.message,
              type: resp.success ? 'success' : 'info'
            })
          })
        }
      })
    },
    handleUpdate(row) {
      const { id, username, phone, email } = row
      this.temp = { id, username, phone, email }
      this.getRoleAllList()
      this.dialogStatus = 'edit'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        getUserRoleList({ id: id }).then(resp => {
          this.$refs.tree.setCheckedKeys(resp.data)
        })
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.roleList = this.$refs.tree.getCheckedKeys()
          update(this.temp).then(resp => {
            if (resp.success) {
              this.getList()
              this.dialogFormVisible = false
            }
            this.$message({
              message: resp.message,
              type: resp.success ? 'success' : 'info'
            })
          })
        }
      })
    },
    handleDelete(row) {
      const tip = `${row.username} ${this.$t('table.delete')}`
      this.$confirm(tip, this.$t('table.prompt'), {
        confirmButtonText: this.$t('table.confirm'),
        cancelButtonText: this.$t('table.cancel'),
        type: 'warning'
      }).then(() => {
        this.list = []
        remove({ id: row.id }).then(resp => {
          this.getList()
          this.$message({
            message: resp.message,
            type: resp.success ? 'success' : 'info'
          })
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: this.$t('table.cancel')
        })
      })
    }
  }
}
</script>

<style scoped>

</style>
