import { defineStore } from 'pinia'

export const useTagsViewStore = defineStore('tagsView', {
  state: () => ({
    visitedViews: [],
    cachedViews: [],
    selectedTag: {}
  }),

  getters: {
    getVisitedViews: (state) => state.visitedViews,
    getSelectedTag: (state) => state.selectedTag
  },

  actions: {
    addView(view) {
      this.addVisitedView(view)
      this.addCachedView(view)
    },

    addVisitedView(view) {
      if (this.visitedViews.some(v => v.path === view.path)) return
      this.visitedViews.push(
        Object.assign({}, view, {
          title: view.meta.title || 'no-name'
        })
      )
    },

    addCachedView(view) {
      if (this.cachedViews.includes(view.name)) return
      if (!view.meta.noCache) {
        this.cachedViews.push(view.name)
      }
    },

    setSelectedTag(view) {
      this.selectedTag = view
    },

    delView(view) {
      this.delVisitedView(view)
      this.delCachedView(view)
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews]
      }
    },

    delVisitedView(view) {
      for (const [i, v] of this.visitedViews.entries()) {
        if (v.path === view.path) {
          this.visitedViews.splice(i, 1)
          break
        }
      }
      return [...this.visitedViews]
    },

    delCachedView(view?) {
      if (view) {
        const index = this.cachedViews.indexOf(view.name)
        index > -1 && this.cachedViews.splice(index, 1)
      } else {
        this.cachedViews = []
      }
      return [...this.cachedViews]
    },

    delOthersViews(view) {
      this.delOthersVisitedViews(view)
      this.delOthersCachedViews(view)
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews]
      }
    },

    delOthersVisitedViews(view) {
      this.visitedViews = this.visitedViews.filter(v => {
        return v.meta.affix || v.path === view.path
      })
      return [...this.visitedViews]
    },

    delOthersCachedViews(view) {
      const index = this.cachedViews.indexOf(view.name)
      if (index > -1) {
        this.cachedViews = this.cachedViews.slice(index, index + 1)
      } else {
        this.cachedViews = []
      }
      return [...this.cachedViews]
    },

    delLeftViews(view) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        const affixTags = this.visitedViews.filter(v => v.meta.affix)
        const leftTags = this.visitedViews.slice(0, index)
        const keepTags = [...affixTags.filter(tag => !leftTags.some(lt => lt.path === tag.path)), ...leftTags.filter(lt => lt.path === view.path)]
        this.visitedViews = keepTags
      }
      return [...this.visitedViews]
    },

    delRightViews(view) {
      const index = this.visitedViews.findIndex(v => v.path === view.path)
      if (index > -1) {
        this.visitedViews = this.visitedViews.slice(0, index + 1)
      }
      return [...this.visitedViews]
    },

    delAllViews(view?) {
      this.delAllVisitedViews()
      this.delAllCachedViews()
      return {
        visitedViews: [...this.visitedViews],
        cachedViews: [...this.cachedViews]
      }
    },

    delAllVisitedViews() {
      const affixTags = this.visitedViews.filter(tag => tag.meta.affix)
      this.visitedViews = affixTags
      return [...this.visitedViews]
    },

    delAllCachedViews() {
      this.cachedViews = []
      return [...this.cachedViews]
    },

    updateVisitedView(view) {
      for (let v of this.visitedViews) {
        if (v.path === view.path) {
          v = Object.assign(v, view)
          break
        }
      }
    }
  }
})
