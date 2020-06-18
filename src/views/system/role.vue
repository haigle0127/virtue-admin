<template>
  <div class="app-container">
    <!-- 搜索啊 -->
    <div class="filter-container">
      <el-input v-model="listQuery.name" placeholder="名称" style="width: 200px;" class="filter-item" />
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter(1)">搜索</el-button>
      <el-button v-waves class="filter-item" type="primary" icon="el-icon-edit" @click="handleCreate">添加</el-button>
    </div>
    <!-- 角色列表 -->
    <el-table :data="list" border fit highlight-current-row style="width: 100%">
      <el-table-column width="180" label="名称" prop="name" />
      <el-table-column width="180" label="别名" prop="ename" />
      <el-table-column width="180" label="简介" prop="description" />
      <el-table-column label="创建时间" prop="createTime" />
      <el-table-column width="250" label="操作" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button-group>
            <el-link type="primary" icon="el-icon-edit" @click="handleUpdate(row)">编辑</el-link>
            <el-link type="danger" icon="el-icon-delete" size="small" @click="handleDelete(row)">删除</el-link>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.pageSize" @pagination="handleFilter" />
    <!-- 增加，修改 -->
    <el-dialog :title="dialogStatus+'角色'" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="90px" style="width: 400px; margin-left:50px;">
        <el-form-item label="名称" prop="name">
          <el-input v-model="temp.name" />
        </el-form-item>
        <el-form-item label="别名" prop="ename">
          <el-input v-model="temp.ename" />
        </el-form-item>
        <el-form-item label="简介">
          <el-input v-model="temp.description" />
        </el-form-item>
        <el-form-item label="菜单列表">
          <el-tree
            ref="tree"
            :data="menuAllTree"
            show-checkbox
            highlight-current
            node-key="id"
            :props="{children: 'children', label: 'name'}"
          />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogStatus==='添加'?createData():updateData()">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { list, save, update, remove, getMenuAllTree, getRoleMenuList } from '@/api/system/role'
import waves from '@/directive/waves' // waves directive
import Pagination from '@/components/Pagination' // secondary package based on el-pagination
export default {
  name: 'Role',
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
      menuId: 0,
      menuAllTree: [],
      menuListChecked: [],
      dialogStatus: '',
      dialogFormVisible: false,
      temp: {
        id: undefined,
        name: '',
        ename: '',
        description: '',
        menuList: []
      },
      rules: {
        name: [{ required: true, message: '权限名称必填', trigger: 'blur' }],
        ename: [{ required: true, message: '别名必填', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      list(this.listQuery).then(resp => {
        this.list = resp.data.rows
        this.total = resp.data.total
        this.listQuery.page = resp.data.page
        this.listQuery.pageSize = resp.data.pageSize
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    getMenuAllTree() {
      getMenuAllTree().then(resp => {
        this.menuAllTree = resp.data
      })
    },
    handleFilter(page) {
      if (page) {
        this.listQuery.page = page
      }
      this.getList()
    },
    resetTemp() {
      this.temp = {
        id: undefined,
        name: '',
        ename: '',
        description: '',
        menuList: []
      }
    },
    handleCreate() {
      this.resetTemp()
      this.getMenuAllTree()
      this.dialogStatus = '添加'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.tree.setCheckedKeys([])
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.menuList = this.$refs.tree.getCheckedKeys()
          save(this.temp).then(resp => {
            if (resp.code === 200) {
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
      const { id, name, ename, description } = row
      this.temp = { id, name, ename, description }
      this.getMenuAllTree()
      this.dialogStatus = '修改'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        getRoleMenuList({ id: id }).then(resp => {
          this.$refs.tree.setCheckedKeys(resp.data)
        })
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.temp.menuList = this.$refs.tree.getCheckedKeys()
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
    load(tree, treeNode, resolve) {
      this.listQuery.id = tree.id
      list(this.listQuery).then(resp => {
        resolve(resp.data)
      })
    },
    handleDelete(row) {
      const tip = `删除${row.name}`
      this.$confirm(tip, '提示', {
        confirmButtonText: '确 定',
        cancelButtonText: '取 消',
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
          message: '取 消'
        })
      })
    }
  }
}
</script>
