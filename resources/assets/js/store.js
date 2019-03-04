import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

import cafes from './modules/cafes.js'
import users from './modules/users.js'
import brewMethods from './modules/brewMethods.js'

export default new Vuex.Store({
    modules:{
        cafes,
        users,
        brewMethods
    }
})