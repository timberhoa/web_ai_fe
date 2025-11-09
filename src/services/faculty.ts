import http from "./http"

export const facultyApi = {
  async getFacultyList(){
    const data  = await http.get('/faculties')
    return data 
  }
}