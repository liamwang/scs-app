import Vue from 'vue'
import apollo from '../api'
import gql from 'graphql-tag'

export default {
  state: {
    list: [],
    y_position: 0,
    query: ''
  },
  actions: {
    GET_DIRECTORY: ({ commit, state }) => {
      return state.list.length
        ? Promise.resolve(state.list)
        : apollo.query({
          query: gql`
            {
              directory {
                _id
                full_name
                relationship_class
                positions {
                  title
                  department
                  primary_position
                }
                scid
                image_url
                research_areas
                email
              }
            }
          `
        }).then((res,err) => {
          if (res) {
            commit('SET_DIRECTORY', res.data)
            return res.data
          } else {
            Promise.reject(":err :directory graphql failed")
          }
        }).catch((err) => {
          console.error(err.locations)
          console.error(`GraphQL Error: ${err.message}`)
        });
      }
  },

  mutations: {
    SET_POSITION: (state, position) => {
      state.y_position = position
    },
    SET_QUERY: (state, query) => {
      state.query = query
    },
    SET_DIRECTORY: (state, data) => {

      let updatedList = []
      data.directory.forEach(function(item){

        let position = ''
        let departments = []
        let positionsArray = []
        let inactivePositionsArray = []

        item.positions.forEach((pos) => {
          departments.push(pos.department)
          positionsArray.push({ title: pos.title, primary: pos.primary_position})
        })

        positionsArray.forEach((pos) => {
          if(pos.primary)
            position = pos.title.toLowerCase()
          else
            inactivePositionsArray.push(pos)
        })

        inactivePositionsArray.forEach((pos) => {
          if(pos.position === '')
            position = pos.title.toLowerCase()
        })

        updatedList.push(Object.assign({ departments, position } , item));

      });

      state.list = updatedList;
    }
  }
}
